// frontend/types/dashboard.ts

export type WidgetSize = "small" | "medium" | "large";

export interface AssetHolding {
  ticker: string;
  qty: number;
  cost: number;
  price: number;
  market_value: number;
  weight: number;
}

export type SectorWeights = Record<string,number>;

export interface PortfolioMetrics {
  value: number;
  pnl: number;
  pnl_percent: number;
  [key: string]: number; 
}
export interface MoverItem {
  ticker: string;
  value: number;
}

export interface AnalysisResponse {
  metrics: PortfolioMetrics;
  data: AssetHolding[]; 
  status: string;
  sector_weights?: SectorWeights;
  movers: Record<string, MoverItem[]>;
}

export interface WidgetData {
  id: string;
  size: WidgetSize;
  title: string;
  type: string;
  description: string;
}

export interface SupabasePortfolioItem {
  symbol: string;
  quantity: number;
  avg_cost: number;
}

export interface SupabaseWalletResponse {
  portfolio_items: SupabasePortfolioItem[];
}