"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TraceViewer } from "./trace-viewer";
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
} from "lucide-react";
import {
  mockExecutionTraces,
  filterExecutionTraces,
  getActivitySummary,
} from "@/lib/data/activity-data";

interface ExecutionsTabProps {
  dateRange: "7d" | "14d" | "30d";
  searchQuery: string;
  statusFilter: string;
  agentFilter: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const triggerTypeIcons: Record<string, React.ElementType> = {
  manual: Play,
  scheduled: Calendar,
  webhook: Webhook,
  api: Zap,
};

export function ExecutionsTab({ dateRange, searchQuery, statusFilter, agentFilter }: ExecutionsTabProps) {
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const summary = getActivitySummary(dateRange);

  // Apply filters
  const filteredTraces = filterExecutionTraces(mockExecutionTraces, {
    status: statusFilter !== "all" ? (statusFilter as "completed" | "failed" | "running") : undefined,
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
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-800">
              <thead className="bg-stone-900">
                <tr>
                  <th className="w-10 px-4 py-4"></th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Execution
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {paginatedTraces.map((trace) => {
                  const isExpanded = expandedTrace === trace.id;
                  const TriggerIcon = triggerTypeIcons[trace.triggerType] || Zap;

                  return (
                    <Fragment key={trace.id}>
                      <tr
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? "bg-stone-800/50" : "hover:bg-stone-800/30"
                        }`}
                        onClick={() => toggleTrace(trace.id)}
                      >
                        <td className="px-4 py-4">
                          <button className="text-stone-500 hover:text-stone-300">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-stone-300">
                            {trace.id}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link
                            href={`/agents/${trace.agentId}`}
                            className="text-sm font-medium text-stone-100 hover:text-amber-500 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {trace.agentName}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`${
                              trace.status === "completed"
                                ? "bg-green-900/30 text-green-400 border-green-800"
                                : trace.status === "failed"
                                ? "bg-red-900/30 text-red-400 border-red-800"
                                : "bg-blue-900/30 text-blue-400 border-blue-800"
                            }`}
                          >
                            {trace.status === "completed" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {trace.status === "failed" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {trace.status === "running" && (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {trace.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TriggerIcon className="h-4 w-4 text-stone-500" />
                            <span className="text-sm text-stone-400 capitalize">
                              {trace.triggerType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-stone-600" />
                            <span className="text-xs text-stone-500">
                              {trace.triggeredBy}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Timer className="h-3.5 w-3.5 text-stone-500" />
                            <span className="text-sm text-stone-200">
                              {formatDuration(trace.duration)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-stone-300">
                            ${trace.totalCost.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm text-green-400">
                              {trace.successfulSteps}
                            </span>
                            <span className="text-stone-600">/</span>
                            <span className="text-sm text-stone-400">
                              {trace.totalSteps}
                            </span>
                            {trace.failedSteps > 0 && (
                              <span className="text-sm text-red-400 ml-1">
                                ({trace.failedSteps} failed)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <span
                            className="text-sm text-stone-400"
                            suppressHydrationWarning
                          >
                            {formatRelativeTime(trace.startedAt)}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="p-4 bg-stone-950">
                            <TraceViewer trace={trace} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-stone-800">
              <div className="text-sm text-stone-500">
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
                  className="border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-50"
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
                            ? "bg-amber-600 hover:bg-amber-500 text-white"
                            : "border-stone-700 text-stone-300 hover:bg-stone-800"
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
                  className="border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-50"
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

