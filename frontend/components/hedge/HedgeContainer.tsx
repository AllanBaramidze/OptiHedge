"use client";

import React, { useState, useCallback } from "react";
import { WalletSelector } from "../dashboard/WalletSelector"; 
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPortfolioById } from "@/app/upload/actions";
import { RiskCharts } from "./RiskCharts";
import { PolymarketWidget, PolymarketMarket } from "./Polymarket"; 
import { ExecutiveReport } from "./ExecReport";
import { NewsWidget } from "./NewsWidget";
import * as H from "@/types/hedge";
import * as T from "@/types/dashboard";
import { formatMetric } from "@/lib/utils/formatters";

export default function HedgeContainer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<H.HedgeAnalysisResponse | null>(null);
  
  // --- NEW AI STATE ---
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [polymarketData, setPolymarketData] = useState<PolymarketMarket[]>([]);
  // You can also save the markdown report here if you want to display it in the Simulation Canvas later!
  const [aiReport, setAiReport] = useState<string>("");

  const handleWalletChange = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsAnalyzing(true);
    setPolymarketData([]); // Reset AI data on new wallet
    
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

  // --- NEW TRIGGER FUNCTION FOR AI ---
  const handleRunAiAnalysis = async () => {
  if (!analysisData) return;
  
  setIsGeneratingAi(true);
  try {
    const res = await fetch("http://localhost:8000/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Ensure these keys match the AIReportRequest class in main.py
      body: JSON.stringify({
        holdings: analysisData.data, 
        metrics: analysisData.metrics,
      }),
    });

    if (!res.ok) {
      // Log the actual error from the server to see WHY it failed
      const errorText = await res.text();
      console.error("Server Error Details:", errorText);
      throw new Error("AI Engine failed");
    }

    const result = await res.json();
    if (result.status === "success") {
      setPolymarketData(result.polymarket_data);
      setAiReport(result.report);
    }
  } catch (err) {
    console.error("AI Generation Error:", err);
  } finally {
    setIsGeneratingAi(false);
  }
};    

  return(
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
            
            <button 
              onClick={handleRunAiAnalysis}
              disabled={isGeneratingAi || !analysisData}
              className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAi ? "Generating..." : "Run AI Analysis"}
            </button>
          </div>
        </div>

        {/* WRAPPER FOR DYNAMIC SPACING */}
        <div className="flex flex-col gap-12">
          
          {/* 3-6-3 GRID CONFIGURATION */}
          <div className="grid grid-cols-12 gap-6 items-start">
             
             {/* LEFT - 3 COLUMNS */}
             <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                
                {/* Exposure Box */}
                <div className="border border-white/5 rounded-2xl bg-zinc-900/10 flex flex-col items-center justify-center p-6 text-center shrink-0">
                  {analysisData ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Total Exposure</p>
                      <h2 className="text-3xl font-bold text-white tracking-tighter">
                        {formatMetric(analysisData.metrics.value, "value")}
                      </h2>
                      <div className={`text-xs font-medium mt-2 ${analysisData.metrics.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatMetric(analysisData.metrics.pnl_percent / 100, "pnl_percent")} (All-time)
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Awaiting Wallet</p>
                  )}
                </div>

                {/* POLYMARKET WIDGET BOX */}
                <div className="border border-white/5 rounded-2xl bg-zinc-900/10 p-5 flex-1 min-h-112.5">
                  <PolymarketWidget markets={polymarketData} isLoading={isGeneratingAi} />
                </div>

             </div>

             {/* CENTER - 6 COLUMNS */}
             <div className="col-span-12 lg:col-span-6 h-full min-h-137.5">
                <RiskCharts data={analysisData} />
             </div>

             {/* RIGHT - 3 COLUMNS */}
            <div className="col-span-12 lg:col-span-3 border border-white/5 rounded-2xl bg-zinc-900/10 p-6 min-h-137.5">
              <NewsWidget tickers={analysisData?.ticker_list || []} />
            </div>
          </div>

          {/* SIMULATION CANVAS */}
          <div className="mt-12">
            <div className="min-h-96 border border-white/5 rounded-3xl bg-zinc-900/10 flex flex-col p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">
                      Strategic Executive Report
                    </p>
                  </div>
                  {aiReport && (
                    <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5">
                      Export PDF
                    </button>
                  )}
              </div>
              
              {aiReport ? (
                <ExecutiveReport report={aiReport} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20">
                  <div className="w-12 h-12 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-ping" />
                  </div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] text-center">
                    Awaiting AI Risk Synthesis
                  </p>
                </div>
              )}
            </div>
          </div>

        </div> {/* END WRAPPER */}
      </div>
    </TooltipProvider>
  );
}