"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MetricWidget } from './MetricWidget';
import { WidgetData } from './DashboardContainer';


interface SortableWidgetProps {
  widget: WidgetData;
  data?: string | number | null;
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

  // FIXED: Defined sizeClasses inside the component
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 lg:col-span-2',
    large: 'col-span-1 lg:col-span-4',
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
      className={`${sizeClasses[widget.size]} relative`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute inset-0 z-10 cursor-default" 
      />
      
      <MetricWidget 
        id={widget.id}
        title={widget.title} 
        size={widget.size} 
        description={widget.description}
        data={data}
        loading={loading}
        isDragging={isDragging}
        isOver={isOver}
        onRemove={onRemove}
      />
    </div>
  );
}