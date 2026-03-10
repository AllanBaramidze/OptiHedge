import pandas as pd
import yfinance as yf
import quantstats as qs
import traceback
import datetime as dt

tickers = ["AAPL", "BX", "OWL", "META", "V"]
weights = [0.2, 0.2, 0.2, 0.2, 0.2]
start_date = (dt.date.today() - dt.timedelta(days=365)).strftime('%Y-%m-%d')

print(f"--- STARTING DIAGNOSTIC TEST ---")

try:
    print("1. Downloading Portfolio Data...")
    raw_data = yf.download(tickers, start=start_date, progress=False)
    
    if raw_data is None or raw_data.empty:
        print("❌ FAILED: yfinance returned absolutely no data.")
        exit()
        
    # PRINT THE ACTUAL COLUMNS YFINANCE GAVE US
    print(f"AVAILABLE COLUMNS: {list(raw_data.columns.get_level_values(0).unique())}")
    
    # The Fix: Check if "Adj Close" exists, otherwise use "Close"
    if "Adj Close" in raw_data:
        data = raw_data["Adj Close"]
    else:
        data = raw_data["Close"]
        
    print(f"✅ Data extracted. Shape: {data.shape}")
    
    print("2. Calculating Daily Returns...")
    rets = pd.DataFrame(data).ffill().pct_change().fillna(0)
    
    weight_dict = dict(zip(tickers, weights))
    aligned_weights = [weight_dict.get(str(col), 0.0) for col in rets.columns]
    
    port_rets = (rets * aligned_weights).sum(axis=1)
    port_rets.index = pd.to_datetime(port_rets.index).tz_localize(None)
    print(f"✅ Portfolio returns calculated. First 3 days:\n{port_rets.head(3)}\n")

    print("3. Downloading Benchmark (^GSPC)...")
    raw_bench = yf.download("^GSPC", start=start_date, progress=False)
    
    # Fix for benchmark too
    if "Adj Close" in raw_bench:
        bench_data = raw_bench["Adj Close"]
    else:
        bench_data = raw_bench["Close"]
        
    bench_rets = pd.Series(bench_data).pct_change().dropna()
    bench_rets.index = pd.to_datetime(bench_rets.index).tz_localize(None)
    print(f"✅ Benchmark downloaded. Shape: {bench_rets.shape}\n")

    print("4. Feeding to QuantStats...")
    sharpe_val = qs.stats.sharpe(port_rets)
    print(f"Raw Sharpe output from qs: {sharpe_val}")
    
    greeks = qs.stats.greeks(port_rets, bench_rets)
    print(f"Raw Greeks output from qs: {greeks}\n")

    print("--- TEST COMPLETED SUCCESSFULLY ---")

except Exception as e:
    print("\n❌ A FATAL ERROR OCCURRED:")
    traceback.print_exc()