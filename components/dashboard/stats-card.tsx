"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

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
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  usage,
}: StatsCardProps) {
  const usagePercent = usage ? (usage.current / usage.max) * 100 : 0;

  return (
    <Card className="bg-stone-900 border-stone-800">
      <div className="px-4">
        <p className="text-xs font-medium text-stone-400">{title}</p>
        <p className="mt-0.5 text-xl font-bold text-stone-50">{value}</p>
        
        <div className="mt-1.5 flex items-center justify-between">
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
                  changeType === "neutral" && "text-stone-400"
                )}
              >
                {change}
              </span>
            </div>
          )}
          
          {usage && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-stone-500 rounded-full"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-500">
                {usage.label || `${formatCompact(usage.current)} / ${formatCompact(usage.max)}`}
              </span>
            </div>
          )}
        </div>
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
