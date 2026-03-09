"use client";

import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { WidgetData } from './DashboardContainer';

interface WidgetSearchProps {
  available: Omit<WidgetData, 'id'>[];
  onSelect: (widget: Omit<WidgetData, 'id'>) => void;
}

export function WidgetSearch({ available, onSelect }: WidgetSearchProps) {
  const sorted = [...available].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white text-white hover:bg-zinc-200 border-none">
          Add Widget
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300">
        {sorted.map((widget, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelect(widget)}
            className="flex justify-between items-center focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <span>{widget.title}</span>
            <span className="text-[10px] text-zinc-500 uppercase">{widget.size}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}