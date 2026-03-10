"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MetricWidget } from './MetricWidget';
import { cn } from "@/lib/utils";
import * as T from "@/types/dashboard";

interface SortableWidgetProps {
  widget: T.WidgetData;
  data: number | string | T.AssetHolding[] | null | undefined;
  loading?: boolean;
  onRemove: (id: string) => void;
}

export function SortableWidget({ widget, data, loading, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: widget.id });

  // Use a Record to satisfy the indexing requirement
  const layoutClasses = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-4",
};

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
  <div 
    ref={setNodeRef} 
    style={style} 
    className={cn(layoutClasses[widget.size], "relative h-full")}
  >
    {/* CURSOR FIX: Changed cursor-grab/grabbing to cursor-pointer */}
    <div 
      {...attributes} 
      {...listeners} 
      className="absolute inset-0 z-10 cursor-pointer" 
    />
    
    <MetricWidget 
      {...widget}
      data={data}
      loading={loading}
      isDragging={isDragging}
      isOver={isOver}
      onRemove={onRemove}
    />
  </div>
);
}