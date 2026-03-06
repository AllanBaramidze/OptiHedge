import RiskCard from "@/components/dashboard/RiskCard";
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Scale, 
  LayoutDashboard 
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="pt-24 px-6 md:px-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Terminal
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time risk assessment and AI portfolio optimization.
          </p>
        </div>
        {/* Placeholder for your Wallet Selector later */}
        <div className="h-10 w-48 bg-muted rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
          Wallet Selector Placeholder
        </div>
      </div>

      {/* 1. Risk & Performance Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskCard 
          title="Value-at-Risk (VaR)"
          value="$12,450"
          description="95% Confidence (1-Day)"
          icon={ShieldAlert}
          trend={{ value: "2.4%", isPositive: false }}
        />
        <RiskCard 
          title="Sharpe Ratio"
          value="1.84"
          description="Risk-adjusted return"
          icon={TrendingUp}
          trend={{ value: "0.12", isPositive: true }}
        />
        <RiskCard 
          title="Portfolio Beta"
          value="1.12"
          description="Sensitivity to S&P 500"
          icon={Activity}
        />
        <RiskCard 
          title="MVO vs. DRL Delta"
          value="4.2%"
          description="Model allocation drift"
          icon={Scale}
        />
      </div>

      {/* 2. Main Analytics Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Comparison (Paper 2) */}
        <div className="lg:col-span-2 h-100 rounded-xl border border-border/50 bg-card/30 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
          <div className="text-center z-10">
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-widest mb-2">Paper 2 Implementation</p>
            <h3 className="text-xl font-medium">DRL vs. MVO Comparison</h3>
            <p className="text-muted-foreground text-sm mt-2">Cumulative Return Chart Placeholder</p>
          </div>
        </div>

        {/* Sentiment & GAT (Paper 1) */}
        <div className="h-100 rounded-xl border border-border/50 bg-card/30 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent opacity-50" />
          <div className="text-center z-10">
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-widest mb-2">Paper 1 Implementation</p>
            <h3 className="text-xl font-medium">Sentiment GAT Graph</h3>
            <p className="text-muted-foreground text-sm mt-2">Asset Correlation Map Placeholder</p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Stress Test Placeholder */}
      <div className="w-full h-48 rounded-xl border border-dashed border-border/50 flex items-center justify-center bg-muted/5">
        <p className="text-sm text-muted-foreground">
          Macro Scenario Simulator (Interest Rate & Geopolitical Shock)
        </p>
      </div>
    </div>
  );
}