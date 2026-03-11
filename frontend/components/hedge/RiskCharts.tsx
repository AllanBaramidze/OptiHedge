"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
} from 'recharts';
import * as H from "@/types/hedge";
import { formatMetric, getMetricColor } from "@/lib/utils/formatters";

interface RiskChartsProps {
  data?: H.HedgeAnalysisResponse | null; 
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function RiskCharts({ data }: RiskChartsProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Fallback for null/initial data state
  if (!data || !data.metrics) {
    return (
      <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-2xl flex items-center justify-center">
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Awaiting Engine Sync...
        </p>
      </div>
    );
  }

  // Transform Sector Weights for Pie Chart
  const sectorData = Object.entries(data.sector_weights || {}).map(([name, value]) => ({
    name,
    value: value * 100
  }));

  // Transform Individual Holdings for Exposure Bar Chart
  const exposureData = [...(data.data || [])]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((h) => ({
      ticker: h.ticker,
      weight: h.weight * 100
    }));

  const slides = [
    {
      title: "Sector Allocation",
      icon: <PieIcon className="w-4 h-4 text-blue-400" />,
      component: (
        <PieChart>
          <Pie 
            data={sectorData.length ? sectorData : [{ name: 'Empty', value: 1 }]} 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={5} 
            dataKey="value"
          >
            {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
            formatter={(val: unknown, name: unknown) => {
                const num = Number(val);
                const label = String(name || "Sector");
                if (isNaN(num)) return ["0.00%", label];
                const percentage = num > 100 ? num / 100 : num;
                const formattedVal = (isNaN(percentage) ? "0.00" : percentage.toFixed(2)) + "%";
                return [formattedVal, label]; 
            }}
          />
        </PieChart>
      )
    },
    {
      title: "Top Asset Exposure",
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      component: (
        <BarChart data={exposureData} layout="vertical" margin={{ left: -10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="ticker" type="category" width={60} fontSize={10} stroke="#52525b" />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#18181b', border: 'none' }} 
                   formatter={(val: unknown) => {
                    const num = Number(val);
                    const percentage = num > 100 ? num / 100 : num;
                    const formattedVal = (isNaN(percentage) ? "0.0" : percentage.toFixed(1)) + "%";
                    return [formattedVal];
                   }}
          />
          <Bar 
            dataKey="weight" 
            fill="#10b981" 
            radius={[0, 4, 4, 0]} 
            label={{ 
              position: 'right', 
              fill: '#52525b', 
              fontSize: 10, 
              formatter: (val: unknown) => {
                const num = Number(val);
                const percentage = num > 100 ? num / 100 : num;
                return isNaN(percentage) ? "" : percentage.toFixed(1) + "%";
              }
            }} 
          />
        </BarChart>
      )
    },
    {
      title: "Institutional Risk Metrics",
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      component: (
        <div className="grid grid-cols-2 gap-3 h-full items-center p-2">
          {[
            { label: 'Sharpe', type: 'sharpe', val: data.metrics.sharpe },
            { label: 'Beta', type: 'beta', val: data.metrics.beta },
            { label: 'Max DD', type: 'max_drawdown', val: data.metrics.max_drawdown },
            { label: 'VaR (95%)', type: 'var', val: data.metrics.var },
            { label: 'Sortino', type: 'sortino', val: data.metrics.sortino },
            { label: 'Diversification', type: 'diversification', val: data.metrics.diversification }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col justify-center">
              <p className="text-[9px] text-zinc-500 uppercase font-bold leading-none mb-1">{stat.label}</p>
              <p className={`text-sm font-mono font-medium ${getMetricColor(stat.val, stat.type)}`}>
                {formatMetric(stat.val, stat.type)}
              </p>
            </div>
          ))}
        </div>
      )
    }
  ];

  const handleNext = () => setActiveTab((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveTab((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          {slides[activeTab].icon}
          <h3 className="font-medium text-white/70 text-xs uppercase tracking-wider">
            {slides[activeTab].title}
          </h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={handlePrev} 
            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext} 
            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Chart/Metrics Viewport */}
      <div className="flex-1 min-h-0 w-full p-4">
        {activeTab === 2 ? (
          /* Institutional Stats Grid */
          slides[activeTab].component
        ) : (
          /* Recharts Container */
          <ResponsiveContainer width="100%" height="100%">
            {slides[activeTab].component}
          </ResponsiveContainer>
        )}
      </div>

      {/* Pagination Dots */}
      <div className="pb-4 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${
              i === activeTab ? 'w-4 bg-blue-500' : 'w-1 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}