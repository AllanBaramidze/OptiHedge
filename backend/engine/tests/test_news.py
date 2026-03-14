import finviz
from engine.news import fetch_stock_news_finviz, fetch_all_market_news

def test_finviz():
    print("Testing Finviz API...")
    
    # Test 1: Get single stock news
    print("\n--- Test 1: AAPL News ---")
    tickers = ["AAPL", "MSFT", "NVDA"]
    news = fetch_stock_news_finviz(tickers, limit=10)
    
    print(f"Received {len(news)} news items")
    for i, item in enumerate(news[:5]):  # Show first 5
        print(f"\n{i+1}. [{item['ticker']}] {item['headline']}")
        print(f"   Source: {item['source']} | Time: {item['time']} | Sentiment: {item['sentiment']}")
    
    # Test 2: Direct finviz call for comparison
    print("\n--- Test 2: Direct Finviz AAPL News ---")
    direct_news = finviz.get_news('AAPL')
    print(f"Direct finviz returned {len(direct_news)} items")
    for i, item in enumerate(direct_news[:3]):
        print(f"   {item}")
    
    # Test 3: Market-wide news
    print("\n--- Test 3: Market News ---")
    market_news = fetch_all_market_news(limit=5)
    print(f"Market news: {len(market_news)} items")
    for item in market_news[:3]:
        print(f"   {item['headline']} ({item['time']})")

if __name__ == "__main__":
    test_finviz()