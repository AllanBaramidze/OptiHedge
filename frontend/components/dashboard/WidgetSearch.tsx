"use client";

import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import * as T from "@/types/dashboard"; // Point to your central types

interface WidgetSearchProps {
  available: Omit<T.WidgetData, 'id'>[];
  onSelect: (widget: Omit<T.WidgetData, 'id'>) => void;
}

export function WidgetSearch({ available, onSelect }: WidgetSearchProps) {
  const sorted = [...available].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-800">
          Add Widget
          <ChevronDown className="ml-2 h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300">
        {sorted.length > 0 ? (
          sorted.map((widget, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => onSelect(widget)}
              className="flex justify-between items-center focus:bg-zinc-800 focus:text-white cursor-pointer"
            >
              <span className="text-sm font-medium">{widget.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 uppercase font-bold tracking-tighter">
                {widget.size}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-2 text-xs text-zinc-500 text-center italic">No widgets available</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}