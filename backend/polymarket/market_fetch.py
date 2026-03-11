import requests
import json
import datetime

GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"

def get_token_price(token_id):
    """Fetches live orderbook prices from the CLOB API."""
    if not token_id: return "N/A", "N/A"
    try:
        # Fetch Best Buy (Bids) and Best Sell (Asks)
        buy_r = requests.get(f"{CLOB_API}/price", params={'token_id': token_id, 'side': 'BUY'})
        sell_r = requests.get(f"{CLOB_API}/price", params={'token_id': token_id, 'side': 'SELL'})
        b = buy_r.json().get('price', 'None')
        s = sell_r.json().get('price', 'None')
        return b, s
    except:
        return "Err", "Err"

# Update the search function in your script to filter out the 'None' prices
def search_polymarket(query):
    print(f"\n--- 🔎 Searching for: {query.upper()} ---")
    url = f"{GAMMA_API}/public-search"
    try:
        response = requests.get(url, params={"q": query})
        events = response.json().get('events', [])
        
        for event in events[:3]:
            # Only show events that aren't fully closed
            if event.get('closed'): continue 
            
            print(f"📍 Event: {event.get('title')}")
            for market in event.get('markets', []):
                # Filter for active markets with price data
                if market.get('active') and not market.get('closed'):
                    tokens = json.loads(market.get('clobTokenIds', '[]'))
                    buy, sell = get_token_price(tokens[0])
                    
                    # Only print if there is a live price
                    if buy != "None":
                        print(f"   - {market.get('question')}")
                        print(f"     Price: Buy ${buy} | Sell ${sell}")
    except Exception as e:
        print(f"   Search error: {e}")
    """Uses the public-search endpoint for accurate keyword matching."""
    print(f"\n--- 🔎 Searching for: {query.upper()} ---")
    
    # public-search is the key for 2026 keyword lookups
    url = f"{GAMMA_API}/public-search"
    params = {"q": query}
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        # public-search returns a list of events
        events = data.get('events', [])
        if not events:
            print("   No active matches found.")
            return

        for event in events[:3]: # Limit to top 3 matches
            print(f"📍 Event: {event.get('title')}")
            # Each event has a list of 'markets' (the actual tradable contracts)
            for market in event.get('markets', []):
                # We want active markets only
                if market.get('active'):
                    # Parse the clobTokenIds string into a list
                    tokens = json.loads(market.get('clobTokenIds', '[]'))
                    if tokens:
                        buy, sell = get_token_price(tokens[0])
                        print(f"   - {market.get('question')}")
                        print(f"     Price: Buy ${buy} | Sell ${sell}")
    except Exception as e:
        print(f"   Search error: {e}")

# --- EXECUTION ---
if __name__ == "__main__":
    # 1. Broad Topic Search (Fixed)
    search_topics = ["Apple", "Tech", "AI"]
    for topic in search_topics:
        search_polymarket(topic)

    # 2. Short-term Price Preds (Up/Down)
    print("\n--- 📈 Short-Term Price Intervals ---")
    # For BTC 5m, ETH 15m etc.
    assets = [("btc", 5), ("eth", 15)]
    for asset, dur in assets:
        # This logic follows the GitHub script you provided
        now = datetime.datetime.now(datetime.timezone.utc)
        ts = (int(now.timestamp()) // (dur * 60)) * (dur * 60)
        slug = f"{asset}-updown-{dur}m-{ts}"
        
        r = requests.get(f"{GAMMA_API}/events/slug/{slug}")
        if r.status_code == 200:
            m = r.json()['markets'][0]
            tokens = json.loads(m['clobTokenIds'])
            p, _ = get_token_price(tokens[0])
            print(f"{asset.upper()} {dur}m: 'Up' currently at ${p}")
        else:
            print(f"{asset.upper()} {dur}m: Not found (likely interval gap)")