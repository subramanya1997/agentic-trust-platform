"use client";

import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Agent } from "@/lib/types";

interface AgentStatsProps {
  agent: Agent;
}

type TrendType = "positive" | "negative" | "neutral";

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
    <div className="grid gap-4 md:grid-cols-4 mb-8 pt-6">
      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Total Runs</p>
          <p className="mt-0.5 text-xl font-bold text-foreground">
            {agent.executionCount.toLocaleString()}
          </p>
          {trends.runs.change && (
            <div className="mt-1.5 flex items-center gap-1">
              {trends.runs.type === "positive" && (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              {trends.runs.type === "negative" && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trends.runs.type === "positive" && "text-green-500",
                  trends.runs.type === "negative" && "text-red-500",
                  trends.runs.type === "neutral" && "text-muted-foreground"
                )}
              >
                {trends.runs.change}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Success Rate</p>
          <p className="mt-0.5 text-xl font-bold text-green-400">
            {formatPercentage(agent.successRate)}
          </p>
          {trends.successRate.change && (
            <div className="mt-1.5 flex items-center gap-1">
              {trends.successRate.type === "positive" && (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              {trends.successRate.type === "negative" && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trends.successRate.type === "positive" && "text-green-500",
                  trends.successRate.type === "negative" && "text-red-500",
                  trends.successRate.type === "neutral" && "text-muted-foreground"
                )}
              >
                {trends.successRate.change}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Avg Cost</p>
          <p className="mt-0.5 text-xl font-bold text-foreground">
            {formatCurrency(agent.avgCost)}
          </p>
          {trends.avgCost.change && (
            <div className="mt-1.5 flex items-center gap-1">
              {trends.avgCost.type === "positive" && (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              {trends.avgCost.type === "negative" && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trends.avgCost.type === "positive" && "text-green-500",
                  trends.avgCost.type === "negative" && "text-red-500",
                  trends.avgCost.type === "neutral" && "text-muted-foreground"
                )}
              >
                {trends.avgCost.change}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card border">
        <div className="px-4">
          <p className="text-xs font-medium text-muted-foreground">Version</p>
          <p className="mt-0.5 text-xl font-bold text-foreground">{agent.version}</p>
        </div>
      </Card>
    </div>
  );
}

