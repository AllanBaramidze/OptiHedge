# app/providers/yfinance_provider.py
import yfinance as yf
import asyncio
import pandas as pd  # <--- Added this to fix "pd is not defined"
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

async def get_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """Async wrapper around yfinance to fetch last 1m bar close."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_yf, symbol)

def _sync_yf(symbol: str) -> Optional[Dict[str, Any]]:
    try:
        ticker = yf.Ticker(symbol)
        # try to fetch 1d 1m history
        data = ticker.history(period="1d", interval="1m")
        if data.empty:
            return None
        
        last = data.iloc[-1]
        price = float(last['Close'])
        
        # PYLANCE FIX: Explicitly check for Timestamp type to allow method access
        ts_name = last.name
        if isinstance(ts_name, pd.Timestamp):
            ts = ts_name.to_pydatetime().isoformat()
        else:
            ts = str(ts_name)
            
        return {
            "symbol": symbol.upper(), 
            "price": price, 
            "timestamp": ts
        }
    except Exception as e:
        logger.error(f"Quote fetch error for {symbol}: {e}")
        return None

async def get_historical(symbol: str, period: str = "1d") -> Optional[List[Dict[str, Any]]]:
    """Fetch historical data for a symbol."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_historical, symbol, period)

def _sync_historical(symbol: str, period: str) -> Optional[List[Dict[str, Any]]]:
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period)
        if data.empty:
            return None
            
        historical = []
        for idx, row in data.iterrows():
            # PYLANCE FIX: Narrow the type of 'idx' from Hashable to Timestamp
            if isinstance(idx, pd.Timestamp):
                ts = idx.isoformat()
            else:
                ts = str(idx)
            
            historical.append({
                "timestamp": ts,
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        return historical
    except Exception as e:
        logger.error(f"Historical data error for {symbol}: {e}")
        return None