import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: "teal" | "blue" | "purple" | "orange";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon, color = "teal", trend }: MetricCardProps) {
  const colorStyles = {
    teal: "from-teal-500 to-cyan-500",
    blue: "from-blue-500 to-indigo-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-amber-500",
  };

  const bgStyles = {
    teal: "from-teal-50 to-cyan-50",
    blue: "from-blue-50 to-indigo-50",
    purple: "from-purple-50 to-pink-50",
    orange: "from-orange-50 to-amber-50",
  };

  return (
    <Card className="group hover:scale-105 transition-transform duration-300 overflow-hidden relative">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        bgStyles[color]
      )} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <div className={cn(
              "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              colorStyles[color]
            )}>
              {value}
            </div>
            {trend && (
              <div className={cn(
                "flex items-center mt-2 text-sm font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg",
            colorStyles[color]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
