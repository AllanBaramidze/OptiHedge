import React from "react";
import { ExternalLink } from "lucide-react"; // Assuming you use lucide-react for icons!

export interface PolymarketMarket {
  theme: string;
  market_title: string;
  yes_price: string;
  url: string;
}

interface PolymarketWidgetProps {
  markets: PolymarketMarket[];
  isLoading: boolean;
}

export function PolymarketWidget({ markets, isLoading }: PolymarketWidgetProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Polymarket Logo & Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-500">
          {/* A clean vector proxy for the Polymarket logo */}
          <path d="M12 2L2 12l10 10 10-10L12 2z" fill="currentColor" />
        </svg>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
          Polymarket Hedges
        </h3>
      </div>

      {/* Market Cards Container */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest animate-pulse">
              Scouring Markets...
            </p>
          </div>
        ) : markets.length > 0 ? (
          markets.map((market, i) =>
            market.yes_price !== "N/A" ? (
              <a
                key={i}
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] mb-1.5 font-bold">
                  {market.theme}
                </div>
                <div className="text-xs text-zinc-200 font-medium leading-relaxed mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {market.market_title}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                    {market.yes_price}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            ) : null
          )
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center">
              Run AI Analysis to <br /> generate macro proxies
            </p>
          </div>
        )}
      </div>
    </div>
  );
}