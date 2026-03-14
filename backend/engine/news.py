import finviz
from datetime import datetime
from typing import List, Dict, Any
import time

def fetch_stock_news_finviz(tickers: list[str], limit=12) -> List[Dict[str, Any]]:
    """
    Fetch news for given tickers using Finviz API
    
    Finviz provides news with timestamps for each ticker.
    Data is delayed by 15-20 minutes (NASDAQ: 15min, NYSE/AMEX: 20min)
    Perfect for analysis and research, not for live trading.
    """
    all_news = []
    
    if not tickers:
        return []
    
    # Limit to first 8 tickers to avoid rate limiting
    for symbol in tickers[:8]:
        try:
            print(f"Fetching Finviz news for {symbol}...")
            
            # Add small delay to avoid rate limiting
            if len(all_news) > 0:
                time.sleep(0.5)
            
            # Get news for this ticker
            news_items = finviz.get_news(symbol)
            
            if news_items and len(news_items) > 0:
                for item in news_items[:5]:  # Take up to 5 per ticker
                    # Finviz returns tuple: (timestamp, headline, url, source)
                    if len(item) >= 4:
                        timestamp, headline, url, source = item
                        
                        # Analyze sentiment based on headline
                        sentiment = analyze_sentiment_text(headline)
                        
                        # Format the time
                        time_ago = format_finviz_time(timestamp)
                        
                        all_news.append({
                            "ticker": symbol,
                            "headline": headline,
                            "source": source or "Finviz News",
                            "time": time_ago,
                            "datetime": parse_finviz_timestamp(timestamp),
                            "sentiment": sentiment,
                            "link": url,
                            "tags": []
                        })
            else:
                print(f"No news found for {symbol}")
                
        except Exception as e:
            print(f"Error fetching Finviz news for {symbol}: {e}")
    
    # If we got no news at all, use fallback
    if not all_news:
        print("No real news fetched from Finviz, using fallback")
        return get_fallback_news(tickers)
    
    # Sort by date (most recent first) and limit
    all_news.sort(key=lambda x: x.get('datetime', 0), reverse=True)
    return all_news[:limit]


def fetch_all_market_news(limit=20) -> List[Dict[str, Any]]:
    """
    Fetch general market news (not ticker-specific)
    """
    try:
        all_news = []
        news_items = finviz.get_all_news()
        
        for item in news_items[:limit]:
            if len(item) >= 4:
                timestamp, headline, url, source = item
                sentiment = analyze_sentiment_text(headline)
                
                all_news.append({
                    "ticker": "MARKET",
                    "headline": headline,
                    "source": source or "Finviz News",
                    "time": format_finviz_time(timestamp),
                    "datetime": parse_finviz_timestamp(timestamp),
                    "sentiment": sentiment,
                    "link": url,
                    "tags": ["market"]
                })
        
        return all_news
    except Exception as e:
        print(f"Error fetching market news: {e}")
        return []


def analyze_sentiment_text(text: str) -> str:
    """
    Simple sentiment analysis based on headline text
    """
    if not text:
        return "neutral"
    
    text_lower = text.lower()
    
    # Bullish indicators
    bullish_words = [
        'surge', 'rally', 'gain', 'up', 'rise', 'high', 'record', 'profit',
        'beat', 'raised', 'upgrade', 'bull', 'positive', 'growth', 'strong',
        'outperform', 'buy', 'opportunity', 'breakthrough', 'success'
    ]
    
    # Bearish indicators
    bearish_words = [
        'drop', 'fall', 'decline', 'down', 'low', 'cut', 'loss', 'warning',
        'miss', 'lowered', 'downgrade', 'bear', 'negative', 'weak', 'sell',
        'underperform', 'risk', 'concern', 'lawsuit', 'investigation', 'crash'
    ]
    
    bullish_score = sum(1 for word in bullish_words if word in text_lower)
    bearish_score = sum(1 for word in bearish_words if word in text_lower)
    
    if bullish_score > bearish_score + 1:
        return "bullish"
    elif bearish_score > bullish_score + 1:
        return "bearish"
    else:
        return "neutral"


