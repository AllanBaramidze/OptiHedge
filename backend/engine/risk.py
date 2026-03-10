# backend/engine/risk.py
import pandas as pd
import numpy as np
import quantstats as qs
import yfinance as yf
import logging

logger = logging.getLogger(__name__)

def _safe_float(val, default=0.0):
    """Safely converts QuantStats outputs (Series, numpy floats, NaNs) to standard floats."""
    try:
        f_val = float(np.mean(val))
        return f_val if not pd.isna(f_val) else default
    except Exception:
        return default

def run_portfolio_stats(tickers: list[str], weights: list[float], start_date: str) -> dict:
    """Fetches data and uses QuantStats to calculate institutional risk metrics."""
    
    # Default fallback dictionary in case of complete failure
    default_metrics = {
        "sharpe": 0.0, "beta": 0.0, "sortino": 0.0, "max_drawdown": 0.0, 
        "var": 0.0, "calmar": 0.0, "ulcer_index": 0.0, "skewness": 0.0, 
        "kurtosis": 0.0, "diversification": 1.0
    }

    try:
        # 1. Fetch Portfolio Data
        raw_data = yf.download(tickers, start=start_date, progress=False)
        if raw_data is None or raw_data.empty:
            return default_metrics
            
        # Safely extract Close/Adj Close
        data = raw_data["Adj Close"] if "Adj Close" in raw_data.columns else raw_data["Close"]
        
        if len(tickers) == 1:
            data_1d = pd.DataFrame(data).iloc[:, 0]
            port_rets = data_1d.pct_change().fillna(0) * weights[0]
            div_score = 1.0 # 1 asset = no diversification
        else:
            rets = pd.DataFrame(data).ffill().pct_change().fillna(0)
            weight_dict = dict(zip(tickers, weights))
            aligned_weights = [weight_dict.get(str(col), 0.0) for col in rets.columns]
            
            port_rets = (rets * aligned_weights).sum(axis=1)
            
            # Custom Math: Diversification Ratio (Weighted Ind. Vol / Portfolio Vol)
            try:
                ind_vols = rets.std() * np.sqrt(252)
                weighted_ind_vol = (ind_vols * aligned_weights).sum()
                port_vol = port_rets.std() * np.sqrt(252)
                div_score = float(weighted_ind_vol / port_vol) if port_vol > 0 else 1.0
            except Exception:
                div_score = 1.0

        port_rets.index = pd.to_datetime(port_rets.index).tz_localize(None)

        # 2. Fetch Benchmark Data (^GSPC = S&P 500)
        raw_bench = yf.download("^GSPC", start=start_date, progress=False)
        if raw_bench is None or raw_bench.empty:
            return default_metrics
            
        bench_data = raw_bench["Adj Close"] if "Adj Close" in raw_bench.columns else raw_bench["Close"]
        bench_1d = pd.DataFrame(bench_data).iloc[:, 0]
            
        bench_rets = bench_1d.pct_change().dropna()
        bench_rets.index = pd.to_datetime(bench_rets.index).tz_localize(None)

        # 3. Let QuantStats do the heavy lifting
        greeks = qs.stats.greeks(port_rets, bench_rets)
        try:
            if isinstance(greeks, pd.Series):
                beta = float(greeks.get('beta', 0.0))
            elif isinstance(greeks, pd.DataFrame):
                beta = float(greeks['beta'].iloc[0])
            else:
                beta = 0.0
        except Exception:
            beta = 0.0

        return {
            "sharpe": round(_safe_float(qs.stats.sharpe(port_rets)), 2),
            "beta": round(beta, 2),
            "sortino": round(_safe_float(qs.stats.sortino(port_rets)), 2),
            "max_drawdown": round(_safe_float(qs.stats.max_drawdown(port_rets)), 4), # 4 decimals for accurate %
            "var": round(_safe_float(qs.stats.value_at_risk(port_rets)), 4),
            "calmar": round(_safe_float(qs.stats.calmar(port_rets)), 2),
            "ulcer_index": round(_safe_float(qs.stats.ulcer_index(port_rets)), 4),
            "skewness": round(_safe_float(qs.stats.skew(port_rets)), 2),
            "kurtosis": round(_safe_float(qs.stats.kurtosis(port_rets)), 2),
            "diversification": round(div_score, 2)
        }

    except Exception as e:
        logger.error(f"Risk Engine Error: {e}")
        return default_metrics

def calculate_movers(tickers: list[str]) -> dict:
    """Calculates top gainers and losers across multiple timeframes with safety fallbacks."""
    timeframes = {"1D": 1, "1W": 5, "1M": 21, "6M": 126, "1Y": 252, "10Y": 2520}
    movers = {tf: [] for tf in timeframes.keys()}
    
    if not tickers:
        return movers
        
    try:
        # Use period="max" to ensure we get data even for newer stocks
        raw_data = yf.download(tickers, period="max", progress=False)
        if raw_data is None or raw_data.empty:
            return movers
            
        data = raw_data["Adj Close"] if "Adj Close" in raw_data.columns else raw_data["Close"]
        
        # Ensure we are working with a DataFrame even for 1 ticker
        df = pd.DataFrame(data)
        if len(tickers) == 1:
            df.columns = tickers
            
        df = df.ffill()
        
        for tf, days in timeframes.items():
            current_tf_list = []
            for ticker in tickers:
                if ticker not in df.columns:
                    continue
                
                series = df[ticker].dropna()
                if len(series) < 2:
                    continue
                
                # Get the latest price and the price X days ago
                latest_price = series.iloc[-1]
                
                # If we don't have enough history for the TF, take the oldest available
                lookback_idx = max(0, len(series) - days - 1)
                past_price = series.iloc[lookback_idx]
                
                if past_price > 0:
                    change = (latest_price - past_price) / past_price
                    current_tf_list.append({"ticker": ticker, "value": float(change)})
            
            # Sort movers by performance (highest first)
            movers[tf] = sorted(current_tf_list, key=lambda x: x["value"], reverse=True)
            
    except Exception as e:
        logger.error(f"Movers Engine Error: {e}")
        
    return movers
    """Calculates top gainers and losers across multiple timeframes."""
    # Trading days roughly equal to the timeframes
    timeframes = {"1D": 1, "1W": 5, "1M": 21, "6M": 126, "1Y": 252, "10Y": 2520}
    movers = {tf: [] for tf in timeframes.keys()}
    
    if not tickers:
        return movers
        
    try:
        # Fetch up to 10 years of data
        raw_data = yf.download(tickers, period="10y", progress=False)
        if raw_data is None or raw_data.empty:
            return movers
            
        data = raw_data["Adj Close"] if "Adj Close" in raw_data.columns else raw_data["Close"]
        
        # Force 2D DataFrame for safety
        if len(tickers) == 1:
            data = pd.DataFrame(data)
            data.columns = tickers
            
        data = data.ffill()
        latest = data.iloc[-1]
        
        for tf, days in timeframes.items():
            # Check if we have enough historical data for this timeframe
            if len(data) > days:
                past = data.iloc[-days - 1]
            elif len(data) > 0:
                past = data.iloc[0] # Fallback to max available if stock is newer than 10y
            else:
                continue
                
            rets = ((latest - past) / past).dropna().sort_values(ascending=False)
            movers[tf] = [{"ticker": str(k), "value": float(v)} for k, v in rets.items()]
            
    except Exception as e:
        logger.error(f"Movers Engine Error: {e}")
        
    return movers