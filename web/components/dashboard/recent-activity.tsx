"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Bot } from "@/lib/icons";
import type { ExecutionTrace } from "@/lib/types";
import { formatRelativeTime, formatDuration, formatCurrency } from "@/lib/utils";

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
              className="hover:bg-accent -mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors"
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
                {execution.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                {execution.status === "running" && (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                )}
              </div>

              {/* Execution Info */}
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {execution.agentName}
                </p>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span suppressHydrationWarning>{formatRelativeTime(execution.startedAt)}</span>
                  <span>·</span>
                  <span>{formatDuration(execution.duration)}</span>
                </div>
              </div>

              {/* Cost */}
              <div className="text-right">
                <p className="text-foreground text-sm font-medium">
                  {formatCurrency(execution.totalCost)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {execution.successfulSteps}/{execution.totalSteps} steps
                </p>
              </div>
            </Link>
          ))}

          {displayedExecutions.length === 0 && (
            <div className="py-8 text-center">
              <Bot className="text-muted mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No recent executions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
