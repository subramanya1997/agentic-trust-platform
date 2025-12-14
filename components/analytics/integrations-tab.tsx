"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { getIntegrationIcon } from "@/lib/integration-icons";
import {
  getIntegrationUsage,
  getAnalyticsSummary,
} from "@/lib/data/analytics-data";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "@/lib/icons";
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

interface IntegrationsTabProps {
  dateRange: "7d" | "14d" | "30d";
}

export function IntegrationsTab({ dateRange }: IntegrationsTabProps) {
  const integrationUsage = getIntegrationUsage(dateRange);
  const summary = getAnalyticsSummary(dateRange);
  const sortedByUsage = [...integrationUsage].sort((a, b) => b.callCount - a.callCount);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total API Calls"
          value={summary.totalApiCalls.toLocaleString()}
          change="+12.4%"
          changeType="positive"
        />
        <StatsCard
          title="Avg Latency"
          value={`${summary.avgLatency}ms`}
          change="Across all integrations"
          changeType="neutral"
        />
        <StatsCard
          title="Error Rate"
          value={`${summary.overallErrorRate}%`}
          change="-0.2% improvement"
          changeType="positive"
        />
        <StatsCard
          title="Active Integrations"
          value="8"
          change="Connected and in use"
          changeType="neutral"
        />
      </div>

      {/* Integration Usage Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: 'Integration', align: 'left' },
              { label: 'API Calls', align: 'right' },
              { label: 'Avg Latency', align: 'right' },
              { label: 'Error Rate', align: 'right' },
              { label: 'Cost', align: 'right' },
              { label: 'Agents', align: 'right' },
            ]}
          >
            {sortedByUsage.map((integration) => (
              <TableRow key={integration.integrationId}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/integrations/${integration.integrationId}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
                      <Image
                        src={getIntegrationIcon(integration.integrationId)}
                        alt={integration.integrationName}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {integration.integrationName}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-foreground">
                    {integration.callCount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span
                    className={`text-sm ${
                      integration.avgLatency < 400
                        ? "text-foreground"
                        : integration.avgLatency < 600
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {integration.avgLatency}ms
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    {integration.errorRate > 1 && (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span
                      className={`text-sm ${
                        integration.errorRate < 1
                          ? "text-foreground"
                          : integration.errorRate < 2
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {integration.errorRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-muted-foreground">{formatCurrency(integration.cost)}</span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                  <Badge variant="outline" className="bg-accent text-muted-foreground border">
                    {integration.agentsUsing}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Calls by Integration - Horizontal Bar */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">API Calls by Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedByUsage} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="integrationName"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  width={80}
                  tick={{ fill: "#a8a29e" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f5f5f4",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Calls"]}
                />
                <Bar dataKey="callCount" fill={PRIMARY_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latency by Integration */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground">Latency by Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedByUsage} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} unit="ms" />
                <YAxis
                  type="category"
                  dataKey="integrationName"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  width={80}
                  tick={{ fill: "#a8a29e" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1917",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f5f5f4",
                  }}
                  formatter={(value: number) => [`${value}ms`, "Latency"]}
                />
                <Bar dataKey="avgLatency" fill={PRIMARY_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
