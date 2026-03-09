"use client";

import React, {
  useState,
  useMemo,
  useSyncExternalStore,
  useCallback,
} from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableWidget } from "./SortableWidget";
import { MetricWidget } from "./MetricWidget";
import { WidgetSearch } from "./WidgetSearch";
import { WalletSelector } from "./WalletSelector";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPortfolioById } from "@/app/upload/actions";

// --- EXPORTED TYPES ---
export type WidgetSize = "small" | "medium" | "large";

export interface WidgetData {
  id: string;
  size: WidgetSize;
  title: string;
  type: string;
  description: string;
}

// Ensure this interface matches the structure returned by your FastAPI backend
interface ChartData {
  data: Array<{
    x: string[];
    y: number[];
    name: string;
    line: { color: string; width: number };
  }>;
  layout: {
    template: string;
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: { t: number; l: number; r: number; b: number };
  };
}

export interface AnalysisResponse {
  metrics: {
    var: string;
    sharpe: number;
    beta: number;
    drawdown: string;
    [key: string]: string | number;
  };
  chart: ChartData; // FIXED: Changed from 'any' to 'ChartData'
  status: string;
  analyzed_assets: string[];
}

interface SupabasePortfolioItem {
  symbol: string;
  quantity: number;
  avg_cost: number;
}

// --- CONSTANTS ---
const INITIAL_LAYOUT: WidgetData[] = [
  {
    id: "sharpe-ratio-1",
    size: "small",
    title: "Sharpe Ratio",
    type: "sharpe",
    description: "Risk-adjusted return.",
  },
  {
    id: "portfolio-alloc-2",
    size: "medium",
    title: "Portfolio Allocation",
    type: "allocation",
    description: "Asset distribution.",
  },
  {
    id: "perf-history-3",
    size: "large",
    title: "Performance History",
    type: "performance",
    description: "Historical analysis.",
  },
];

const ALL_AVAILABLE_WIDGETS: Omit<WidgetData, "id">[] = [
  {
    size: "small",
    title: "Total Portfolio Value",
    type: "value",
    description: "Market value.",
  },
  {
    size: "small",
    title: "Sharpe Ratio",
    type: "sharpe",
    description: "Risk return.",
  },
  {
    size: "medium",
    title: "Portfolio Beta",
    type: "beta",
    description: "Market sensitivity.",
  },
];

// --- HYDRATION HELPERS (Fixes "Cannot find name") ---
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function DashboardContainer() {
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [widgets, setWidgets] = useState<WidgetData[]>(INITIAL_LAYOUT);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeWidget = useMemo(
    () => widgets.find((w) => w.id === activeId),
    [activeId, widgets],
  );

  const handleWalletChange = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsAnalyzing(true);
    try {
      const wallet = await getPortfolioById(walletId);
      const holdingsData = wallet.portfolio_items.map(
        (item: SupabasePortfolioItem) => ({
          symbol: item.symbol,
          quantity: item.quantity,
          avgCost: item.avg_cost,
        }),
      );

      const res = await fetch("http://localhost:8000/analyze-portfolio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: holdingsData }),
      });

      if (!res.ok) throw new Error("Engine failed");
      const result: AnalysisResponse = await res.json();
      setAnalysisData(result);
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const addWidget = (template: Omit<WidgetData, "id">) => {
    const newWidget = { ...template, id: crypto.randomUUID() };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  if (!isClient) return <div className="pt-24 p-8">Loading Dashboard...</div>;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="pt-10 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            <WalletSelector onWalletChange={handleWalletChange} />
            <WidgetSearch
              available={ALL_AVAILABLE_WIDGETS}
              onSelect={addWidget}
            />
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  data={
                    analysisData?.metrics
                      ? analysisData.metrics[widget.type]
                      : null
                  }
                  loading={isAnalyzing}
                  onRemove={removeWidget}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              duration: 250, // smooth snap duration
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.32)", // nice overshoot feel
            }}
          >
            {activeWidget && (
              <MetricWidget
                {...activeWidget} // spread title, size, description, etc.
                id={activeWidget.id}
                isOverlay
                // Optional: slight scale or opacity to indicate "dragging"
                classNameOverride="opacity-90 scale-[1.03] shadow-2xl ring-2 ring-white/30"
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  );
}
