import yfinance as yf,asyncio
from typing import List, Dict, Any

# Mem Cache for sectors
_SECTOR_CACHE: Dict[str, str] = {}

def _fetch_sector_sync(ticker: str) -> str:
    """Synchronous function to hit yfinance, designed to be run in a thread."""
    if ticker in _SECTOR_CACHE:
        return _SECTOR_CACHE[ticker]
        
    try:
        # Quick catch for common Forex/Crypto formats to avoid useless yfinance calls
        if "=" in ticker or "-" in ticker:
            sector = "Currency/Crypto"
        else:
            info = yf.Ticker(ticker).info
            sector = info.get('sector', 'Other/Unknown')
            
        _SECTOR_CACHE[ticker] = sector
        return sector
    except Exception as e:
        print(f"Warning: Failed to fetch sector for {ticker} - {e}")
        return 'Other/Unknown'

async def calculate_sector_weights(cleaned_holdings: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Takes the cleaned holdings (which already have 'weight' calculated) 
    and groups them by sector asynchronously.
    """
    sector_weights = {}
    loop = asyncio.get_running_loop()
    
    for h in cleaned_holdings:
        ticker = h["ticker"]
        # Convert the decimal weight (e.g., 0.45) to a percentage (45.0) for the UI
        weight_pct = h["weight"] * 100 
        
        # Run the blocking yfinance call in a background thread so FastAPI stays fast
        sector = await loop.run_in_executor(None, _fetch_sector_sync, ticker)
        
        sector_weights[sector] = sector_weights.get(sector, 0.0) + weight_pct
        
    # Round final values to 2 decimal places for a clean JSON payload
    return {k: round(v, 2) for k, v in sector_weights.items()}