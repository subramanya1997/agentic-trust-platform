"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime, formatDuration, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Bot } from "lucide-react";
import type { ExecutionTrace } from "@/lib/types";

interface RecentActivityProps {
  executions: ExecutionTrace[];
}

export function RecentActivity({ executions }: RecentActivityProps) {
  const displayedExecutions = executions.slice(0, 5);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link
            href="/activity"
            className="text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayedExecutions.map((execution) => (
            <Link
              key={execution.id}
              href={`/activity?execution=${execution.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
            >
              {/* Status Icon */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  execution.status === "completed"
                    ? "bg-green-500/10"
                    : execution.status === "failed"
                    ? "bg-red-500/10"
                    : "bg-amber-500/10"
                }`}
              >
                {execution.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {execution.status === "failed" && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {execution.status === "running" && (
                  <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                )}
              </div>

              {/* Execution Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {execution.agentName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span suppressHydrationWarning>
                    {formatRelativeTime(execution.startedAt)}
                  </span>
                  <span>·</span>
                  <span>{formatDuration(execution.duration)}</span>
                </div>
              </div>

              {/* Cost */}
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(execution.totalCost)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {execution.successfulSteps}/{execution.totalSteps} steps
                </p>
              </div>
            </Link>
          ))}

          {displayedExecutions.length === 0 && (
            <div className="py-8 text-center">
              <Bot className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent executions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

