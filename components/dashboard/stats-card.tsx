"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface SparklineDataPoint {
  value: number;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  // Optional usage bar props
  usage?: {
    current: number;
    max: number;
    label?: string;
  };
  // Optional sparkline props
  sparkline?: {
    data: SparklineDataPoint[];
    color?: string;
  };
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  usage,
  sparkline,
}: StatsCardProps) {
  const usagePercent = usage ? (usage.current / usage.max) * 100 : 0;
  const sparklineColor = sparkline?.color || "#f59e0b";

  return (
    <Card className="relative overflow-hidden">
      {/* Sparkline Background */}
      {sparkline && sparkline.data.length > 0 && (
        <div className="absolute inset-0 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkline.data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`sparkGradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={1.5}
                fill={`url(#sparkGradient-${title.replace(/\s/g, '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="px-4 relative z-10">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
        
        {/* Change indicator or Usage bar */}
        {usage ? (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              {change && (
                <div className="flex items-center gap-1">
                  {changeType === "positive" && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  {changeType === "negative" && (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      changeType === "positive" && "text-green-500",
                      changeType === "negative" && "text-red-500",
                      changeType === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {change}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-muted-foreground/60">
                {usage.label || `${formatCompact(usage.current)} / ${formatCompact(usage.max)}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  usagePercent >= 90 ? "bg-green-500" : 
                  usagePercent >= 70 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        ) : change ? (
          <div className="mt-1.5 flex items-center gap-1">
            {changeType === "positive" && (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
            {changeType === "negative" && (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-green-500",
                changeType === "negative" && "text-red-500",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
