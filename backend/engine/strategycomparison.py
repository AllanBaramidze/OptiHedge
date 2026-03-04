import pandas as pd
import numpy as np
from pypfopt import expected_returns, risk_models, EfficientFrontier

def calculate_mvo_baseline(adj_close_df: pd.DataFrame):
    """
    Calculates the Mean-Variance Optimal weights for the given assets.
    """
    # 1. Calculate expected returns and sample covariance
    mu = expected_returns.mean_historical_return(adj_close_df)
    S = risk_models.sample_cov(adj_close_df)

    # 2. Optimize for maximal Sharpe ratio
    ef = EfficientFrontier(mu, S)
    try:
        raw_weights = ef.max_sharpe()
        cleaned_weights = ef.clean_weights()
        return cleaned_weights
    except Exception:
        # Fallback to equal weights if optimization fails
        n = len(adj_close_df.columns)
        return {col: 1.0/n for col in adj_close_df.columns}

def get_performance_paths(returns_df: pd.DataFrame, portfolio_weights: dict):
    """
    Generates cumulative return paths for comparison.
    """
    # Convert weights dict to a series
    weights_series = pd.Series(portfolio_weights)
    
    # Portfolio Returns
    port_returns = (returns_df * weights_series).sum(axis=1)
    
    # Cumulative Growth (Starting at 100)
    cum_growth = (1 + port_returns).cumprod() * 100
    
    return cum_growth