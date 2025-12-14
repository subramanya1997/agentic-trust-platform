"use client";

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
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHourlyUsage, getUsageByDay, getAnalyticsSummary } from "@/lib/data/analytics-data";

const PRIMARY_COLOR = "#f59e0b";

interface UsageTabProps {
  dateRange: "7d" | "14d" | "30d";
}

export function UsageTab({ dateRange }: UsageTabProps) {
  const hourlyUsage = getHourlyUsage(dateRange);
  const usageByDay = getUsageByDay(dateRange);
  const summary = getAnalyticsSummary(dateRange);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Peak Hour"
          value={`${summary.peakHour}:00`}
          change={`${hourlyUsage[summary.peakHour].executions} executions`}
          changeType="neutral"
        />
        <StatsCard
          title="Peak Day"
          value={summary.peakDay}
          change={`${usageByDay.find((d) => d.day === summary.peakDay)?.executions.toLocaleString()} executions`}
          changeType="neutral"
        />
        <StatsCard
          title="Total API Calls"
          value={summary.totalApiCalls.toLocaleString()}
          change="Across all integrations"
          changeType="neutral"
        />
        <StatsCard
          title="Avg Latency"
          value={`${summary.avgLatency}ms`}
          change="API response time"
          changeType="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Usage */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Hourly Usage Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyUsage}>
                <defs>
                  <linearGradient id="colorExecutionsUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hour"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(h) => `${h}:00`}
                />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f5f5f4",
                  }}
                  labelFormatter={(h) => `${h}:00`}
                />
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke={PRIMARY_COLOR}
                  strokeWidth={2}
                  fill="url(#colorExecutionsUsage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Usage */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Usage by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} />
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

      {/* Usage Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Day", align: "left" },
              { label: "Executions", align: "right" },
              { label: "Unique Agents", align: "right" },
              { label: "Unique Users", align: "right" },
              { label: "Activity Level", align: "center" },
            ]}
          >
            {usageByDay.map((day) => {
              const maxExec = Math.max(...usageByDay.map((d) => d.executions));
              const activityLevel = (day.executions / maxExec) * 100;
              return (
                <TableRow key={day.day}>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-foreground text-sm font-medium">{day.day}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-foreground text-sm">
                      {day.executions.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-muted-foreground text-sm">{day.uniqueAgents}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-muted-foreground text-sm">{day.uniqueUsers}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="bg-accent h-2 w-24 rounded-full">
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{ width: `${activityLevel}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
