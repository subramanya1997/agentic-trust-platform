"use client";

import Link from "next/link";
import { useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockTriggers, parseCronExpression } from "@/lib/data/triggers-data";
import { Zap, ExternalLink, Clock, Activity, ChevronLeft, ChevronRight } from "@/lib/icons";
import type {
  AgentTrigger,
  ScheduledTriggerConfig,
  WebhookTriggerConfig,
  ApiTriggerConfig,
} from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface TriggersTabProps {
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
}

const ITEMS_PER_PAGE = 10;

export function TriggersTab({ searchQuery, typeFilter, statusFilter }: TriggersTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter triggers
  const filteredTriggers = mockTriggers.filter((trigger) => {
    const matchesSearch =
      trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trigger.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || trigger.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && trigger.enabled) ||
      (statusFilter === "inactive" && !trigger.enabled);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group by type for summary
  const triggersByType = {
    webhook: mockTriggers.filter((t) => t.type === "webhook"),
    scheduled: mockTriggers.filter((t) => t.type === "scheduled"),
    api: mockTriggers.filter((t) => t.type === "api"),
  };

  // Pagination
  const totalPages = Math.ceil(filteredTriggers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTriggers = filteredTriggers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getTriggerDescription = (trigger: AgentTrigger) => {
    switch (trigger.type) {
      case "webhook":
        return (trigger.config as WebhookTriggerConfig).webhookUrl;
      case "scheduled": {
        const config = trigger.config as ScheduledTriggerConfig;
        return `${parseCronExpression(config.cronExpression)} (${config.timezone})`;
      }
      case "api": {
        const config = trigger.config as ApiTriggerConfig;
        return `${config.method} ${config.endpoint}`;
      }
      default:
        return "";
    }
  };

  const getNextRun = (trigger: AgentTrigger) => {
    if (trigger.type === "scheduled") {
      const config = trigger.config as ScheduledTriggerConfig;
      if (config.nextRunAt) {
        return formatRelativeTime(config.nextRunAt);
      }
    }
    return null;
  };

  const totalTriggers = mockTriggers.length;
  const activeTriggers = mockTriggers.filter((t) => t.enabled).length;
  const totalRuns = mockTriggers.reduce((sum, t) => sum + t.triggerCount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Triggers"
          value={totalTriggers.toString()}
          change={`${activeTriggers} active`}
          changeType="neutral"
        />
        <StatsCard
          title="Webhooks"
          value={triggersByType.webhook.length.toString()}
          change={`${triggersByType.webhook.filter((t) => t.enabled).length} active`}
          changeType="neutral"
        />
        <StatsCard
          title="Scheduled"
          value={triggersByType.scheduled.length.toString()}
          change={`${triggersByType.scheduled.filter((t) => t.enabled).length} active`}
          changeType="neutral"
        />
        <StatsCard
          title="Total Runs"
          value={totalRuns.toLocaleString()}
          change="All time"
          changeType="neutral"
        />
      </div>

      {/* Triggers Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Trigger", align: "left" },
              { label: "Type", align: "left" },
              { label: "Agent", align: "left" },
              { label: "Status", align: "center" },
              { label: "Runs", align: "center" },
              { label: "Last / Next", align: "left" },
            ]}
          >
            {paginatedTriggers.map((trigger) => (
              <TableRow key={trigger.id}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <span className="text-foreground text-sm font-medium">{trigger.name}</span>
                    <p className="text-foreground0 mt-0.5 max-w-xs truncate font-mono text-xs">
                      {getTriggerDescription(trigger)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      trigger.type === "webhook"
                        ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : trigger.type === "scheduled"
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : trigger.type === "api"
                            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                            : "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {trigger.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/agents/${trigger.agentId}`}
                    className="text-muted-foreground flex items-center gap-1 text-sm transition-colors hover:text-amber-500"
                  >
                    {trigger.agentName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={
                      trigger.enabled
                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    {trigger.enabled ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-foreground text-sm font-medium">
                    {trigger.triggerCount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="space-y-1">
                    {trigger.lastTriggered && (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span suppressHydrationWarning>
                          {formatRelativeTime(trigger.lastTriggered)}
                        </span>
                      </div>
                    )}
                    {getNextRun(trigger) && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Activity className="h-3 w-3" />
                        <span suppressHydrationWarning>Next: {getNextRun(trigger)}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-muted-foreground text-sm">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredTriggers.length)} of{" "}
                {filteredTriggers.length} triggers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-muted-foreground border disabled:opacity-50"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
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
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-amber-600 text-white hover:bg-amber-500"
                            : "text-muted-foreground hover:text-foreground"
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
                  className="text-muted-foreground border disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedTriggers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-stone-600" />
              <p className="text-muted-foreground">No triggers found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
