"use client";

import Link from "next/link";
import { DataTable, TableCell, TableRow } from "@/components/data-table";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePagination, useSearch, useFilter } from "@/hooks";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { mockAgents } from "@/lib/data/mock-data";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "@/lib/icons";
import type { Agent } from "@/lib/types";
import { formatPercentage, formatRelativeTime } from "@/lib/utils";

export default function AgentsPage() {
  // Search functionality
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filteredItems: searchedAgents,
  } = useSearch(mockAgents, { keys: ["name", "description", "createdBy"] });

  // Filter functionality
  const {
    filter: statusFilter,
    setFilter: setStatusFilter,
    filteredItems: filteredAgents,
    counts: statusCounts,
  } = useFilter<Agent>(searchedAgents, "status", "all");

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    paginatedItems: paginatedAgents,
    totalPages,
    startIndex,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = usePagination(filteredAgents, { pageSize: ITEMS_PER_PAGE });

  const statusFilters: { value: string; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { value: "paused", label: "Paused", icon: <Circle className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <Header
        subtitle="Manage and monitor your AI agents"
        actionButton={
          <Link href="/agents/new">
            <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="text-foreground0 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card text-foreground placeholder:text-foreground0 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === filter.value
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                  {statusCounts[filter.value as keyof typeof statusCounts] > 0 && (
                    <span className="ml-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
                      {statusCounts[filter.value as keyof typeof statusCounts]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Table */}
          <Card className="bg-card border">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  { label: "Name", align: "left" },
                  { label: "Created by", align: "left" },
                  { label: "Status", align: "left" },
                  { label: "Runs", align: "center" },
                  { label: "Success Rate", align: "center" },
                  { label: "Created", align: "left" },
                  { label: "Last Used", align: "left" },
                  { label: "", align: "right" },
                ]}
              >
                {paginatedAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="text-foreground text-sm font-medium transition-colors hover:text-amber-500"
                      >
                        {agent.name}
                      </Link>
                      <p className="text-foreground0 mt-0.5 max-w-xs truncate text-xs">
                        {agent.description}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">{agent.createdBy}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          agent.status === "active"
                            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                            : ""
                        }
                      >
                        {agent.status === "active" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {agent.status === "paused" && <Pause className="mr-1 h-3 w-3" />}
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="text-foreground text-sm font-medium">
                        {agent.executionCount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {agent.successRate >= 90 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            agent.successRate >= 90 ? "text-green-400" : "text-orange-400"
                          }`}
                        >
                          {formatPercentage(agent.successRate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">
                        {new Date(agent.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm" suppressHydrationWarning>
                        {formatRelativeTime(agent.lastRun)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-muted-foreground text-sm">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredAgents.length)} of{" "}
                    {filteredAgents.length} agents
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={!hasPrevPage}
                      className="text-muted-foreground border disabled:opacity-50"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-amber-600 text-white hover:bg-amber-500"
                              : "text-muted-foreground hover:text-foreground"
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="text-muted-foreground border disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {paginatedAgents.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-muted-foreground">No agents found matching your criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground mt-4 border"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
