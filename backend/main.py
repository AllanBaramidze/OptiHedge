# uv run uvicorn main:app --reload --port 8000
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime as dt
from engine.risk import Engine, portfolio_analysis
from engine.cache import quote_cache
from engine.providers.yfinance_provider import get_quote
from engine.providers.forex_provider import get_forex_quote, FOREX_PAIRS

app = FastAPI(
    title="OptiHedge Engine",
    description="Real-time portfolio sync and risk analytics gateway.",
    version="2.1.0"
)

# Security / CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class PortfolioItem(BaseModel):
    symbol: str = Field(..., json_schema_extra={"example": "AAPL"})
    quantity: float = Field(..., gt=0)
    avgCost: float = Field(..., gt=0)

class PortfolioRequest(BaseModel):
    holdings: List[PortfolioItem]

@app.post("/wallet/sync")
async def sync_wallet(request: PortfolioRequest):
    """
    Synchronizes portfolio with live market data and runs risk engine analysis.
    """
    if not request.holdings:
        raise HTTPException(status_code=400, detail="Wallet is empty.")

    cleaned_holdings = []
    total_basis = 0.0
    total_market = 0.0

    # 1. LIVE PRICE FETCHING & BASIS CALCULATION
    for item in request.holdings:
        ticker = item.symbol.upper().strip()
        basis = item.quantity * item.avgCost
        total_basis += basis
        
        # Cache-first fetching logic
        market_data = await quote_cache.get(ticker)
        if not market_data:
            # Route to Forex or Stock provider
            if ticker in FOREX_PAIRS:
                market_data = await get_forex_quote(ticker)
            else:
                market_data = await get_quote(ticker)
            
            if market_data:
                await quote_cache.set(ticker, market_data)

        price = market_data.get("price", 0.0) if market_data else 0.0
        mkt_val = item.quantity * price
        total_market += mkt_val

        cleaned_holdings.append({
            "ticker": ticker,
            "qty": item.quantity,
            "cost": item.avgCost,
            "price": round(price, 2),
            "market_value": round(mkt_val, 2),
            "weight": 0.0 # Will be updated after total_market is finalized
        })

    if total_market == 0:
        raise HTTPException(status_code=500, detail="Could not fetch market data for assets.")

    # 2. RISK ENGINE PREPARATION
    tickers = []
    weights = []
    
    for h in cleaned_holdings:
        # Calculate real-time weights for the Risk Engine
        h["weight"] = h["market_value"] / total_market
        tickers.append(h["ticker"])
        weights.append(h["weight"])

    # 3. RUN RISK ANALYSIS (1-Year Lookback)
    try:
        start_date = (dt.date.today() - dt.timedelta(days=365)).strftime('%Y-%m-%d')
        risk_engine = Engine(
            start_date=start_date,
            portfolio=tickers,
            weights=weights
        )
        analysis = portfolio_analysis(risk_engine)
        
        sharpe = analysis.SR
        beta = analysis.BTA
        volatility = analysis.VOL
        max_drawdown = analysis.MD
    except Exception as e:
        print(f"Risk Engine Error: {e}")
        sharpe, beta, volatility, max_drawdown = "0.0", 0.0, "0%", "0%"

    # 4. FINAL PAYLOAD CONSTRUCTION
    pnl = total_market - total_basis
    
    return {
        "status": "ready",
        "metrics": {
            "value": round(total_market, 2),
            "pnl": round(pnl, 2),
            "pnl_percent": round((pnl / total_basis * 100), 2) if total_basis > 0 else 0,
            "count": len(cleaned_holdings),
            "sharpe": sharpe,
            "beta": beta,
            "volatility": volatility,
            "max_drawdown": max_drawdown
        },
        "data": cleaned_holdings,
        "ticker_list": tickers
    }

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "OptiHedge Risk v2.1"}