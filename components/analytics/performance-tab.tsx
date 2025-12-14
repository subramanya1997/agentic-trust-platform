"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import {
  getAgentPerformance,
  getAnalyticsSummary,
} from "@/lib/data/analytics-data";
import { formatCurrency, formatDuration } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  Minus,
} from "@/lib/icons";
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
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: 'Agent', align: 'left' },
              { label: 'Executions', align: 'right' },
              { label: 'Success Rate', align: 'right' },
              { label: 'Avg Duration', align: 'right' },
              { label: 'Avg Cost', align: 'right' },
              { label: 'Trend', align: 'right' },
            ]}
          >
            {sortedByExecutions.map((agent) => (
              <TableRow key={agent.agentId}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/agents/${agent.agentId}`}
                    className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                  >
                    {agent.agentName}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-foreground">
                    {agent.executions.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
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
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-muted-foreground">{formatDuration(agent.avgDuration)}</span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-muted-foreground">{formatCurrency(agent.avgCost)}</span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>

      {/* Success Rate Distribution */}
      <div className="w-1/2">
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
    </div>
  );
}
