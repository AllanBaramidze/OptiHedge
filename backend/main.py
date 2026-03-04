# uv run uvicorn main:app --reload --port 8000
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from engine.strategycomparison import calculate_mvo_baseline, get_performance_paths
from engine.risk import get_risk_metrics

# --- Initialize App ---
app = FastAPI(
    title="OptiHedge API",
    description="AI-driven portfolio analysis and hedging engine.",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class PortfolioItem(BaseModel):
    symbol: str
    description: Optional[str] = ""
    quantity: float
    avgCost: float

class PortfolioRequest(BaseModel):
    holdings: List[PortfolioItem]

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "OptiHedge API is active."}

@app.post("/analyze-portfolio/")
async def analyze_portfolio(request: PortfolioRequest):
    # 1. Clean and Validate Input Symbols
    # Filter out placeholders like 'string' and convert to uppercase
    raw_symbols = [h.symbol.upper().strip() for h in request.holdings if h.symbol.lower() != "string"]
    
    if not raw_symbols:
        raise HTTPException(status_code=400, detail="No valid stock symbols provided.")

    try:
        # 2. Fetch Market Data
        # Use auto_adjust=True to get "Close" as the dividend-adjusted price directly
        raw_data = yf.download(raw_symbols + ["SPY"], period="3y", progress=False, auto_adjust=True)
    
        if raw_data.empty:
            raise HTTPException(status_code=404, detail="Yahoo Finance returned no data.")

        # Handle MultiIndex: If multiple tickers, 'Close' is a level. 
        # If single ticker, it might just be a Series or a simple DataFrame.
        if isinstance(raw_data.columns, pd.MultiIndex):
            data = raw_data['Close']
        else:
            data = raw_data[['Close']]
            # If it's a single ticker, yfinance might not use the ticker as a column name
            # We ensure it's a DataFrame with ticker columns
    
        # Check which symbols actually returned data
        valid_symbols = [s for s in raw_symbols if s in data.columns and not data[s].isnull().all()]
    
        if not valid_symbols:
            raise HTTPException(status_code=404, detail="Could not find valid price columns in downloaded data.")

        # 3. Data Pre-processing
        # We use 'Close' now because auto_adjust=True makes it the adjusted price
        returns = data[valid_symbols].pct_change().dropna()
        spy_returns = data["SPY"].pct_change().dropna()

        # 4. Portfolio Weighting (Current Allocation)
        # Calculate weights based ONLY on the valid symbols found
        current_holdings = [h for h in request.holdings if h.symbol.upper() in valid_symbols]
        total_val = sum([h.quantity * h.avgCost for h in current_holdings])
        
        user_weights = pd.Series({
            h.symbol.upper(): (h.quantity * h.avgCost) / total_val 
            for h in current_holdings
        })
        
        user_returns = (returns * user_weights).sum(axis=1)

        # 5. Engine Calculations
        mvo_weights = calculate_mvo_baseline(data[valid_symbols])
        mvo_path = get_performance_paths(returns, mvo_weights)
        risk_stats = get_risk_metrics(user_returns, spy_returns)

        # 6. Structured Response
        return {
            "metrics": {
                "var": f"{round(risk_stats['var'] * 100, 2)}%",
                "sharpe": round(risk_stats['sharpe'], 2),
                "beta": round(risk_stats['beta'], 2),
                "drawdown": f"{round(risk_stats['max_drawdown'] * 100, 2)}%"
            },
            "chart": {
                "data": [
                    {
                        "x": mvo_path.index.strftime('%Y-%m-%d').tolist(),
                        "y": (mvo_path).tolist(),
                        "name": "MVO Strategy (Backtest)",
                        "line": {"color": "#10b981", "width": 2}
                    }
                ],
                "layout": {
                    "template": "plotly_dark",
                    "paper_bgcolor": "rgba(0,0,0,0)",
                    "plot_bgcolor": "rgba(0,0,0,0)",
                    "margin": {"t": 30, "l": 30, "r": 30, "b": 30}
                }
            },
            "status": "success",
            "analyzed_assets": valid_symbols
        }

    except Exception as e:
        print(f"Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Quant Engine Error.")