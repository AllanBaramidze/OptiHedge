import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RiskCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function RiskCard({ title, value, description, icon: Icon, trend }: RiskCardProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary opacity-70" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend && (
            <span className={trend.isPositive ? "text-emerald-500" : "text-rose-500"}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}