"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { TrendIndicator, TrendType } from "@/components/ui/trend-indicator";
import { UsageBar } from "@/components/ui/usage-bar";

interface SparklineDataPoint {
  value: number;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: TrendType;
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
  const sparklineColor = sparkline?.color || "#f59e0b";

  return (
    <Card className="relative overflow-hidden">
      {/* Sparkline Background */}
      {sparkline && sparkline.data.length > 0 && (
        <div className="absolute inset-0 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient
                  id={`sparkGradient-${title.replace(/\s/g, "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={1.5}
                fill={`url(#sparkGradient-${title.replace(/\s/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10 px-4">
        <p className="text-muted-foreground text-xs font-medium">{title}</p>
        <p className="text-foreground mt-0.5 text-xl font-bold">{value}</p>

        {/* Change indicator or Usage bar */}
        {usage ? (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              {change && <TrendIndicator value={change} type={changeType} />}
            </div>
            <UsageBar
              current={usage.current}
              max={usage.max}
              label={usage.label}
              showLabel={false}
            />
          </div>
        ) : change ? (
          <div className="mt-1.5">
            <TrendIndicator value={change} type={changeType} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
