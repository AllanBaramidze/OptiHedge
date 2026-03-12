"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PieChart as PieIcon, BarChart3, Activity, Hash } from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
} from 'recharts';
import * as H from "@/types/hedge";
import { formatMetric, getMetricColor } from "@/lib/utils/formatters";

interface RiskChartsProps {
  data: H.HedgeAnalysisResponse | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper for Correlation Heatmap Colors
const getCorrColor = (val: number) => {
  if (val >= 0.8) return 'bg-emerald-500/80 text-white';
  if (val >= 0.5) return 'bg-emerald-500/40 text-emerald-200';
  if (val >= 0.2) return 'bg-emerald-500/10 text-emerald-500/70';
  if (val <= -0.2) return 'bg-red-500/20 text-red-400';
  return 'bg-zinc-800 text-zinc-500';
};

export function RiskCharts({ data }: RiskChartsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!data || !data.metrics) {
    return (
      <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-2xl flex items-center justify-center">
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Awaiting Engine Sync...
        </p>
      </div>
    );
  }

  // --- DATA TRANSFORMATIONS ---
  const sectorData = Object.entries(data.sector_weights || {}).map(([name, value]) => ({
    name,
    value: value * 100
  }));

  const exposureData = [...(data.data || [])]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((h) => ({
      ticker: h.ticker,
      weight: h.weight * 100
    }));

  // --- CORRELATION MATRIX LOGIC ---
  const renderCorrelationMatrix = () => {
    const matrix = data.metrics.correlation_matrix || {};
    const tickers = Object.keys(matrix);

    if (tickers.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest text-center">
            No Correlation Data
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div 
          className="grid gap-1 flex-1" 
          style={{ 
            gridTemplateColumns: `repeat(${tickers.length + 1}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${tickers.length + 1}, minmax(0, 1fr))` 
          }}
        >
          <div />
          {tickers.map(t => (
            <div key={t} className="text-[8px] font-bold text-zinc-500 flex items-center justify-center truncate px-1">
              {t}
            </div>
          ))}
          {tickers.map(rowTicker => (
            <React.Fragment key={rowTicker}>
              <div className="text-[8px] font-bold text-zinc-500 flex items-center pr-1 truncate">
                {rowTicker}
              </div>
              {tickers.map(colTicker => {
                const val = matrix[rowTicker]?.[colTicker] ?? 0;
                return (
                  <div 
                    key={`${rowTicker}-${colTicker}`}
                    className={`rounded-sm flex items-center justify-center text-[9px] font-mono transition-colors ${getCorrColor(val)}`}
                    title={`${rowTicker} vs ${colTicker}: ${val.toFixed(2)}`}
                  >
                    {val.toFixed(1)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const slides = [
    {
      title: "Sector Allocation",
      icon: <PieIcon className="w-4 h-4 text-blue-400" />,
      type: "chart",
      component: (
        <PieChart>
          <Pie 
            data={sectorData.length ? sectorData : [{ name: 'Empty', value: 1 }]} 
            innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
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
      type: "chart",
      component: (
        <BarChart data={exposureData} layout="vertical" margin={{ left: -10, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="ticker" type="category" width={60} fontSize={10} stroke="#52525b" />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#18181b', border: 'none' }} 
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
      title: "Correlation Matrix",
      icon: <Hash className="w-4 h-4 text-purple-400" />,
      type: "custom",
      component: renderCorrelationMatrix()
    },
    {
      title: "Risk Metrics",
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      type: "custom",
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
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          {slides[activeTab].icon}
          <h3 className="font-medium text-white/70 text-xs uppercase tracking-wider">
            {slides[activeTab].title}
          </h3>
        </div>
        <div className="flex gap-1">
          <button onClick={handlePrev} className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full p-4">
        {slides[activeTab].type === "chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            {slides[activeTab].component as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          slides[activeTab].component
        )}
      </div>

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