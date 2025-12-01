"use client";

import { useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentExecutions } from "@/components/dashboard/recent-executions";
import { ActiveAgents } from "@/components/dashboard/active-agents";
import { Header } from "@/components/layout/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockDashboardStats,
  mockExecutions,
  mockAgents,
} from "@/lib/data/mock-data";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default function Home() {
  const [dateRange, setDateRange] = useState("30d");
  const stats = mockDashboardStats;
  const recentExecutions = mockExecutions.slice(0, 5);
  const activeAgents = mockAgents.filter((a) => a.status === "active").slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-50">Overview</h1>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] border-stone-700 bg-stone-900 text-stone-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-700 bg-stone-900">
                <SelectItem value="7d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 7 days
                </SelectItem>
                <SelectItem value="14d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 14 days
                </SelectItem>
                <SelectItem value="30d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 30 days
                </SelectItem>
                <SelectItem value="90d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 90 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              usage={{ current: 5972, max: 10000 }}
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
              value={formatCurrency(stats.totalCost)}
              change="-5.2%"
              changeType="positive"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Executions */}
            <RecentExecutions executions={recentExecutions} />

            {/* Active Agents */}
            <ActiveAgents agents={activeAgents} />
          </div>
        </div>
      </main>
    </>
  );
}
