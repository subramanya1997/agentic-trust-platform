"use client";

import Link from "next/link";
import { useState, Fragment } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  mockExecutionTraces,
  filterExecutionTraces,
  getActivitySummary,
} from "@/lib/data/activity-data";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Zap,
  Calendar,
  Timer,
  Webhook,
  Play,
} from "@/lib/icons";
import { TraceViewer } from "./trace-viewer";

interface ExecutionsTabProps {
  dateRange: "7d" | "14d" | "30d";
  searchQuery: string;
  statusFilter: string;
  agentFilter: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${(ms / 60000).toFixed(2)}m`;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

const triggerTypeIcons: Record<string, React.ElementType> = {
  manual: Play,
  scheduled: Calendar,
  webhook: Webhook,
  api: Zap,
};

export function ExecutionsTab({
  dateRange,
  searchQuery,
  statusFilter,
  agentFilter,
}: ExecutionsTabProps) {
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const summary = getActivitySummary(dateRange);

  // Apply filters
  const filteredTraces = filterExecutionTraces(mockExecutionTraces, {
    status:
      statusFilter !== "all" ? (statusFilter as "completed" | "failed" | "running") : undefined,
    agentId: agentFilter !== "all" ? agentFilter : undefined,
    dateRange,
    search: searchQuery || undefined,
  });

  // Pagination
  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTraces = filteredTraces.slice(startIndex, startIndex + itemsPerPage);

  const toggleTrace = (traceId: string) => {
    setExpandedTrace(expandedTrace === traceId ? null : traceId);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Executions"
          value={summary.totalExecutions.toString()}
          change={`${summary.successRate}% success rate`}
          changeType="neutral"
        />
        <StatsCard
          title="Successful"
          value={summary.successfulExecutions.toString()}
          change={`${Math.round((summary.successfulExecutions / summary.totalExecutions) * 100)}% of total`}
          changeType="positive"
        />
        <StatsCard
          title="Failed"
          value={summary.failedExecutions.toString()}
          change={summary.failedExecutions > 0 ? "Needs attention" : "All good"}
          changeType={summary.failedExecutions > 0 ? "negative" : "positive"}
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(summary.avgDuration)}
          change="Per execution"
          changeType="neutral"
        />
      </div>

      {/* Executions Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "", align: "left", className: "w-10" },
              { label: "Execution", align: "left" },
              { label: "Agent", align: "left" },
              { label: "Status", align: "left" },
              { label: "Trigger", align: "left" },
              { label: "Duration", align: "right" },
              { label: "Cost", align: "right" },
              { label: "Steps", align: "right" },
              { label: "Started", align: "right" },
            ]}
          >
            {paginatedTraces.map((trace) => {
              const isExpanded = expandedTrace === trace.id;
              const TriggerIcon = triggerTypeIcons[trace.triggerType] || Zap;

              return (
                <Fragment key={trace.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleTrace(trace.id)}>
                    <TableCell className="px-4 py-3">
                      <button className="text-foreground0 hover:text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="text-muted-foreground font-mono text-sm">{trace.id}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/agents/${trace.agentId}`}
                        className="text-foreground text-sm font-medium transition-colors hover:text-amber-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {trace.agentName}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          trace.status === "completed"
                            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                            : trace.status === "failed"
                              ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                              : "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }
                      >
                        {trace.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {trace.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                        {trace.status === "running" && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {trace.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TriggerIcon className="text-foreground0 h-4 w-4" />
                        <span className="text-muted-foreground text-sm capitalize">
                          {trace.triggerType}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1">
                        <User className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground text-xs">{trace.triggeredBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Timer className="text-foreground0 h-3.5 w-3.5" />
                        <span className="text-foreground text-sm">
                          {formatDuration(trace.duration)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">
                        ${trace.totalCost.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-sm text-green-400">{trace.successfulSteps}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground text-sm">{trace.totalSteps}</span>
                        {trace.failedSteps > 0 && (
                          <span className="ml-1 text-sm text-red-400">
                            ({trace.failedSteps} failed)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-muted-foreground text-sm" suppressHydrationWarning>
                        {formatRelativeTime(trace.startedAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-card p-4">
                        <TraceViewer trace={trace} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </DataTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-foreground0 text-sm">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredTraces.length)} of{" "}
                {filteredTraces.length} executions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-muted-foreground hover:bg-accent border disabled:opacity-50"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-amber-600 text-white hover:bg-amber-500"
                            : "text-muted-foreground hover:bg-accent border"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-muted-foreground hover:bg-accent border disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
