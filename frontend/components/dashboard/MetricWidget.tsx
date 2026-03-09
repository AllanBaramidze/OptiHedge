"use client";

import React from 'react';
import { HelpCircle, Loader2, Trash2 } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { WidgetSize } from './DashboardContainer';


interface MetricWidgetProps {
  id: string;
  title: string;
  size: WidgetSize;
  description: string;
  data?: string | number | null;
  loading?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
  onRemove?: (id: string) => void;
  classNameOverride?: string;
}

export function MetricWidget({ 
  id,
  title, 
  size, 
  description, 
  data, 
  loading, 
  isDragging, 
  isOver, 
  isOverlay,
  onRemove
}: MetricWidgetProps) {
  
  const widgetHeight = 'h-64';
  const heightMap = {
    small: widgetHeight,
    medium: widgetHeight,
    large: widgetHeight,
  };

  // Render a dashed placeholder when the widget is lifted
  if (isDragging) {
    return (
      <div className={`${heightMap[size]} w-full rounded-xl border-2 border-dashed transition-colors duration-200 ${isOver ? 'border-white' : 'border-zinc-800'}`} />
    );
  }

  return (
    <div className={`
      bg-[#121214] text-white rounded-xl border border-zinc-800 shadow-xl p-5 transition-all relative overflow-hidden group
      ${isOverlay ? 'border-zinc-400 shadow-2xl scale-[1.02] pointer-events-none' : ''}
      ${heightMap[size]}
      cursor-default
    `}>
      <div className="flex justify-between items-start relative z-20">
        <h3 className="text-[11px] font-bold uppercase text-zinc-500 tracking-[0.15em]">
          {title}
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Tooltip logic: 
              We skip the Tooltip entirely if isOverlay is true to prevent ghosting.
              We also removed the TooltipProvider as it is now in DashboardContainer.
          */}
          {!isOverlay ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="text-zinc-600 hover:text-white transition-colors cursor-pointer focus:outline-none p-1"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                sideOffset={20}
                className="bg-zinc-900 border-zinc-700 text-zinc-200 max-w-xs p-3 shadow-xl pointer-events-none rounded-lg" // ← rounded-lg for slightly softer look
              >
            <p className="text-xs leading-relaxed">{description}</p>
            </TooltipContent>
            </Tooltip>
          ) : (
            <HelpCircle className="h-4 w-4 text-zinc-600" />
          )}

          {/* Delete Icon */}
          <button 
            onClick={() => onRemove?.(id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer focus:outline-none p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center pb-6">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
            </div>
          ) : data !== undefined && data !== null ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <span className="text-5xl font-mono font-bold tracking-tighter text-white">
                {data}
              </span>
            </div>
          ) : (
            <div className="text-center px-4">
              <span className="text-zinc-700 italic text-sm">
                Select a wallet to project {title}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}