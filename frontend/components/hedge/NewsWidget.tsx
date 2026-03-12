"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
  ticker: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  link: string;
}

export function NewsWidget({ tickers }: { tickers: string[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    if (!tickers || tickers.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });
      
      if (!response.ok) throw new Error("Backend unreachable");
      
      const data = await response.json();
      setNews(data.news || []);
    } catch (e) {
      console.error("News fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="flex flex-col h-125">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-zinc-500" />
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
            Live Intel
          </h3>
          {loading && (
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
          )}
        </div>
        
        {/* Simple refresh icon for manual updates */}
        <button 
          onClick={fetchNews}
          className="text-zinc-600 hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* News Feed Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
        {news.length > 0 ? (
          news.map((item, i) => (
            <div key={`${item.ticker}-${i}`} className="group relative">
              {/* Meta Row: Ticker | Sentiment | Source */}
              <div className="flex items-center justify-between text-[9px] mb-1.5 font-mono uppercase tracking-tighter">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{item.ticker}</span>
                  <span className="text-zinc-800">•</span>
                  <div className={`flex items-center gap-1 font-bold ${
                    item.sentiment === 'bullish' ? 'text-emerald-500' : 
                    item.sentiment === 'bearish' ? 'text-red-500' : 'text-zinc-500'
                  }`}>
                    {item.sentiment === 'bullish' && <TrendingUp size={8} />}
                    {item.sentiment === 'bearish' && <TrendingDown size={8} />}
                    {item.sentiment}
                  </div>
                </div>
                <span className="text-zinc-700">{item.source}</span>
              </div>

              {/* Headline Link */}
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[11px] leading-snug text-zinc-400 group-hover:text-white transition-colors"
              >
                {item.headline}
                <ExternalLink size={8} className="inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Minimal Divider */}
              {i !== news.length - 1 && (
                <div className="mt-4 border-b border-white/3" />
              )}
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-20 transition-opacity duration-500 hover:opacity-40">
            <p className="text-[9px] uppercase tracking-[0.2em]">
              {loading ? 'Fetching Intelligence...' : 'Awaiting Data Feed'}
            </p>
            {!loading && tickers.length > 0 && (
              <button 
                onClick={fetchNews}
                className="flex items-center gap-2 px-3 py-1 border border-white/10 rounded text-[9px] uppercase hover:bg-white/5 transition-all"
              >
                <RefreshCw size={8} /> Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}