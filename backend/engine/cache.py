import asyncio
import time
from typing import Dict, Optional, Any

class InMemoryCache:
    def __init__(self, ttl_seconds: int = 60):
        self.store: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl_seconds
        self._lock = asyncio.Lock()

    async def set(self, symbol: str, quote: dict):
        async with self._lock:
            self.store[symbol.upper()] = {
                "data": quote,
                "expiry": time.time() + self.ttl
            }

    async def get(self, symbol: str) -> Optional[dict]:
        async with self._lock:
            item = self.store.get(symbol.upper())
            if not item:
                return None
            if time.time() > item["expiry"]:
                del self.store[symbol.upper()]
                return None
            return item["data"]

    async def get_all(self):
        async with self._lock:
            now = time.time()
            return {k: v["data"] for k, v in self.store.items() if v["expiry"] > now}

# THIS LINE IS MISSING - ADD IT NOW:
quote_cache = InMemoryCache(ttl_seconds=60)