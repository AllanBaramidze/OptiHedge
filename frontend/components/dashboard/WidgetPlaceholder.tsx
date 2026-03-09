import React from 'react';
import { WidgetSize } from './DashboardContainer';

interface PlaceholderProps {
  title: string;
  size: WidgetSize;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
}

export function WidgetPlaceholder({ title, size, isDragging, isOver, isOverlay }: PlaceholderProps) {
  const heightMap = {
    small: 'h-40',
    medium: 'h-48',
    large: 'h-64'
  };

  // Grey dashed outline when picking up, white when hovering over a spot
  if (isDragging) {
    return (
      <div className={`${heightMap[size]} w-full rounded-xl border-2 border-dashed transition-colors duration-200 ${isOver ? 'border-white' : 'border-zinc-700'}`} />
    );
  }

  return (
    <div className={`
      bg-[#121214] text-white rounded-xl border border-zinc-800 shadow-xl p-6 transition-all
      ${isOverlay ? 'border-zinc-400 shadow-2xl' : ''}
      ${heightMap[size]}
    `}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <div className="flex items-center justify-center h-full -mt-8">
        <p className="text-sm text-zinc-600">Placeholder {size} content</p>
      </div>
    </div>
  );
}