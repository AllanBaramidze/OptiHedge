import quantstats as qs
import pandas as pd
import numpy as np

def get_risk_metrics(returns: pd.Series, benchmark: pd.Series):
    """
    Calculates key performance indicators using a mix of QuantStats 
    and manual NumPy math to avoid naming collisions.
    """
    # 1. Align indices to ensure we are comparing the same dates
    returns, benchmark = returns.align(benchmark, join='inner')
    
    # 2. Manual Beta Calculation (Covariance / Variance)
    # This avoids the 'function object has no attribute beta' error entirely
    matrix = np.cov(returns, benchmark)
    beta_val = matrix[0, 1] / matrix[1, 1] if matrix[1, 1] != 0 else 0

    # 3. Use QuantStats for other metrics
    # Ensure Sharpe is a float, not a series
    sharpe_val = qs.stats.sharpe(returns)
    if isinstance(sharpe_val, pd.Series):
        sharpe_val = float(sharpe_val.iloc[0])
    
    # Ensure VaR (Value at Risk) is a float
    var_val = qs.stats.var(returns)
    if isinstance(var_val, pd.Series):
        var_val = float(var_val.iloc[0])

    metrics = {
        "sharpe": round(float(sharpe_val), 2),
        "volatility": round(float(qs.stats.volatility(returns)), 4),
        "beta": round(float(beta_val), 2),
        "var": round(float(var_val), 4),
        "max_drawdown": round(float(qs.stats.max_drawdown(returns)), 4)
    }
    
    return metrics