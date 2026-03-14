"use client";

import React from 'react';
import { 
  Shield, 
  Target, 
  Zap, 
  TrendingDown, 
  ExternalLink,
  AlertTriangle,
  BarChart3,
  Newspaper,
  BookOpen,
  ChevronRight,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ExecutiveReportProps {
  report: string;
  teacherExplanation?: string; // Optional teacher's explanation
}

export function ExecutiveReport({ report, teacherExplanation }: ExecutiveReportProps) {
  if (!report) return null;

  // Parse sections more robustly
  const sections = report.split(/## \d\. /).filter(Boolean);
  
  // Helper to extract metrics from markdown if needed
  const extractMetrics = (text: string) => {
    const betaMatch = text.match(/Beta:?\s*([0-9.]+)/i);
    const varMatch = text.match(/VaR:?\s*([-0-9.]+%?)/i);
    const sharpeMatch = text.match(/Sharpe:?\s*([0-9.]+)/i);
    
    return {
      beta: betaMatch ? betaMatch[1] : null,
      var: varMatch ? varMatch[1] : null,
      sharpe: sharpeMatch ? sharpeMatch[1] : null
    };
  };

  const metrics = extractMetrics(report);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      
      {/* HEADER WITH METRIC BADGES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/20">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Executive Risk Analysis</h2>
            <p className="text-sm text-zinc-500">Strategic Portfolio Assessment</p>
          </div>
        </div>
        
        {/* Metric Badges */}
        <div className="flex gap-3">
          {metrics.beta && (
            <div className="px-3 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-500 block">β Beta</span>
              <span className="text-lg font-semibold text-white">{metrics.beta}</span>
            </div>
          )}
          {metrics.var && (
            <div className="px-3 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-500 block">VaR</span>
              <span className="text-lg font-semibold text-red-400">{metrics.var}</span>
            </div>
          )}
          {metrics.sharpe && (
            <div className="px-3 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-500 block">Sharpe</span>
              <span className="text-lg font-semibold text-emerald-400">{metrics.sharpe}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY / RISK PROFILE */}
      <section className="relative overflow-hidden bg-linear-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/50 rounded-3xl border border-white/10 p-8 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px]" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Risk Profile Analysis</h3>
              <p className="text-xs text-zinc-500">Quantitative assessment & red flags</p>
            </div>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({children}) => <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>,
                strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                ul: ({children}) => <ul className="space-y-2 my-4">{children}</ul>,
                li: ({children}) => (
                  <li className="flex items-start gap-2 text-zinc-300">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
              }}
            >
              {sections[0]}
            </ReactMarkdown>
          </div>

          {/* Risk Flags */}
          {report.includes('High Market Correlation') && (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-medium text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                High Beta Risk
              </span>
              <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-medium text-amber-400 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                VaR Threshold Exceeded
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. HEDGING STRATEGIES - REDESIGNED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TRADITIONAL HEDGES - Enhanced */}
        <section className="relative overflow-hidden bg-linear-to-br from-emerald-900/20 via-zinc-900/30 to-zinc-900/50 rounded-2xl border border-emerald-500/10 p-6 group hover:border-emerald-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Traditional Hedges</h4>
                  <p className="text-[10px] text-zinc-600">Constitutional Instruments</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
                Tactical
              </span>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="text-zinc-300 text-sm leading-relaxed">{children}</p>,
                  li: ({children}) => (
                    <li className="flex items-center gap-2 text-zinc-300 py-1 border-b border-white/5 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                      {children}
                    </li>
                  ),
                }}
              >
                {sections[1]}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        {/* ASYMMETRIC EVENT HEDGES - Enhanced */}
        <section className="relative overflow-hidden bg-linear-to-br from-amber-900/20 via-zinc-900/30 to-zinc-900/50 rounded-2xl border border-amber-500/10 p-6 group hover:border-amber-500/20 transition-all duration-500">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Event-Based Hedges</h4>
                  <p className="text-[10px] text-zinc-600">Prediction Markets</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 bg-amber-500/10 rounded-full text-amber-400 border border-amber-500/20">
                Asymmetric
              </span>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="text-zinc-300 text-sm leading-relaxed">{children}</p>,
                  a: ({href, children}) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors group"
                    >
                      {children}
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ),
                  li: ({children}) => (
                    <li className="flex items-start gap-2 text-zinc-300 py-2 border-b border-white/5 last:border-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400/50 mt-0.5 shrink-0" />
                      <span>{children}</span>
                    </li>
                  ),
                }}
              >
                {sections[2]}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </div>

      {/* 3. PROJECTED IMPACT - REDESIGNED */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900/20 via-indigo-900/10 to-purple-900/20 rounded-3xl border border-blue-500/20 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <TrendingDown className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Projected Post-Hedge Impact</h3>
                <p className="text-xs text-zinc-500">Quantitative scenario analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-600" />
              <span className="text-xs text-zinc-600">Forward-looking estimates</span>
            </div>
          </div>
          
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({children}) => (
                    <p className="text-lg text-zinc-200 leading-relaxed font-light italic border-l-4 border-blue-400 pl-4">
                      {children}
                    </p>
                  ),
                }}
              >
                {sections[3]?.replace("Projected Post-Hedge Risk", "")}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TEACHER'S EXPLANATION - NEW SECTION */}
      {teacherExplanation && (
        <section className="relative overflow-hidden bg-linear-to-br from-purple-900/20 via-zinc-900/30 to-zinc-900/50 rounded-3xl border border-purple-500/20 p-8 mt-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Educational Deep Dive</h3>
                <p className="text-xs text-zinc-500">Understanding the strategy</p>
              </div>
            </div>
            
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium text-purple-300 mt-4 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  ul: ({children}) => <ul className="space-y-2 my-4 list-none">{children}</ul>,
                  li: ({children}) => (
                    <li className="flex items-start gap-3 text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50 mt-2" />
                      <span>{children}</span>
                    </li>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-purple-400 pl-4 italic text-zinc-400 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {teacherExplanation}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER WITH METADATA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-700" />
            <p className="text-xs font-mono text-zinc-700">OptiHedge Strategic Intelligence</p>
          </div>
          <div className="w-px h-4 bg-white/5" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-700" />
            <p className="text-xs font-mono text-zinc-700">{new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono px-2 py-1 bg-zinc-900/50 rounded-full text-zinc-600 border border-white/5">
            v2.0
          </span>
          <span className="text-[10px] font-mono px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-500/50 border border-emerald-500/20">
            REAL-TIME ANALYSIS
          </span>
        </div>
      </div>
    </div>
  );
}