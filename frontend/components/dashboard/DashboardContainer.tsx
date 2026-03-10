"use client";

import React, { useState, useSyncExternalStore, useCallback, useMemo } from "react";
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

const ALL_AVAILABLE_WIDGETS: Omit<T.WidgetData, "id">[] = [
  { size: "medium", title: "Portfolio Value", type: "value", description: "Current market value of all assets." },
  { size: "small", title: "PnL %", type: "pnl_percent", description: "Overall performance percentage." },
  { size: "small", title: "Sharpe Ratio", type: "sharpe", description: "Risk-adjusted return vs volatility." },
  { size: "small", title: "Portfolio Beta", type: "beta", description: "Sensitivity relative to S&P 500." },
  { size: "small", title: "Holdings List", type: "holdings", description: "Vertical list of all active assets." },
  // add sector exposure, 
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

  if (!isClient) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="pt-10 p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-white/40 mt-1">Real-time risk analytics engine.</p>
          </div>
          <div className="flex items-center gap-3">
            <WalletSelector onWalletChange={handleWalletChange} />
            <WidgetSearch 
              available={ALL_AVAILABLE_WIDGETS} 
              onSelect={(t) => setWidgets(prev => [...prev, { ...t, id: crypto.randomUUID() }])} 
            />
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets} strategy={rectSortingStrategy}>
            {/* GRID GAP-6 only works if items don't have fixed pixel widths */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[160px]">
              {widgets.map((w) => {
                const isHoldings = w.type === "holdings";
                return (
                  <div key={w.id} className={cn(
                    w.size === "medium" ? "col-span-2" : "col-span-1",
                    isHoldings ? "row-span-2" : "row-span-1",
                    "h-full" // Ensure vertical filling
                  )}>
                    <SortableWidget
                      widget={w}
                      data={isHoldings ? analysisData?.data : analysisData?.metrics?.[w.type]}
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
                activeWidget.size === "medium" ? "w-156" : "w-75", 
                activeWidget.type === "holdings" ? "h-86" : "h-40"
              )}>
                <MetricWidget 
                  {...activeWidget} 
                  isOverlay 
                  data={activeWidget.type === "holdings" ? analysisData?.data : analysisData?.metrics?.[activeWidget.type]} 
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
}