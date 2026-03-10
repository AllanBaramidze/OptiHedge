import httpx
import asyncio
import json

# Your API details
BASE_URL = "http://localhost:8000"
SYNC_URL = f"{BASE_URL}/wallet/sync"

# Mock portfolio data
# Note: "EURUSD" will trigger the forex_provider
#       "AAPL" and "TSLA" will trigger the yfinance_provider
test_portfolio = {
    "holdings": [
        {"symbol": "AAPL", "quantity": 10.0, "avgCost": 175.50},
        {"symbol": "TSLA", "quantity": 5.0, "avgCost": 210.00},
        {"symbol": "EURUSD", "quantity": 1000.0, "avgCost": 1.08},
        {"symbol": "MSFT", "quantity": 2.0, "avgCost": 350.00}
    ]
}

async def test_portfolio_sync():
    print(f"🚀 Sending sync request to: {SYNC_URL}...")
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Check Health First
            health = await client.get(f"{BASE_URL}/health")
            print(f"📡 API Status: {health.json()['status']}")

            # 2. Perform Sync
            response = await client.post(SYNC_URL, json=test_portfolio, timeout=30.0)
            
            if response.status_code != 200:
                print(f"❌ Error: {response.status_code}")
                print(response.json())
                return

            result = response.json()
            
            # 3. Display Results in a clean table format
            print("\n--- Portfolio Sync Results ---")
            print(f"{'Ticker':<10} | {'Qty':<8} | {'Avg Cost':<10} | {'Live Price':<10} | {'Market Val':<12}")
            print("-" * 60)
            
            for item in result["data"]:
                print(
                    f"{item['ticker']:<10} | "
                    f"{item['qty']:<8.2f} | "
                    f"${item['cost']:<9.2f} | "
                    f"${item['current_price']:<9.2f} | "
                    f"${item['market_value']:<11.2f}"
                )
            
            print("-" * 60)
            print(f"💰 Total Invested (Basis): ${result['total_invested']:,.2f}")
            
            # Simple calculation for total market value
            total_mv = sum(item['market_value'] for item in result['data'])
            pnl = total_mv - result['total_invested']
            pnl_pct = (pnl / result['total_invested']) * 100 if result['total_invested'] > 0 else 0
            
            print(f"📊 Current Market Value:  ${total_mv:,.2f}")
            print(f"📈 Total PnL:             ${pnl:,.2f} ({pnl_pct:.2f}%)")
            print(f"📦 Cached Tickers:        {', '.join(result['ticker_list'])}")

        except httpx.ConnectError:
            print("❌ Connection Failed! Make sure your FastAPI server is running on port 8000.")
        except Exception as e:
            print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_portfolio_sync())