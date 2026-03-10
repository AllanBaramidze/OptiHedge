# backend/engine/risk.py
import numpy as np
import pandas as pd
import datetime as dt
import quantstats as qs
import yfinance as yf
import logging
from typing import List, Dict, Any, cast

logger = logging.getLogger(__name__)

class PortfolioAnalysisResult:
    def __init__(self):
        self.SR: str = "0.0"
        self.VOL: str = "0%"
        self.CAGR: str = "0%"
        self.AL: float = 0.0
        self.BTA: float = 0.0
        self.MD: str = "0%"
        self.returns: pd.Series = pd.Series(dtype=float)
        self.benchmark: pd.Series = pd.Series(dtype=float)

class Engine:
    def __init__(self, start_date: str, portfolio: List[str], weights: List[float]):
        self.start_date = start_date
        self.portfolio = portfolio
        self.weights = weights
        self.benchmark = "^GSPC"

def get_returns(stocks: List[str], wts: List[float], start_date: str) -> pd.Series:
    try:
        # PYLANCE FIX: Explicitly cast the download result to a DataFrame
        raw_data = cast(pd.DataFrame, yf.download(stocks, start=start_date, progress=False))
        
        if raw_data.empty:
            return pd.Series(dtype=float)
        
        # Access "Adj Close" safely
        adj_close = cast(pd.DataFrame, raw_data["Adj Close"])
        
        if len(stocks) == 1:
            return cast(pd.Series, adj_close.pct_change().dropna())
        
        # PYLANCE FIX: use axis="columns" instead of 1 to avoid Literal errors
        rets = adj_close.pct_change().dropna()
        portfolio_rets = (rets * wts).sum(axis="columns")
        return cast(pd.Series, portfolio_rets)
    except Exception as e:
        logger.error(f"Return calculation error: {e}")
        return pd.Series(dtype=float)

def portfolio_analysis(engine: Engine) -> PortfolioAnalysisResult:
    result = PortfolioAnalysisResult()
    
    returns = get_returns(engine.portfolio, engine.weights, engine.start_date)
    
    # PYLANCE FIX: Use len() instead of .empty to avoid "class float" errors
    if len(returns) == 0:
        return result

    # 2. Fetch Benchmark
    raw_bench = cast(pd.DataFrame, yf.download(engine.benchmark, start=engine.start_date, progress=False))
    if raw_bench.empty:
        return result
        
    bench_rets = cast(pd.Series, raw_bench["Adj Close"].pct_change().dropna())
    
    # PYLANCE FIX: Cast list to satisfy concat signature
    combined = pd.concat([returns, bench_rets], axis="columns").dropna()
    
    # Re-verify we have data after concat
    if combined.empty:
        return result

    safe_returns = cast(pd.Series, combined.iloc[:, 0])
    safe_bench = cast(pd.Series, combined.iloc[:, 1])

    # 3. Metrics (Forcing float conversion to satisfy Pylance)
    # Sharpe
    sharpe_val = qs.stats.sharpe(safe_returns)
    result.SR = str(round(float(np.mean(sharpe_val)), 2))

    # Volatility
    vol_val = qs.stats.volatility(safe_returns)
    result.VOL = f"{round(float(np.mean(vol_val)) * 100, 2)}%"

    # CAGR
    cagr_val = qs.stats.cagr(safe_returns)
    result.CAGR = f"{round(float(np.mean(cagr_val)) * 100, 2)}%"

    # Beta / Alpha
    greeks = qs.stats.greeks(safe_returns, safe_bench)
    result.BTA = round(float(greeks['beta']), 2)
    result.AL = round(float(greeks['alpha']), 2)

    result.returns = safe_returns
    result.benchmark = safe_bench

    return result