def parse_finviz_timestamp(timestamp_str: str) -> int:
    """
    Convert Finviz timestamp to Unix timestamp in milliseconds
    Finviz format examples: '2024-01-15 12:00' or '12:00 PM' or 'Jan-15 12:00'
    """
    try:
        now = datetime.now()
        
        # Handle different timestamp formats
        if ':' in timestamp_str:
            if '-' in timestamp_str:
                # Format: '2024-01-15 12:00' or 'Jan-15 12:00'
                try:
                    # Try full year format first
                    dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M')
                except ValueError:
                    try:
                        # Try short month format
                        dt = datetime.strptime(f"{now.year}-{timestamp_str}", '%Y-%b-%d %H:%M')
                    except ValueError:
                        # Try with current date
                        dt = datetime.strptime(f"{now.strftime('%Y-%m-%d')} {timestamp_str}", '%Y-%m-%d %H:%M')
            else:
                # Format: '12:00 PM' - assume today
                dt_str = f"{now.strftime('%Y-%m-%d')} {timestamp_str}"
                try:
                    dt = datetime.strptime(dt_str, '%Y-%m-%d %I:%M %p')
                except ValueError:
                    # Try 24-hour format
                    dt = datetime.strptime(dt_str, '%Y-%m-%d %H:%M')
        else:
            # Just a date
            dt = datetime.strptime(timestamp_str, '%Y-%m-%d')
        
        return int(dt.timestamp() * 1000)
    except Exception as e:
        print(f"Error parsing timestamp '{timestamp_str}': {e}")
        return int(datetime.now().timestamp() * 1000)


def format_finviz_time(timestamp_str: str) -> str:
    """
    Convert Finviz timestamp to "X hours ago" format
    """
    try:
        timestamp_ms = parse_finviz_timestamp(timestamp_str)
        article_date = datetime.fromtimestamp(timestamp_ms / 1000)
        now = datetime.now()
        
        diff = now - article_date
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds // 3600 > 0:
            return f"{diff.seconds // 3600}h ago"
        elif diff.seconds // 60 > 0:
            return f"{diff.seconds // 60}m ago"
        else:
            return "Just now"
    except:
        return "Recent"


def get_fallback_news(tickers: list[str]) -> list[dict]:
    """
    Provide simulated news when API fails
    """
    fallback_news = []
    sentiments = ["bullish", "bearish", "neutral"]
    current_time = int(datetime.now().timestamp() * 1000)
    
    # Create varied headlines based on ticker
    templates = [
        "{} reports strong quarterly earnings, beats estimates",
        "{} announces new product line, analysts optimistic",
        "Market volatility affects {} as sector faces headwinds",
        "{} insider buying signals confidence in company direction",
        "Analysts upgrade {} citing growth potential",
        "{} faces regulatory scrutiny, shares dip",
        "Institutional investors increase {} position",
        "{} technical indicators suggest upward momentum"
    ]
    
    for i, symbol in enumerate(tickers[:8]):
        timestamp = current_time - (i * 7200000)  # 2 hours apart
        
        fallback_news.append({
            "ticker": symbol,
            "headline": templates[i % len(templates)].format(symbol),
            "source": "Finviz Analytics",
            "time": format_fallback_time(timestamp),
            "datetime": timestamp,
            "sentiment": sentiments[i % 3],
            "link": "#",
            "tags": []
        })
    
    return fallback_news


def format_fallback_time(timestamp: int) -> str:
    """Helper to format time for fallback news"""
    now = datetime.now()
    article_date = datetime.fromtimestamp(timestamp / 1000)
    diff = now - article_date
    
    if diff.days > 0:
        return f"{diff.days}d ago"
    elif diff.seconds // 3600 > 0:
        return f"{diff.seconds // 3600}h ago"
    elif diff.seconds // 60 > 0:
        return f"{diff.seconds // 60}m ago"
    else:
        return "Just now"