# uv run uvicorn main:app --reload --port 8000
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, cast
import datetime as dt

# Engine Imports
from engine.risk import run_portfolio_stats, calculate_movers
from engine.news import fetch_stock_news
from engine.cache import quote_cache
from engine.providers.yfinance_provider import get_quote
from engine.providers.forex_provider import get_forex_quote, FOREX_PAIRS
from engine.sector import calculate_sector_weights 
from engine.agent import optihedge_chain, PortfolioState

app = FastAPI(title="OptiHedge Engine", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PortfolioItem(BaseModel):
    symbol: str
    quantity: float
    avgCost: float
    asset_type: str = "STOCK"
    option_type: Optional[str] = None
    strike: Optional[float] = None
    expiry: Optional[str] = None

class PortfolioRequest(BaseModel):
    holdings: List[PortfolioItem]

@app.post("/wallet/sync")
async def sync_wallet(request: PortfolioRequest):
    if not request.holdings:
        raise HTTPException(status_code=400, detail="Wallet is empty.")

    cleaned_holdings, total_basis, total_market = [], 0.0, 0.0

    for item in request.holdings:
        ticker = item.symbol.upper().strip()
        # Option Multiplier logic (Standard 100 shares per contract)
        multiplier = 100.0 if item.asset_type == "OPTION" else 1.0
        
        item_basis = item.quantity * item.avgCost * multiplier
        total_basis += item_basis
        
        market_data = await quote_cache.get(ticker)
        if not market_data:
            market_data = await get_forex_quote(ticker) if ticker in FOREX_PAIRS else await get_quote(ticker)
            if market_data: await quote_cache.set(ticker, market_data)

        price = market_data.get("price", 0.0) if market_data else 0.0
        mkt_val = item.quantity * price * multiplier
        total_market += mkt_val

        cleaned_holdings.append({
            "ticker": ticker,
            "qty": item.quantity,
            "price": round(price, 2),
            "market_value": round(mkt_val, 2),
            "asset_type": item.asset_type,
            "option_type": item.option_type, # <-- Added
            "strike": item.strike,           # <-- Added
            "expiry": item.expiry,
            "weight": 0.0 
        })

    if total_market == 0:
        raise HTTPException(status_code=500, detail="Market data unavailable.")

    # Prepare for Risk Engine
    tickers = [h["ticker"] for h in cleaned_holdings]
    weights = [h["market_value"] / total_market for h in cleaned_holdings]
    for i, h in enumerate(cleaned_holdings): h["weight"] = weights[i]

    try:
        # We now pass the full cleaned_holdings list (1st arg) and the date (2nd arg)
        start_date = (dt.date.today() - dt.timedelta(days=365)).strftime('%Y-%m-%d')
        risk = run_portfolio_stats(cleaned_holdings, start_date)
        
        # Get unique tickers so we don't fetch AAPL twice if holding stock + option
        unique_tickers = list(set([h["ticker"] for h in cleaned_holdings]))
        movers = calculate_movers(unique_tickers)
    except Exception as e:
        print(f"Engine Error: {e}")
        risk, movers = {}, []

    sector_weights = await calculate_sector_weights(cleaned_holdings)
    pnl = total_market - total_basis
    
    return {
        "status": "success", 
        "metrics": {
            "value": round(total_market, 2),
            "pnl": round(pnl, 2),
            "pnl_percent": round((pnl / total_basis * 100), 2) if total_basis > 0 else 0,
            "sharpe": risk.get("sharpe", 0.0),
            "beta": risk.get("beta", 0.0), 
            "sortino": risk.get("sortino", 0.0),
            "max_drawdown": risk.get("max_drawdown", 0.0),
            "var": risk.get("var", 0.0),
            "diversification": risk.get("diversification", 1.0),
            "calmar": risk.get("calmar", 0.0),
            "ulcer_index": risk.get("ulcer_index", 0.0),
            "skewness": risk.get("skewness", 0.0),
            "kurtosis": risk.get("kurtosis", 0.0),
            "correlation_matrix": risk.get("correlation_matrix", {})

        },
        "data": cleaned_holdings,
        "sector_weights": sector_weights,
        "ticker_list": tickers,
        "movers": movers
    }

class AIReportRequest(BaseModel):
    holdings: List[Dict[str, Any]]
    metrics: Dict[str, Any]

@app.post("/api/generate-report")
def generate_ai_report(request: AIReportRequest):
    """
    Takes the already-calculated portfolio metrics and holdings from the frontend
    and runs them through the LangGraph AI pipeline to generate a Markdown report.
    """
    # Note: We use `def` instead of `async def` here. Because our LangGraph 
    # uses synchronous `requests.get` for Polymarket, standard `def` tells FastAPI 
    # to safely run this in a background thread without freezing your server!
    try:
        initial_state = cast(PortfolioState, {
            "holdings": request.holdings,
            "metrics": request.metrics,
            "red_flags": [],
            "risk_overview": "",
            "common_hedges": [],
            "creative_hedges": [],
            "polymarket_data": [],
            "hypothetical_risks": "",
            "final_report": ""
        })
        
        # Trigger the AI Agents
        result = optihedge_chain.invoke(initial_state)
        
        return {
            "status": "success",
            "report": result.get("final_report", "Failed to generate report."),
            "polymarket_data": result.get("polymarket_data", [])
        }
        
    except Exception as e:
        print(f"AI Engine Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI Hedge Report.")
    
class NewsRequest(BaseModel):
    tickers: List[str]

@app.post("/api/news")
async def get_portfolio_news(request: NewsRequest):
    if not request.tickers:
        return {"news": []}
    
    # We pass the list of tickers from the wallet
    news_data = fetch_stock_news(request.tickers, limit=12)
    return {"status": "success", "news": news_data}