"use client";

import React, { useState, useEffect, useSyncExternalStore, useCallback, useMemo } from "react";
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay 
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import { SortableWidget } from "./SortableWidget";
import { MetricWidget } from "./MetricWidget";
import { WidgetSearch } from "./WidgetSearch";
import { WalletSelector } from "./WalletSelector";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPortfolioById } from "@/app/upload/actions";
import { cn } from "@/lib/utils";
import * as T from "@/types/dashboard";

const STORAGE_KEY = "optihedge_layout_v1";

const ALL_AVAILABLE_WIDGETS: Omit<T.WidgetData, "id">[] = [
  // Core Metrics
  { size: "medium", title: "Portfolio Value", type: "value", description: "Current market value of all assets." },
  { size: "small", title: "PnL %", type: "pnl_percent", description: "Overall performance percentage." },
  { size: "small", title: "Holdings List", type: "holdings", description: "Vertical list of all active assets." },
  { size: "small", title: "Sector Exposure", type: "sectors", description: "Portfolio Weights in each Sector."},
  
  // Advanced Risk Metrics
  { size: "small", title: "Sharpe Ratio", type: "sharpe", description: "Risk-adjusted return vs volatility." },
  { size: "small", title: "Sortino Ratio", type: "sortino", description: "Risk-adjusted return penalizing only downside volatility." },
  { size: "small", title: "Portfolio Beta", type: "beta", description: "Sensitivity relative to S&P 500." },
  { size: "small", title: "Max Drawdown", type: "max_drawdown", description: "Largest peak-to-trough drop." },
  { size: "small", title: "Value at Risk", type: "var", description: "Maximum expected loss at 95% confidence." },
  { size: "small", title: "Calmar Ratio", type: "calmar", description: "Annualized return divided by Max Drawdown." },
  { size: "small", title: "Ulcer Index", type: "ulcer_index", description: "Depth and duration of drawdowns." },
  { size: "small", title: "Skewness", type: "skewness", description: "Asymmetry of returns (Positive = frequent small losses, big gains)." },
  { size: "small", title: "Kurtosis", type: "kurtosis", description: "Fat tails / extreme event risk." },
  { size: "small", title: "Diversification", type: "diversification", description: "Weighted asset volatility vs total portfolio volatility." },
  { size: "large", title: "Top Movers", type: "movers", description: "Best and worst performing assets over time." },
];

const INITIAL_LAYOUT: T.WidgetData[] = [
  { id: "val-1", size: "medium", title: "Portfolio Value", type: "value", description: "Total Market Value." },
  { id: "holdings-list-1", size: "small", title: "Portfolio Holdings", type: "holdings", description: "Active positions." },
  { id: "pnl-2", size: "small", title: "Total PnL", type: "pnl", description: "Unrealized Gain/Loss." },
];

const subscribe = () => () => {};
const getSnapshot = () => true;

export default function DashboardContainer() {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [widgets, setWidgets] = useState<T.WidgetData[]>(INITIAL_LAYOUT);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<T.AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. Load layout from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved layout", e);
      }
    }
  }, []);

  // 2. Save layout whenever widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }
  }, [widgets]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeWidget = useMemo(() => widgets.find((w) => w.id === activeId), [activeId, widgets]);

  const handleWalletChange = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsAnalyzing(true);
    try {
      const wallet = (await getPortfolioById(walletId)) as unknown as T.SupabaseWalletResponse;
      const holdings = wallet.portfolio_items.map((item: T.SupabasePortfolioItem) => ({
        symbol: item.symbol, quantity: item.quantity, avgCost: item.avg_cost,
      }));
      const res = await fetch("http://localhost:8000/wallet/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });
      setAnalysisData(await res.json());
    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
  }, []);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
    setActiveId(null);
  };

  const resetLayout = () => {
    if (confirm("Reset dashboard to default layout?")) {
      setWidgets(INITIAL_LAYOUT);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (!isClient) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="pt-10 p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-white/40 mt-1">Real-time risk analytics engine.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={resetLayout}
                className="text-[10px] uppercase font-bold text-zinc-600 hover:text-rose-400 transition-colors tracking-widest"
            >
                Reset Layout
            </button>
            <WalletSelector onWalletChange={handleWalletChange} />
            <WidgetSearch 
              available={ALL_AVAILABLE_WIDGETS} 
              onSelect={(t) => setWidgets(prev => [...prev, { ...t, id: crypto.randomUUID() }])} 
            />
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[160px]">
              {widgets.map((w) => {
                const isTall = w.type === "holdings" || w.type === "sectors";
                return (
                  <div key={w.id} className={cn(
                      w.size === "large" ? "col-span-2 row-span-2" : w.size === "medium" ? "col-span-2 row-span-1" : "col-span-1",
                      isTall && w.size !== "large" ? "row-span-2" : "",
                      "h-full"
                      )}>
                    <SortableWidget
                      widget={w}
                      data={
                        w.type === "holdings" ? analysisData?.data : 
                        w.type === "sectors" ? analysisData?.sector_weights :
                        w.type === "movers" ? analysisData?.movers :
                        analysisData?.metrics?.[w.type]
                      }
                      loading={isAnalyzing}
                      onRemove={(id) => setWidgets(prev => prev.filter(x => x.id !== id))}
                    />
                  </div>
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeWidget && (
              <div className={cn(
                "transition-transform duration-200",
                activeWidget.size === "large" ? "w-164 h-86" :
                activeWidget.size === "medium" ? "w-164 h-40" : "w-79 h-40", 
                (activeWidget.type === "holdings" || activeWidget.type === "sectors") && activeWidget.size !== "large" && "h-86"
              )}>
                <MetricWidget 
                  {...activeWidget} 
                  isOverlay 
                  data={
                    activeWidget.type === "holdings" ? analysisData?.data : 
                    activeWidget.type === "sectors" ? analysisData?.sector_weights : 
                    activeWidget.type === "movers" ? analysisData?.movers :
                    analysisData?.metrics?.[activeWidget.type]
                  } 
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
}