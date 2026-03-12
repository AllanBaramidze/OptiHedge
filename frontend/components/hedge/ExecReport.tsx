"use client";

import React from 'react';
import { ShieldCheck, Target, Zap, TrendingDown, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExecutiveReportProps {
  report: string;
}

export function ExecutiveReport({ report }: ExecutiveReportProps) {
  if (!report) return null;

  // Split the report into sections based on your AI's ## headings
  const sections = report.split(/## \d\. /).filter(Boolean);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 1. RISK PROFILE CARD */}
      <section className="relative overflow-hidden border border-white/5 rounded-2xl bg-zinc-900/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Current Risk Profile</h3>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed">
          <ReactMarkdown>{sections[0]}</ReactMarkdown>
        </div>
      </section>

      {/* 2. TWO-COLUMN STRATEGY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TRADITIONAL HEDGES */}
        <div className="border border-white/5 rounded-2xl bg-zinc-900/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-500" />
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tactical Instruments</h4>
          </div>
          <div className="prose prose-invert prose-sm text-zinc-300">
            <ReactMarkdown>{sections[1]}</ReactMarkdown>
          </div>
        </div>

        {/* ASYMMETRIC EVENT HEDGES */}
        <div className="border border-white/5 rounded-2xl bg-zinc-900/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Macro Proxies</h4>
          </div>
          <div className="prose prose-invert prose-sm text-zinc-300">
            <ReactMarkdown>{sections[2]}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 3. PROJECTED IMPACT BAR */}
      <section className="border-t border-white/5 pt-8">
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Projected Post-Hedge Impact</h3>
          </div>
          <div className="text-sm text-zinc-400 leading-relaxed font-medium italic">
             {/* We strip the heading text if the AI repeated it */}
             <ReactMarkdown>{sections[3]?.replace("Projected Post-Hedge Risk", "")}</ReactMarkdown>
          </div>
        </div>
      </section>

      {/* FOOTER STAMP */}
      <div className="flex justify-between items-center opacity-20 pt-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em]">OptiHedge Strategic Intelligence</p>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em]">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}