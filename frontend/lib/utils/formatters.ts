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