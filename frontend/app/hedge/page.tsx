"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
// If you haven't installed the slider yet, run: npx shadcn-ui@latest add slider
import { Slider } from "@/components/ui/slider"; 
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// --- PLACEHOLDER DATA ---
const SCENARIOS = [
  { id: "base", name: "Base Case", desc: "Current market conditions" },
  { id: "tariff", name: "Trade War 2.0", desc: "+20% Global Tariffs" },
  { id: "risk-off", name: "Flash Crash", desc: "S&P 500 -5% in 24h" },
  { id: "ai-bubble", name: "Compute Deflation", desc: "NVDA / AI Narrative Pivot" },
];

export default function HedgingPage() {
  const [coverage, setCoverage] = useState([40]);
  const [tension, setTension] = useState([20]);
  const [activeScenario, setActiveScenario] = useState("base");

  return (
    <TooltipProvider delayDuration={100}>
      {/* Canonical class max-w-400 applied */}
      <div className="pt-21 p-8 max-w-400 mx-auto min-h-screen bg-[#0a0a0a] text-white font-sans">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-blue-500 h-8 w-8" />
              <h1 className="text-4xl font-bold tracking-tight">Hedge Engine</h1>
            </div>
            <p className="text-white/40">Geopolitical Event Hedging & Narrative Correlation Analysis</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-xl border border-white/5">
            <div className="px-4 text-right">
              <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Active Wallet</p>
              <p className="text-sm font-mono font-medium">Main_Portfolio_v3</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6">
              <RefreshCcw className="mr-2 h-4 w-4" /> Run Stress Test
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SIMULATION CONTROLS */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" /> Stress Test Sliders
              </h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium">Geopolitical Tension</label>
                    <span className="text-xs font-mono text-blue-400">{tension}%</span>
                  </div>
                  <Slider value={tension} onValueChange={setTension} max={100} step={1} className="py-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium">Desired Hedge Coverage</label>
                    <span className="text-xs font-mono text-emerald-400">{coverage}%</span>
                  </div>
                  <Slider value={coverage} onValueChange={setCoverage} max={100} step={1} className="py-2" />
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-4">Macro Scenarios</p>
                {SCENARIOS.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setActiveScenario(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all group",
                      activeScenario === s.id 
                        ? "bg-blue-600/10 border-blue-500/50" 
                        : "bg-zinc-900/40 border-transparent hover:border-white/10"
                    )}
                  >
                    <p className={cn("text-xs font-bold", activeScenario === s.id ? "text-blue-400" : "text-white")}>{s.name}</p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: ANALYTICS & CHARTS */}
          <main className="lg:col-span-6 space-y-6">
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 h-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Efficient Frontier (MPT Optimization)</h3>
                <div className="flex gap-4 text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-500"><div className="w-2 h-2 rounded-full bg-zinc-700"/> Current</div>
                  <div className="flex items-center gap-1.5 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"/> Optimized</div>
                </div>
              </div>
              <div className="flex-1 border-l border-b border-white/5 m-4 relative">
                <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-zinc-500 rounded-full blur-[1px]" />
                <div className="absolute bottom-1/2 left-3/4 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer" />
                <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 Q 20 20 100 0" stroke="white" strokeWidth="0.5" fill="transparent" strokeDasharray="2" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="text-[10px] text-zinc-700 uppercase tracking-[0.3em]">Live Simulation Chart Area</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Expected Return</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-mono font-bold">12.4%</p>
                  <p className="text-xs text-emerald-400 font-medium">+1.2% delta</p>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Max Drawdown</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-mono font-bold text-rose-400">-14.2%</p>
                  <p className="text-xs text-emerald-400 font-medium">-4.5% improvement</p>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT COLUMN: AI AGENT RECOMMENDATIONS */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">OptiHedge AI Strategist</h3>
              </div>
              
              {/* Escaped &quot; applied here */}
              <p className="text-sm leading-relaxed text-zinc-300 mb-6">
                Analyzing your 12.4% NVDA exposure. Detection of &quot;Narrative Drift&quot; between Tech and USD/JPY. Suggesting cross-asset proxy hedge via Short AUD.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-400/10 px-2 py-0.5 rounded">Prediction Market</span>
                    <span className="text-[10px] font-mono text-zinc-500">Prob: 62%</span>
                  </div>
                  {/* Escaped quotes applied here */}
                  <p className="text-xs font-bold mb-1 italic">&quot;US-China Chip Ban by Q4?&quot;</p>
                  <p className="text-[10px] text-zinc-400">Suggested: Buy 450 contracts (YES)</p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] text-blue-400 p-0 group-hover:pr-2 transition-all">
                      Add to Plan <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/80 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter bg-emerald-400/10 px-2 py-0.5 rounded">Inverse Proxy</span>
                    <span className="text-[10px] font-mono text-zinc-500">Delta: -0.72</span>
                  </div>
                  <p className="text-xs font-bold mb-1 italic">Short AUD/USD (FX)</p>
                  <p className="text-[10px] text-zinc-400"> cheaper alternative to tech puts.</p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] text-emerald-400 p-0 group-hover:pr-2 transition-all">
                      Add to Plan <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[11px] mb-4">
                  <span className="text-zinc-500 italic">Est. Hedge Cost:</span>
                  <span className="font-mono">$1,240 / yr</span>
                </div>
                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
                  Execute Combined Plan
                </Button>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6">
               <div className="flex items-center gap-2 mb-4">
                 <AlertTriangle className="h-4 w-4 text-rose-500" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Verification Trace</h3>
               </div>
               {/* Escaped quotes applied here */}
               <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                 &quot;Agent B (Quant) backtested this AUD short against the 2022 tech drawdown. Correlation was 0.89. Verification layer passed.&quot;
               </p>
            </div>
          </aside>
        </div>

      </div>
    </TooltipProvider>
  );
}