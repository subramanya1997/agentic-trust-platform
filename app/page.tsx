"use client";

import { useState } from "react";
import Link from "next/link";
import {
  StatsCard,
  ExecutionTrend,
  QuickActions,
  RecentActivity,
} from "@/components/dashboard";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import {
  mockDashboardStats,
  mockExecutions,
} from "@/lib/data/mock-data";
import {
  getAnalyticsData,
} from "@/lib/data/analytics-data";
import { mockExecutionTraces } from "@/lib/data/activity-data";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

export default function Home() {
  const [dateRange, setDateRange] = useState<"7d" | "14d" | "30d">("7d");
  const [now] = useState(() => Date.now());

  const stats = mockDashboardStats;
  const costData = getAnalyticsData(dateRange);
  const recentExecutions = mockExecutionTraces.slice(0, 10);

  // Calculate action items
  const pendingApprovals = mockExecutions.filter(
    (e) => e.status === "waiting_approval"
  ).length;
  const recentFailures = mockExecutionTraces.filter((t) => {
    const executionTime = new Date(t.startedAt).getTime();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    return t.status === "failed" && executionTime > oneDayAgo;
  }).length;

  // Create sparkline data for executions
  const executionSparkline = costData.map((d) => ({ value: d.executions }));
  const costSparkline = costData.map((d) => ({ value: d.cost }));

  // Calculate totals
  const totalCost = costData.reduce((sum, d) => sum + d.cost, 0);
  const projectedMonthly = Math.round((totalCost / (dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30)) * 30);

  return (
    <>
      <Header 
        subtitle="Monitor your AI agent infrastructure at a glance"
        actionButton={
          <div className="flex items-center gap-2">
            {pendingApprovals > 0 && (
              <Link href="/activity?status=waiting_approval">
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-800 hover:bg-amber-500/20 cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {pendingApprovals} Pending
                </Badge>
              </Link>
            )}
            {recentFailures > 0 && (
              <Link href="/activity?status=failed">
                <Badge
                  variant="outline"
                  className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-800 hover:bg-red-500/20 cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  {recentFailures} Failed
                </Badge>
              </Link>
            )}
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="space-y-6 min-w-0">

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Agents"
              value={stats.totalAgents}
              change={`${stats.activeAgents} active`}
              changeType="neutral"
            />
            <StatsCard
              title="Executions"
              value={stats.totalExecutions.toLocaleString()}
              change="+8.3%"
              changeType="positive"
              sparkline={{ data: executionSparkline }}
            />
            <StatsCard
              title="Success Rate"
              value={formatPercentage(stats.successRate)}
              change="+2.3%"
              changeType="positive"
              usage={{ current: stats.successRate, max: 100 }}
            />
            <StatsCard
              title="Total Cost"
              value={formatCurrency(totalCost)}
              change={`~${formatCurrency(projectedMonthly)}/mo projected`}
              changeType="neutral"
              sparkline={{ data: costSparkline, color: "#22c55e" }}
            />
          </div>

          {/* Execution Trend + Recent Activity Side by Side */}
          <div className="grid gap-6 lg:grid-cols-[1fr_0.43fr]">
            {/* Execution Trend Chart - 70% */}
            <ExecutionTrend
              data={costData}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {/* Recent Activity - 30% */}
            <RecentActivity executions={recentExecutions} />
          </div>

          {/* Quick Actions Footer */}
          <QuickActions />
        </div>
      </main>
    </>
  );
}
