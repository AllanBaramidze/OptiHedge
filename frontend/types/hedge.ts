export interface RiskMetrics {
  value: number;
  pnl: number;
  pnl_percent: number;
  count: number;
  sharpe: number;
  beta: number;
  sortino: number;
  max_drawdown: number;
  var: number;
  calmar: number;
  ulcer_index: number;
  skewness: number;
  kurtosis: number;
  diversification: number;
  correlation_matrix?: Record<string, Record<string, number>>;
}

export interface Holding {
  ticker: string;
  qty: number;
  cost: number;
  price: number;
  market_value: number;
  weight: number;
}

// Added this to replace 'any'
export interface AssetMover {
  ticker: string;
  change_percent: number;
  price: number;
}

export interface HedgeAnalysisResponse {
  status: string;
  metrics: RiskMetrics;
  data: Holding[];
  sector_weights: Record<string, number>;
  ticker_list: string[];
  movers: AssetMover[]; // No more 'any'
}