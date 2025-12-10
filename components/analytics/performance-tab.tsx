"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  getAgentPerformance,
  getAnalyticsSummary,
} from "@/lib/data/analytics-data";
import { formatCurrency, formatDuration } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PRIMARY_COLOR = "#f59e0b";

interface PerformanceTabProps {
  dateRange: "7d" | "14d" | "30d";
}

export function PerformanceTab({ dateRange }: PerformanceTabProps) {
  const agentPerformance = getAgentPerformance(dateRange);
  const summary = getAnalyticsSummary(dateRange);
  const sortedByExecutions = [...agentPerformance].sort((a, b) => b.executions - a.executions);
  const avgSuccessRate = agentPerformance.reduce((sum, a) => sum + a.successRate, 0) / agentPerformance.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Avg Success Rate"
          value={`${avgSuccessRate.toFixed(1)}%`}
          change="+2.3%"
          changeType="positive"
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(summary.avgDuration)}
          change="Across all agents"
          changeType="neutral"
        />
        <StatsCard
          title="Active Agents"
          value={`${summary.activeAgents}/${summary.totalAgents}`}
          change="Agents running this period"
          changeType="neutral"
        />
        <StatsCard
          title="Failure Rate"
          value={`${(100 - avgSuccessRate).toFixed(1)}%`}
          change="-0.5% improvement"
          changeType="positive"
        />
      </div>

      {/* Agent Performance Table */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Agent Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-800">
              <thead className="bg-card">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Executions
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg Duration
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {sortedByExecutions.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/agents/${agent.agentId}`}
                        className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                      >
                        {agent.agentName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-foreground">
                        {agent.executions.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`text-sm font-medium ${
                          agent.successRate >= 95
                            ? "text-foreground"
                            : agent.successRate >= 90
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {agent.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-muted-foreground">{formatDuration(agent.avgDuration)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-muted-foreground">{formatCurrency(agent.avgCost)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {agent.trend === "up" && (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-400">+{agent.trendValue}%</span>
                          </>
                        )}
                        {agent.trend === "down" && (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-red-400">{agent.trendValue}%</span>
                          </>
                        )}
                        {agent.trend === "stable" && (
                          <>
                            <Minus className="h-4 w-4 text-foreground0" />
                            <span className="text-sm text-foreground0">0%</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Distribution */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Success Rate by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sortedByExecutions}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" domain={[90, 100]} stroke="#9ca3af" fontSize={12} tickLine={false} />
              <YAxis
                type="category"
                dataKey="agentName"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                width={120}
                tick={{ fill: "#a8a29e" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1c1917",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f5f5f4",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Success Rate"]}
              />
              <Bar dataKey="successRate" fill={PRIMARY_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
