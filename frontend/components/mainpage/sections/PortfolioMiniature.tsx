"use client";

import React from 'react';
import { Plus, Wallet, Search, TrendingUp, X } from "lucide-react";

export default function PortfolioMiniature() {
  // Mock data to show an active, populated state
  const mockHoldings = [
    { sym: 'NVDA', name: 'NVIDIA Corp', qty: '25', value: '$22,450.00' },
    { sym: 'AAPL', name: 'Apple Inc.', qty: '100', value: '$18,120.00' },
    { sym: 'TSLA', name: 'Tesla Motors', qty: '15', value: '$3,150.00' },
  ];

  return (
    <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
      {/* Dynamic Background Glow */}
      <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
      
      <div className="relative border border-white/10 rounded-2xl bg-black/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
          </div>
          <div className="ml-4 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
            Wallet Creator
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Mock Search Bar */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold px-1">
              Asset Search
            </label>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 gap-2">
                <Search className="w-3.5 h-3.5 text-white/20" />
                <span className="text-xs text-white/40">Search ticker (e.g. BTC)</span>
              </div>
              <div className="w-24 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center text-xs font-bold text-primary cursor-default">
                <Plus className="w-3 h-3 mr-1.5" /> Add
              </div>
            </div>
          </div>

          {/* Wallet List Mockup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-tight">
                  Main Growth Wallet
                </span>
              </div>
              <span className="text-[11px] font-mono text-primary">$43,720.00</span>
            </div>

            <div className="space-y-2 max-h-45 overflow-hidden">
              {mockHoldings.map((row, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 hover:bg-white/6 transition-colors group/row"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/60">
                      {row.sym[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{row.sym}</span>
                      <span className="text-[9px] text-white/30 uppercase">{row.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col">
                      <span className="text-xs font-mono text-white/80">{row.value}</span>
                      <span className="text-[9px] text-emerald-500 font-medium flex items-center justify-end">
                        <TrendingUp className="w-2 h-2 mr-1" /> +2.4%
                      </span>
                    </div>
                    <X className="w-3 h-3 text-white/10 group-hover/row:text-red-500/40 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button Mockup */}
          <div className="pt-2">
            <div className="w-full h-12 bg-primary rounded-xl flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/20 text-primary-foreground group-hover:scale-[1.02] transition-transform cursor-default">
              Run Strategy Analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}