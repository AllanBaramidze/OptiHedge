"use client";

import React, { useState, useCallback } from "react";
// Fixed path: Assuming WalletSelector is in your dashboard folder
import { WalletSelector } from "../dashboard/WalletSelector"; 
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPortfolioById } from "@/app/upload/actions";
import * as T from "@/types/dashboard";

export default function HedgeContainer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Commented out to satisfy linter until you start mapping data to widgets
  // const [analysisData, setAnalysisData] = useState<T.AnalysisResponse | null>(null);

  const handleWalletChange = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsAnalyzing(true);
    try {
      const wallet = (await getPortfolioById(walletId)) as unknown as T.SupabaseWalletResponse;
      const holdings = wallet.portfolio_items.map((item: T.SupabasePortfolioItem) => ({
        symbol: item.symbol, quantity: item.quantity, avgCost: item.avg_cost,
      }));
      const res = await fetch("http://localhost:8000/wallet/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      const result = await res.json();
      console.log("Hedge Engine Analysis:", result);
      // setAnalysisData(result); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsAnalyzing(false); 
    }
  }, []);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="pt-10 p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
        
        {/* HEADER SECTION - Aesthetic Match to Dashboard */}
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
              Run Stress Test
            </button>
          </div>
        </div>

        {/* BRAINSTORMING AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[160px]">
           <div className="col-span-4 h-full border border-white/5 rounded-2xl bg-zinc-900/10 flex items-center justify-center">
              <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">
                Placeholder: Simulation Canvas
              </p>
           </div>
        </div>

      </div>
    </TooltipProvider>
  );
}