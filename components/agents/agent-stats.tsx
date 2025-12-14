"use client";

import { Card } from "@/components/ui/card";
import { TrendIndicator, TrendType } from "@/components/ui/trend-indicator";
import type { Agent } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface AgentStatsProps {
  agent: Agent;
}

interface TrendData {
  change: string | null;
  type: TrendType;
}

export function AgentStats({ agent }: AgentStatsProps) {
  // Mock trend data - in real app, this would come from agent data
  const trends: Record<string, TrendData> = {
    runs: { change: "+12.5%", type: "positive" },
    successRate: { change: "+2.3%", type: "positive" },
    avgCost: { change: "-5.1%", type: "negative" },
    version: { change: null, type: "neutral" },
  };

  return (
    <div className="mb-8 grid gap-4 pt-6 md:grid-cols-4">
      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-muted-foreground text-xs font-medium">Total Runs</p>
          <p className="text-foreground mt-0.5 text-xl font-bold">
            {agent.executionCount.toLocaleString()}
          </p>
          {trends.runs.change && (
            <div className="mt-1.5">
              <TrendIndicator value={trends.runs.change} type={trends.runs.type} />
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-muted-foreground text-xs font-medium">Success Rate</p>
          <p className="mt-0.5 text-xl font-bold text-green-400">
            {formatPercentage(agent.successRate)}
          </p>
          {trends.successRate.change && (
            <div className="mt-1.5">
              <TrendIndicator value={trends.successRate.change} type={trends.successRate.type} />
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-muted-foreground text-xs font-medium">Avg Cost</p>
          <p className="text-foreground mt-0.5 text-xl font-bold">
            {formatCurrency(agent.avgCost)}
          </p>
          {trends.avgCost.change && (
            <div className="mt-1.5">
              <TrendIndicator value={trends.avgCost.change} type={trends.avgCost.type} />
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-muted-foreground text-xs font-medium">Version</p>
          <p className="text-foreground mt-0.5 text-xl font-bold">{agent.version}</p>
        </div>
      </Card>
    </div>
  );
}
