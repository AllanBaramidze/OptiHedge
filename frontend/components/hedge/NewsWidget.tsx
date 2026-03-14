"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Clock, AlertCircle } from 'lucide-react';

interface NewsItem {
  ticker: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  link: string;
  datetime?: number;
}

export function NewsWidget({ tickers }: { tickers: string[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
      
      const newsWithTimestamps = (data.news || []).map((item: NewsItem) => ({
        ...item,
        datetime: item.datetime || Date.now() - Math.random() * 86400000 
      }));
      
      setNews(newsWithTimestamps);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("News fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => (a.datetime || 0) - (b.datetime || 0));
  }, [news]);

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'bullish': return <TrendingUp size={12} className="text-emerald-400" />;
      case 'bearish': return <TrendingDown size={12} className="text-red-400" />;
      default: return <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />;
    }
  };

  return (
    // Removed border, bg, rounded, and shadow classes. Added h-full to fill parent.
    <div className="flex flex-col h-full w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <Newspaper size={18} className="text-zinc-100" />
          <div>
            <h3 className="text-sm font-medium text-zinc-100 tracking-wide">Market Intelligence</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {lastUpdated ? `Updated ${formatTimeAgo(lastUpdated.getTime())}` : 'Live Feed'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-500">
            {tickers.length} active tickers
          </span>
          <button 
            onClick={fetchNews}
            className="text-zinc-500 hover:text-zinc-100 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* News Feed Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sortedNews.length > 0 ? (
          <div className="space-y-6">
            {sortedNews.map((item, i) => (
              <div key={`${item.ticker}-${i}-${item.datetime}`} className="group flex flex-col gap-1.5">
                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-zinc-100 tracking-wider">
                      {item.ticker}
                    </span>
                    <span className="text-zinc-700 text-[10px]">•</span>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                      {getSentimentIcon(item.sentiment)}
                      <span>{item.sentiment}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                    <Clock size={10} />
                    <span>{formatTimeAgo(item.datetime)}</span>
                  </div>
                </div>

                {/* Headline */}
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-[13px] leading-relaxed text-zinc-300 hover:text-white transition-colors"
                >
                  {item.headline}
                  <ExternalLink size={12} className="inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                </a>

                {/* Source */}
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">
                  {item.source}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center space-y-3">
            <AlertCircle size={24} className="text-zinc-700" />
            <div className="text-center">
              <p className="text-sm text-zinc-300 mb-1">
                {loading ? 'Fetching Intelligence...' : 'No News Available'}
              </p>
              <p className="text-[10px] text-zinc-600 font-mono">
                {loading ? 'Scanning markets' : 'Check back later'}
              </p>
            </div>
            {!loading && tickers.length > 0 && (
              <button 
                onClick={fetchNews}
                className="mt-2 flex items-center gap-2 text-[10px] font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                <RefreshCw size={12} /> Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {sortedNews.length > 0 && (
        <div className="mt-6 pt-4 flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <div className="flex items-center gap-2">
            <span>{sortedNews.length} stories</span>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <span className="text-emerald-500">↑</span> {news.filter(n => n.sentiment === 'bullish').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-500">↓</span> {news.filter(n => n.sentiment === 'bearish').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}