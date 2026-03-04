from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import yfinance as yf
import pandas as pd
import numpy as np

# --- Initialize App ---
app = FastAPI(
    title="OptiHedge API",
    description="AI-driven portfolio analysis and hedging engine.",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (Strict Typing) ---
class PortfolioItem(BaseModel):
    symbol: str
    description: str
    quantity: float
    avgCost: float

class PortfolioRequest(BaseModel):
    holdings: List[PortfolioItem]

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "OptiHedge API is running."}

@app.post("/analyze-portfolio/")
async def analyze_portfolio(payload: PortfolioRequest):
    holdings = payload.holdings

    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio is empty.")

    # 1. Extract tickers and calculate current portfolio weights
    tickers = [item.symbol for item in holdings]
    total_value = sum(item.quantity * item.avgCost for item in holdings)
    
    #Debugging logs
    print(f"\n--- NEW ANALYSIS REQUEST ---")
    print(f"Received {len(holdings)} assets: {tickers}")
    print(f"Total Portfolio Value: ${total_value:,.2f}\n")

    weights = {
        item.symbol: (item.quantity * item.avgCost) / total_value 
        for item in holdings
    }

    try:
        # 2. Fetch 1 year of historical daily closing prices
        historical_data = yf.download(tickers, period="1y", progress=False)['Close']
        
        # If only one ticker is passed, yfinance returns a Series. Force it to a DataFrame.
        if isinstance(historical_data, pd.Series):
            historical_data = historical_data.to_frame(name=tickers[0])

        # 3. Calculate daily returns & volatility
        daily_returns = historical_data.pct_change().dropna()
        annual_volatility = daily_returns.std() * np.sqrt(252)

        # 4. Return unified data to Next.js
        return {
            "status": "success",
            "portfolio_summary": {
                "total_positions": len(holdings),
                "total_value": total_value,
                "assets": tickers,
                "current_weights": weights
            },
            "market_data": {
                "trading_days_analyzed": len(daily_returns),
                "annualized_volatility": annual_volatility.to_dict()
            },
            "ai_analysis": {
                "risk_score": 75, # Mocked until DL model is integrated
                "diversification_warning": True,
                "suggested_hedge": f"Consider allocating ${(total_value * 0.15):,.2f} to inverse ETFs or defensive sectors to reduce drawdown risk."
            }
        }

    except Exception as e:
        print(f"Data fetching error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market data from yfinance.")