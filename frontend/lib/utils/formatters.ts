import * as T from "@/types/dashboard";

/**
 * Formats raw backend data into human-readable strings for the UI.
 * Handles currencies, percentages, and raw floats while safely ignoring complex objects.
 */
export function formatMetric(
  value: number | string | T.AssetHolding[] | T.SectorWeights | Record<string, T.MoverItem[]> | null | undefined, 
  type: string
): string {
  // 1. Early exit for complex objects (handled by specialized renderers in MetricWidget)
  if (
    !value || 
    type === "movers" || 
    type === "holdings" || 
    type === "sectors" || 
    typeof value === 'object'
  ) {
    return "";
  }

  // 2. Convert to number for mathematical formatting
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  // 3. Safety fallback for invalid numbers
  if (isNaN(num)) return "0.00";

  // 4. Currency Formatting (USD)
  if (type === "value" || type === "pnl") {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  }
  
  // 5. Percentage Formatting
  if (type === "pnl_percent" || type === "max_drawdown" || type === "var" || type === "ulcer_index") {
    const prefix = num > 0 && type === "pnl_percent" ? "+" : "";
    return `${prefix}${(num * 100).toFixed(2)}%`;
  }
  
  // 6. Raw Float Formatting (Sharpe, Beta, Sortino, Calmar, Skewness, Kurtosis, etc.)
  return num.toFixed(2);
}

/**
 * Determines the Tailwind text color class based on the metric type and value.
 * Matches institutional risk standards (Sharpe, Beta, Max DD, etc.)
 */
export function getMetricColor(value: number | string | null | undefined, type: string): string {
  if (value === null || value === undefined) return "text-white";
  
  // Convert to number for comparison
  const val = typeof value === "number" 
    ? value 
    : parseFloat(String(value).replace(/[%,$]/g, ""));

  if (isNaN(val)) return "text-white";

  // 1. PnL Logic
  if (type.includes("pnl")) {
    return val > 0 ? "text-emerald-400" : val < 0 ? "text-rose-500" : "text-white";
  }

  // 2. Risk-Adjusted Return (Sharpe/Sortino)
  if (type === "sharpe" || type === "sortino") {
    if (val >= 2.0) return "text-emerald-400";
    if (val >= 1.0) return "text-emerald-300";
    if (val >= 0.5) return "text-white";
    return val >= 0.0 ? "text-rose-300" : "text-rose-500";
  }

  // 3. Volatility / Sensitivity (Beta)
  if (type === "beta") {
    if (val > 1.5) return "text-rose-500";
    if (val > 1.2) return "text-rose-300";
    if (val >= 0.8) return "text-white";
    return val >= 0.0 ? "text-emerald-300" : "text-emerald-400";
  }

  // 4. Downside Risk (Drawdown, VaR, Ulcer)
  if (type === "max_drawdown" || type === "var" || type === "ulcer_index") {
    const absVal = Math.abs(val); // Handle both -0.2 and 0.2 logic
    if (absVal >= 0.2) return "text-rose-500";
    if (absVal >= 0.1) return "text-rose-300";
    if (absVal >= 0.05) return "text-white";
    return "text-emerald-300";
  }

  // 5. Efficiency & Diversification
  if (type === "calmar") {
    if (val >= 3.0) return "text-emerald-400";
    return val >= 1.0 ? "text-white" : "text-rose-400";
  }

  if (type === "diversification") {
    if (val >= 1.5) return "text-emerald-400";
    if (val >= 1.1) return "text-emerald-300";
    return val >= 0.9 ? "text-white" : "text-rose-400";
  }

  return "text-white";
}