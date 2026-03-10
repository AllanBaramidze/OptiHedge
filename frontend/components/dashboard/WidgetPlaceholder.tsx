"use client";

import React from 'react';
import * as T from "@/types/dashboard";

interface PlaceholderProps {
  title: string;
  size: T.WidgetSize;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
}

export function WidgetPlaceholder({ title, size, isDragging, isOver, isOverlay }: PlaceholderProps) {
  // FIXED: Explicitly typed Record to prevent indexing errors
  const heightMap: Record<T.WidgetSize, string> = {
    small: 'h-40',
    medium: 'h-40', // Kept uniform height as per previous request
    large: 'h-40'
  };

  if (isDragging) {
    return (
      <div className={`${heightMap[size]} w-full rounded-xl border-2 border-dashed transition-colors duration-200 ${isOver ? 'border-zinc-500 bg-zinc-900/40' : 'border-zinc-800 bg-zinc-900/20'}`} />
    );
  }

  return (
    <div className={`
      bg-[#121214] text-white rounded-xl border border-zinc-800 shadow-xl p-6 transition-all flex flex-col h-full
      ${isOverlay ? 'border-zinc-400 shadow-2xl scale-[1.02]' : ''}
      ${heightMap[size]}
    `}>
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest font-sans">
          {title}
        </h3>
      </div>
      <div className="flex-1 flex items-center justify-center -mt-4">
        <p className="text-[11px] text-zinc-700 uppercase tracking-widest font-bold font-sans italic">
          Preview {size}
        </p>
      </div>
    </div>
  );
}