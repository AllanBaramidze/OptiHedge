"use client";

import React, { useState } from 'react';
import { HelpCircle, Loader2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMetric } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import * as T from "@/types/dashboard";

interface MetricWidgetProps extends T.WidgetData {
  data?: number | string | T.AssetHolding[] | T.SectorWeights | Record<string, T.MoverItem[]> | null;
  loading?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
  onRemove?: (id: string) => void;
}

// REMOVED: isDragging and isOver from the destructuring to fix unused variable warnings
export function MetricWidget({ id, title, type, description, data, loading, isOverlay, onRemove }: MetricWidgetProps) {
  
  const [moversTF, setMoversTF] = useState("1D");

  const getMetricColor = () => {
    if (loading || !data || type === "holdings" || type === "sectors" || type === "movers") return "text-white";
    
    const val = typeof data === "number" ? data : parseFloat(String(data).replace(/[%,$]/g, ""));
    
    if (type.includes("pnl")) {
      return val > 0 ? "text-emerald-400" : val < 0 ? "text-rose-500" : "text-white";
    }

    if (type === "sharpe" || type === "sortino") {
      if (val >= 2.0) return "text-emerald-400";
      if (val >= 1.0) return "text-emerald-300";
      if (val >= 0.5) return "text-white";
      if (val >= 0.0) return "text-rose-300";
      return "text-rose-500";
    }

    if (type === "beta") {
      if (val > 1.5) return "text-rose-500";
      if (val > 1.2) return "text-rose-300";
      if (val >= 0.8) return "text-white";
      if (val >= 0.0) return "text-emerald-300";
      return "text-emerald-400";
    }

    if (type === "max_drawdown" || type === "var" || type === "ulcer_index") {
      if (val <= -0.2) return "text-rose-500";
      if (val <= -0.1) return "text-rose-300";
      if (val <= -0.05) return "text-white";
      return "text-emerald-300";
    }

    if (type === "calmar") {
      if (val >= 3.0) return "text-emerald-400";
      if (val >= 1.0) return "text-white";
      return "text-rose-400";
    }

    if (type === "diversification") {
      if (val >= 1.5) return "text-emerald-400";
      if (val >= 1.1) return "text-emerald-300";
      if (val >= 0.9) return "text-white";
      return "text-rose-400";
    }

    return "text-white";
  };

  const renderContent = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />;
    
    // FIXED: Replaced 'any' with explicit Record type check
    const moversRecord = data as Record<string, T.MoverItem[]>;
    const hasData = type === "movers" ? (moversRecord?.[moversTF]?.length > 0) : !!data || data === 0;
    
    if (!hasData) return <p className="text-zinc-700 text-[10px] uppercase tracking-widest text-center">Connect Wallet</p>;

    if (type === "movers" && data && typeof data === 'object' && !Array.isArray(data)) {
      const tfData = (data as Record<string, T.MoverItem[]>)[moversTF] || [];
      
      return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar pt-1 px-1">
          <div className="space-y-2">
            {tfData.map((item, i) => (
              <div key={`${item.ticker}-${i}`} className="flex justify-between items-center text-[12px] border-b border-zinc-800/50 pb-2 last:border-0">
                <span className="font-bold text-white uppercase">{item.ticker}</span>
                <span className={cn("font-mono font-bold", item.value > 0 ? "text-emerald-400" : "text-rose-500")}>
                  {item.value > 0 ? "+" : ""}{(item.value * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === "holdings" && Array.isArray(data)) {
      return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar pt-1">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest sticky top-0 bg-[#121214] z-10">
              <tr><th className="pb-1">Ticker</th><th className="pb-1 text-right">Value</th></tr>
            </thead>
            <tbody className="text-[11px]">
              {data.map((asset, i) => (
                <tr key={`${asset.ticker}-${i}`} className="border-t border-zinc-800/30">
                  <td className="py-1 font-bold text-white">{asset.ticker}</td>
                  <td className="py-1 text-right text-emerald-400 font-mono">${asset.market_value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (type === "sectors" && data && typeof data === 'object' && !Array.isArray(data)) {
      const sectors = Object.entries(data as T.SectorWeights).sort((a, b) => b[1] - a[1]);
      
      return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar pt-1 px-1">
          <div className="space-y-3">
            {sectors.map(([sector, weight]) => (
              <div key={sector} className="w-full">
                <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5">
                  <span className="text-zinc-400 truncate pr-2">{sector}</span>
                  <span className="text-white font-mono">{weight.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(weight, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center animate-in fade-in duration-500 w-full px-2">
        <span className={cn(
          "font-mono font-bold tracking-tighter block leading-none text-[clamp(1.5rem,15cqw,3.5rem)] transition-colors duration-500", 
          getMetricColor()
        )}>
          {formatMetric(data as string | number, type)}
        </span>
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-[#121214] text-white rounded-xl border border-zinc-800 p-5 group flex flex-col h-full relative overflow-hidden @container cursor-pointer", 
      isOverlay && "border-zinc-400 shadow-2xl scale-[1.02] pointer-events-none"
    )}>
      <div className="flex justify-between items-start z-20 shrink-0">
        <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          
          {type === "movers" && (
            <select 
              value={moversTF} 
              onChange={(e) => setMoversTF(e.target.value)}
              className="bg-zinc-900 text-[9px] font-bold text-zinc-400 uppercase rounded border border-zinc-800 px-1 py-0.5 outline-none hover:text-white transition-colors"
              onPointerDown={e => e.stopPropagation()}
            >
              {["1D", "1W", "1M", "6M", "1Y", "10Y"].map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          )}

          {!isOverlay && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-zinc-600 hover:text-white p-1 cursor-pointer" onPointerDown={e => e.stopPropagation()}>
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300 p-2 text-[10px] max-w-50 font-sans shadow-2xl">
                  {description}
                </TooltipContent>
              </Tooltip>
              <button 
                onClick={() => onRemove?.(id)} 
                onPointerDown={e => e.stopPropagation()} 
                className="text-zinc-600 hover:text-rose-500 p-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 flex-1 flex flex-col items-center justify-center overflow-hidden w-full h-full">
        {renderContent()}
      </div>
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/1 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}