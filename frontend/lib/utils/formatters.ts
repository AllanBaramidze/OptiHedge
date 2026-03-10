// frontend/lib/utils/formatters.ts

export const formatMetric = (value: number | string | null, type: string) => {
  if (value === null || value === undefined) return "---";

  // Convert string metrics (like "15.5%") to numbers if needed
  const num = typeof value === "string" ? parseFloat(value.replace(/[%,$]/g, "")) : value;

  switch (type) {
    case "value":
    case "pnl":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(num);

    case "pnl_percent":
    case "volatility":
    case "max_drawdown":
      return `${num > 0 && type === "pnl_percent" ? "+" : ""}${num.toFixed(2)}%`;

    case "sharpe":
    case "beta":
    case "alpha":
      return num.toFixed(2);

    case "count":
      return Math.floor(num).toString();

    default:
      return num.toString();
  }
};