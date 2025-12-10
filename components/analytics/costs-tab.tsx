"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  getCostBreakdown,
  getAnalyticsSummary,
} from "@/lib/data/analytics-data";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const PRIMARY_COLOR = "#f59e0b";

interface CostsTabProps {
  costData: { date: string; cost: number; executions: number }[];
  totalCost: number;
  totalExecutions: number;
  dateRange: "7d" | "14d" | "30d";
}

export function CostsTab({
  costData,
  totalCost,
  totalExecutions,
  dateRange,
}: CostsTabProps) {
  const summary = getAnalyticsSummary(dateRange);
  const costBreakdown = getCostBreakdown(dateRange);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          change="-5.2%"
          changeType="positive"
        />
        <StatsCard
          title="Cost per Execution"
          value={`$${(totalCost / totalExecutions).toFixed(3)}`}
          change="Average across all agents"
          changeType="neutral"
        />
        <StatsCard
          title="Total Executions"
          value={totalExecutions.toLocaleString()}
          change="+8.3%"
          changeType="positive"
        />
        <StatsCard
          title="Projected Monthly"
          value={formatCurrency(summary.projectedMonthly)}
          change="Based on current usage"
          changeType="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost Trend */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={costData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f5f5f4",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2}
                  fill="url(#colorCost)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Execution Volume */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Execution Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f5f5f4",
                  }}
                />
                <Bar dataKey="executions" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost by Model */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Cost by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costBreakdown.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold text-foreground ml-2">
                        {formatCurrency(item.cost)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex-1 bg-accent rounded-full h-2 mr-3">
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
