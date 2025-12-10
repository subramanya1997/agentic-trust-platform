"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { mockAgents } from "@/lib/data/mock-data";
import { formatPercentage, formatRelativeTime } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Search,
  CircleDot,
  Circle,
  Plus,
  CheckCircle,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

export default function AgentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter agents
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgents = filteredAgents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Status counts
  const statusCounts = {
    all: mockAgents.length,
    active: mockAgents.filter((a) => a.status === "active").length,
    paused: mockAgents.filter((a) => a.status === "paused").length,
  };

  const statusFilters: { value: string; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", icon: <CircleDot className="h-3.5 w-3.5" /> },
    { value: "paused", label: "Paused", icon: <Circle className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <Header 
        subtitle="Manage and monitor your AI agents"
        actionButton={
          <Link href="/agents/new">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="space-y-6 min-w-0">

          {/* Filters Row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground0" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground0 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === filter.value
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                  <span className="text-foreground0 ml-1">{statusCounts[filter.value as keyof typeof statusCounts]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Agents Table */}
          <Card className="bg-card border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-800">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created by
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Runs
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {paginatedAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/agents/${agent.id}`}
                            className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors"
                          >
                            {agent.name}
                          </Link>
                          <p className="text-xs text-foreground0 mt-0.5 max-w-xs truncate">
                            {agent.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">{agent.createdBy}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={agent.status === "active" ? "success" : "outline"}
                          >
                            {agent.status === "active" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {agent.status === "paused" && (
                              <Pause className="h-3 w-3 mr-1" />
                            )}
                            {agent.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-foreground">
                            {agent.executionCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            {agent.successRate >= 90 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-orange-400" />
                            )}
                            <span className={`text-sm font-medium ${
                              agent.successRate >= 90 ? 'text-green-400' : 'text-orange-400'
                            }`}>
                              {formatPercentage(agent.successRate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                            {formatRelativeTime(agent.lastRun)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAgents.length)} of {filteredAgents.length} agents
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border text-muted-foreground disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page 
                            ? "bg-amber-600 hover:bg-amber-500 text-white" 
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
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border text-muted-foreground disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
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
                    className="mt-4 border text-muted-foreground"
                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
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
