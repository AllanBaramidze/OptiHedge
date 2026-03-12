# backend/engine/risk.py
import pandas as pd
import numpy as np
import quantstats as qs
import yfinance as yf
import logging
import time
import datetime as dt
import os
from polygon import RESTClient

logger = logging.getLogger(__name__)

POLYGON_KEY = os.getenv("POLYGON_KEY")
polygon_client = RESTClient(POLYGON_KEY) if POLYGON_KEY else None

def build_occ_symbol(symbol: str, expiry: str, opt_type: str, strike: float) -> str:
    """Converts standard option details into Polygon's OCC format (e.g., O:AAPL240119C00150000)"""
    try:
        date_str = expiry.replace("-", "")[2:]
        type_char = "C" if "C" in opt_type.upper() else "P"
        strike_str = f"{int(float(strike) * 1000):08d}"
        return f"O:{symbol.upper()}{date_str}{type_char}{strike_str}"
    except Exception:
        return ""

def _safe_float(val, default=0.0):
    """Safely converts QuantStats outputs to standard floats."""
    try:
        f_val = float(np.mean(val))
        return f_val if not pd.isna(f_val) else default
    except Exception:
        return default

def run_portfolio_stats(holdings: list[dict], start_date: str) -> dict:
    """Fetches equity data from yfinance and options data from Polygon, with Delta-Normal fallback."""
    default_metrics = {
        "sharpe": 0.0, "beta": 0.0, "sortino": 0.0, "max_drawdown": 0.0, 
        "var": 0.0, "calmar": 0.0, "ulcer_index": 0.0, "skewness": 0.0, 
        "kurtosis": 0.0, "diversification": 1.0
    }

    if not holdings:
        return default_metrics
        
    tickers = list(set([str(h["ticker"]) for h in holdings]))

    try:
        # 1. Fetch Underlying Equity Data (YFinance)
        raw_data = yf.download(tickers, start=start_date, progress=False)
        if raw_data is None or raw_data.empty: 
            return default_metrics
            
        data = raw_data["Adj Close"] if "Adj Close" in raw_data.columns else raw_data["Close"]
        
        if isinstance(data, pd.Series):
            data = data.to_frame(name=tickers[0])
            
        rets = data.ffill().pct_change().fillna(0.0)
        
        correlation_matrix = rets.corr().to_dict()
        
        # 2. Simulate Returns with Polygon Option Data + Fallback
        port_rets = pd.Series(0.0, index=rets.index)
        weighted_ind_vols = []
        end_date = dt.date.today().strftime('%Y-%m-%d')
        
        for h in holdings:
            ticker = str(h["ticker"])
            weight = float(h.get("weight", 0.0))
            if weight == 0: 
                continue
            
            asset_ret = None
            
            if h.get("asset_type") == "OPTION" and polygon_client:
                expiry = str(h.get("expiry") or "")
                opt_type = str(h.get("option_type") or "")
                strike = float(h.get("strike") or 0.0)
                
                if expiry and opt_type and strike > 0:
                    occ_symbol = build_occ_symbol(ticker, expiry, opt_type, strike)
                    
                    try:
                        aggs = []
                        raw_aggs = polygon_client.list_aggs(occ_symbol, 1, "day", start_date, end_date)
                        
                        for item in raw_aggs:
                            ts = getattr(item, "timestamp", None)
                            c_price = getattr(item, "close", None)
                            if ts is not None and c_price is not None:
                                aggs.append({"date": ts, "close": c_price})
                        
                        if aggs:
                            df_opt = pd.DataFrame(aggs)
                            df_opt["date"] = pd.to_datetime(df_opt["date"], unit="ms").dt.tz_localize(None)
                            df_opt.set_index("date", inplace=True)
                            asset_ret = df_opt["close"].pct_change().reindex(rets.index).fillna(0.0)
                            
                        # Respect Polygon free plan limit
                        time.sleep(12.5) 
                        
                    except Exception as e:
                        logger.warning(f"Polygon API Error for {occ_symbol}: {e}. Falling back to Delta-Normal.")
            
            # --- DELTA-NORMAL FALLBACK OR STANDARD STOCK ---
            if asset_ret is None:
                base_ret = rets.get(ticker)
                
                if base_ret is not None:
                    if h.get("asset_type") == "OPTION":
                        underlying_series = data.get(ticker)
                        underlying_price = float(underlying_series.iloc[-1]) if underlying_series is not None else 0.0
                        option_price = float(h.get("price", 0.0))
                        
                        if option_price > 0 and underlying_price > 0:
                            leverage = 0.5 * (underlying_price / option_price)
                            leverage = float(min(max(leverage, 1.0), 30.0))
                        else:
                            leverage = 1.0
                            
                        asset_ret = base_ret.copy() * leverage
                    else:
                        asset_ret = base_ret.copy()
                else:
                    asset_ret = pd.Series(0.0, index=rets.index)
                
            port_rets += asset_ret * weight
            weighted_ind_vols.append(asset_ret.std() * np.sqrt(252) * weight)

        port_rets.index = pd.to_datetime(port_rets.index).tz_localize(None)

        # Diversification Math
        try:
            port_vol = port_rets.std() * np.sqrt(252)
            div_score = float(sum(weighted_ind_vols) / port_vol) if port_vol > 0 else 1.0
        except Exception:
            div_score = 1.0

        # 3. Benchmark Data
        raw_bench = yf.download("^GSPC", start=start_date, progress=False)
        if raw_bench is not None and not raw_bench.empty:
            bench_data = raw_bench["Adj Close"] if "Adj Close" in raw_bench.columns else raw_bench["Close"]
            bench_rets = pd.DataFrame(bench_data).iloc[:, 0].pct_change().dropna()
            bench_rets.index = pd.to_datetime(bench_rets.index).tz_localize(None)
            greeks = qs.stats.greeks(port_rets, bench_rets)
            beta = float(greeks.get('beta', 0.0)) if isinstance(greeks, pd.Series) else 0.0
        else:
            beta = 0.0

        # 4. Compile Metrics
        return {
            "sharpe": round(_safe_float(qs.stats.sharpe(port_rets)), 2),
            "beta": round(beta, 2),
            "sortino": round(_safe_float(qs.stats.sortino(port_rets)), 2),
            "max_drawdown": round(_safe_float(qs.stats.max_drawdown(port_rets)), 4), 
            "var": round(_safe_float(qs.stats.value_at_risk(port_rets)), 4),
            "calmar": round(_safe_float(qs.stats.calmar(port_rets)), 2),
            "ulcer_index": round(_safe_float(qs.stats.ulcer_index(port_rets)), 4),
            "skewness": round(_safe_float(qs.stats.skew(port_rets)), 2),
            "kurtosis": round(_safe_float(qs.stats.kurtosis(port_rets)), 2),
            "diversification": round(div_score, 2),
            "correlation_matrix": correlation_matrix

            
        }

    except Exception as e:
        logger.error(f"Risk Engine Error: {e}")
        return default_metrics

def calculate_movers(tickers: list[str]) -> dict:
    """Calculates top gainers and losers across multiple timeframes."""
    timeframes = {"1D": 1, "1W": 5, "1M": 21, "6M": 126, "1Y": 252, "10Y": 2520}
    movers = {tf: [] for tf in timeframes.keys()}
    
    if not tickers:
        return movers
        
    try:
        raw_data = yf.download(tickers, period="10y", progress=False)
        if raw_data is None or raw_data.empty:
            return movers
            
        data = raw_data["Adj Close"] if "Adj Close" in raw_data.columns else raw_data["Close"]
        
        if len(tickers) == 1:
            data = pd.DataFrame(data)
            data.columns = tickers
            
        data = data.ffill()
        latest = data.iloc[-1]
        
        for tf, days in timeframes.items():
            if len(data) > days:
                past = data.iloc[-days - 1]
            elif len(data) > 0:
                past = data.iloc[0] 
            else:
                continue
                
            rets = ((latest - past) / past).dropna().sort_values(ascending=False)
            movers[tf] = [{"ticker": str(k), "value": float(v)} for k, v in rets.items()]
            
    except Exception as e:
        logger.error(f"Movers Engine Error: {e}")
        
    return movers