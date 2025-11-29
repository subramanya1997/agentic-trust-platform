import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentExecutions } from "@/components/dashboard/recent-executions";
import { ActiveAgents } from "@/components/dashboard/active-agents";
import { Header } from "@/components/layout/header";
import {
  mockDashboardStats,
  mockExecutions,
  mockAgents,
} from "@/lib/data/mock-data";
import { Bot, Activity, TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default function Home() {
  const stats = mockDashboardStats;
  const recentExecutions = mockExecutions.slice(0, 5);
  const activeAgents = mockAgents.filter((a) => a.status === "active").slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Dashboard</h1>
            <p className="mt-1 text-sm text-stone-400">
              Monitor your AI agents and infrastructure
          </p>
        </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Agents"
              value={stats.totalAgents}
              change={`${stats.activeAgents} active`}
              changeType="positive"
              icon={Bot}
              iconColor="bg-amber-600"
            />
            <StatsCard
              title="Executions"
              value={stats.totalExecutions.toLocaleString()}
              change={formatPercentage(stats.successRate) + " success"}
              changeType="positive"
              icon={Activity}
              iconColor="bg-orange-600"
            />
            <StatsCard
              title="Success Rate"
              value={formatPercentage(stats.successRate)}
              change="+2.3% from last week"
              changeType="positive"
              icon={TrendingUp}
              iconColor="bg-amber-500"
            />
            <StatsCard
              title="Total Cost"
              value={formatCurrency(stats.totalCost)}
              change="-5% from last week"
              changeType="positive"
              icon={DollarSign}
              iconColor="bg-orange-500"
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
