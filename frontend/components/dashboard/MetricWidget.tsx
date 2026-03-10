"use client";

import React from 'react';
import { HelpCircle, Loader2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMetric } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import * as T from "@/types/dashboard";

interface MetricWidgetProps extends T.WidgetData {
  data?: number | string | T.AssetHolding[] | null;
  loading?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
  onRemove?: (id: string) => void;
}

export function MetricWidget({ id, title, type, description, data, loading, isDragging, isOver, isOverlay, onRemove }: MetricWidgetProps) {
  
  const getMetricColor = () => {
    if (loading || !data || type === "holdings") return "text-white";
    const val = typeof data === "number" ? data : parseFloat(String(data).replace(/[%,$]/g, ""));
    if (type.includes("pnl") || type === "alpha") {
      return val > 0 ? "text-emerald-400" : val < 0 ? "text-rose-400" : "text-white";
    }
    return "text-white";
  };

  const renderContent = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />;
    if (!data && data !== 0) return <p className="text-zinc-700 text-[10px] uppercase tracking-widest text-center">Connect Wallet</p>;

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

    return (
      <div className="text-center animate-in fade-in duration-500 w-full px-2">
        <span className={cn(
          // AUTO-SIZE LOGIC: Uses container query units to scale font based on box width
          "font-mono font-bold tracking-tighter block leading-none text-[clamp(1.5rem,15cqw,3.5rem)]", 
          getMetricColor()
        )}>
          {formatMetric(data as string | number, type)}
        </span>
      </div>
    );
  };

  if (isDragging) return (
    <div className={cn("h-full w-full rounded-xl border-2 border-dashed transition-colors", 
      isOver ? "border-zinc-500 bg-zinc-900/40" : "border-zinc-800 bg-zinc-900/20"
    )} />
  );

  return (
    <div className={cn(
      // CURSOR FIX: Forced cursor-pointer here
      "bg-[#121214] text-white rounded-xl border border-zinc-800 p-5 group flex flex-col h-full relative overflow-hidden @container cursor-pointer", 
      isOverlay && "border-zinc-400 shadow-2xl scale-[1.02] pointer-events-none"
    )}>
      <div className="flex justify-between items-start z-20 shrink-0">
        <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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