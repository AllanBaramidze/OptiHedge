# uv run uvicorn main:app --reload --port 8000
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import datetime as dt

# Engine Imports
from engine.risk import run_portfolio_stats, calculate_movers
from engine.cache import quote_cache
from engine.providers.yfinance_provider import get_quote
from engine.providers.forex_provider import get_forex_quote, FOREX_PAIRS
from engine.sector import calculate_sector_weights 

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
    Synchronizes portfolio with live market data, runs risk engine, and calculates sectors.
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
            "weight": 0.0 
        })

    if total_market == 0:
        raise HTTPException(status_code=500, detail="Could not fetch market data for assets.")

    # 2. PREPARE WEIGHTS FOR ENGINES
    tickers = []
    weights = []
    for h in cleaned_holdings:
        h["weight"] = h["market_value"] / total_market
        tickers.append(h["ticker"])
        weights.append(h["weight"])

    # 3. RUN RISK ANALYSIS (Catching all 8 new institutional metrics)
    try:
        start_date = (dt.date.today() - dt.timedelta(days=365)).strftime('%Y-%m-%d')
        
        risk_metrics = run_portfolio_stats(tickers, weights, start_date)
        movers_data = calculate_movers(tickers)
        
        sharpe = risk_metrics.get("sharpe", 0.0)
        beta = risk_metrics.get("beta", 0.0)
        sortino = risk_metrics.get("sortino", 0.0)
        max_drawdown = risk_metrics.get("max_drawdown", 0.0)
        var = risk_metrics.get("var", 0.0)
        calmar = risk_metrics.get("calmar", 0.0)
        ulcer_index = risk_metrics.get("ulcer_index", 0.0)
        skewness = risk_metrics.get("skewness", 0.0)
        kurtosis = risk_metrics.get("kurtosis", 0.0)
        diversification = risk_metrics.get("diversification", 1.0)
        
    except Exception as e:
        print(f"Risk Engine Error: {e}")
        sharpe = beta = sortino = max_drawdown = var = calmar = ulcer_index = skewness = kurtosis = 0.0
        diversification = 1.0

    # 4. RUN SECTOR ANALYSIS
    try:
        sector_weights = await calculate_sector_weights(cleaned_holdings)
    except Exception as e:
        print(f"Sector Analysis Error: {e}")
        sector_weights = {}
    

    # 5. FINAL PAYLOAD CONSTRUCTION
    pnl = total_market - total_basis
    
    return {
        "status": "success", 
        "metrics": {
            "value": round(total_market, 2),
            "pnl": round(pnl, 2),
            "pnl_percent": round((pnl / total_basis * 100), 2) if total_basis > 0 else 0,
            "count": len(cleaned_holdings),
            
            # The core JSON dictionary your React widgets will look up by "type"
            "sharpe": sharpe,
            "beta": beta, 
            "sortino": sortino,
            "max_drawdown": max_drawdown,
            "var": var,
            "calmar": calmar,
            "ulcer_index": ulcer_index,
            "skewness": skewness,
            "kurtosis": kurtosis,
            "diversification": diversification
        },
        "data": cleaned_holdings,
        "sector_weights": sector_weights,
        "ticker_list": tickers,
        "movers": movers_data
    }

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "OptiHedge Risk v2.1"}