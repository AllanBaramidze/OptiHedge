import yfinance as yf

def fetch_stock_news(symbol: str, limit=5):
    """
    Fetches the last 5 headlines from Yahoo Finance for a specific ticker.
    """
    ticker = yf.Ticker(symbol)
    news = ticker.news
    # Extract just the titles from the JSON response
    headlines = [item['title'] for item in news[:limit]]
    return headlines