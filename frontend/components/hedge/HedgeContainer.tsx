"use client";

import React, { useState, useCallback } from "react";
import { WalletSelector } from "../dashboard/WalletSelector"; 
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPortfolioById } from "@/app/upload/actions";
import { RiskCharts } from "./RiskCharts";
import * as H from "@/types/hedge";
import * as T from "@/types/dashboard";
import { formatMetric } from "@/lib/utils/formatters"; // Updated import

export default function HedgeContainer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<H.HedgeAnalysisResponse | null>(null);

  const handleWalletChange = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsAnalyzing(true);
    try {
      const wallet = (await getPortfolioById(walletId)) as unknown as T.SupabaseWalletResponse;
      const holdings = wallet.portfolio_items.map((item: T.SupabasePortfolioItem) => ({
        symbol: item.symbol, 
        quantity: item.quantity, 
        avgCost: item.avg_cost,
      }));

      const res = await fetch("http://localhost:8000/wallet/sync", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });

      if (!res.ok) throw new Error("Backend sync failed");

      const result: H.HedgeAnalysisResponse = await res.json();
      setAnalysisData(result); 
    } catch (err) { 
      console.error("Hedge Engine Error:", err); 
    } finally { 
      setIsAnalyzing(false); 
    }
  }, []);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="pt-10 p-8 max-w-400 mx-auto min-h-screen bg-[#0a0a0a]">
        
        {/* HEADER SECTION */}
        <div className="flex items-center mt-20 justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Hedge Engine</h1>
            <p className="text-white/40 mt-1">Cross-asset correlation & macro proxy hedging.</p>
          </div>

          <div className="flex items-center gap-4">
            {isAnalyzing && (
              <span className="text-[10px] uppercase font-bold text-blue-500 animate-pulse tracking-widest">
                Analyzing Risk...
              </span>
            )}
            <WalletSelector onWalletChange={handleWalletChange} />
            <button className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
              Run AI Analysis
            </button>
          </div>
        </div>

        {/* 3-6-3 GRID CONFIGURATION */}
        <div className="grid grid-cols-12 gap-6 h-100">
           
           {/* LEFT - 3 COLUMNS */}
           <div className="col-span-12 lg:col-span-3 border border-white/5 rounded-2xl bg-zinc-900/10 flex flex-col items-center justify-center p-6 text-center">
              {analysisData ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Total Exposure</p>
                  <h2 className="text-3xl font-bold text-white tracking-tighter">
                    {formatMetric(analysisData.metrics.value, "value")}
                  </h2>
                  <div className={`text-xs font-medium mt-2 ${analysisData.metrics.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {/* Note: formatMetric already handles the "+" and "%" logic */}
                    {formatMetric(analysisData.metrics.pnl_percent / 100, "pnl_percent")} (All-time)
                  </div>
                </div>
              ) : (
                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Macro Proxies</p>
              )}
           </div>

           {/* CENTER - 6 COLUMNS */}
           <div className="col-span-12 lg:col-span-6 h-full">
              <RiskCharts data={analysisData} />
           </div>

           {/* RIGHT - 3 COLUMNS */}
           <div className="col-span-12 lg:col-span-3 border border-white/5 rounded-2xl bg-zinc-900/10 flex items-center justify-center">
              <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Correlation Matrix</p>
           </div>
        </div>

        {/* SIMULATION CANVAS */}
        <div className="mt-6">
           <div className="h-64 border border-white/5 rounded-2xl bg-zinc-900/10 flex flex-col items-center justify-center space-y-4">
              <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">
                Simulation Canvas
              </p>
           </div>
        </div>

      </div>
    </TooltipProvider>
  );
}