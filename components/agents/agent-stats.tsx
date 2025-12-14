"use client";

import { StatsCard } from "@/components/ui/stats-card";
import type { Agent } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface AgentStatsProps {
  agent: Agent;
}

export function AgentStats({ agent }: AgentStatsProps) {
  // Mock trend data - in real app, this would come from agent data
  return (
    <div className="mb-8 grid gap-4 pt-6 md:grid-cols-4">
      <StatsCard
        title="Total Runs"
        value={agent.executionCount.toLocaleString()}
        change="+12.5%"
        changeType="positive"
      />
      <StatsCard
        title="Success Rate"
        value={formatPercentage(agent.successRate)}
        change="+2.3%"
        changeType="positive"
      />
      <StatsCard
        title="Avg Cost"
        value={formatCurrency(agent.avgCost)}
        change="-5.1%"
        changeType="negative"
      />
      <StatsCard title="Version" value={agent.version} />
    </div>
  );
}
