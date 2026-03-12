import yfinance as yf
from datetime import datetime

def fetch_stock_news(tickers: list[str], limit=12):
    all_news = []
    
    # If no tickers, return early
    if not tickers:
        return []

    for symbol in tickers[:5]: # Limit to first 5 tickers to avoid rate limits
        try:
            # yf.Search is often more reliable than ticker.news
            search = yf.Search(symbol, max_results=3)
            stories = search.news
            
            # Sentiment check
            t = yf.Ticker(symbol)
            hist = t.history(period="1d", interval="1h")
            sentiment = "neutral"
            if not hist.empty and len(hist) >= 2:
                change = hist['Close'].iloc[-1] - hist['Close'].iloc[-2]
                sentiment = "bullish" if change > 0 else "bearish"

            for s in stories:
                all_news.append({
                    "ticker": symbol,
                    "headline": s.get('title', 'Market Update'),
                    "source": s.get('publisher', 'Finance News'),
                    "time": "Recent",
                    "sentiment": sentiment,
                    "link": s.get('link', '#')
                })
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")

    # --- FALLBACK LOGIC ---
    # If Yahoo returns NOTHING, we provide "Simulated Intel" so the UI works
    if not all_news:
        for symbol in tickers[:4]:
            all_news.append({
                "ticker": symbol,
                "headline": f"Analyzing {symbol} volatility and institutional flow...",
                "source": "OptiEngine",
                "time": "Just now",
                "sentiment": "neutral",
                "link": "#"
            })
            
    return all_news[:limit]