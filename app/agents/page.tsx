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
  Filter,
  SlidersHorizontal
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

  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-50">Agents</h1>
              <p className="mt-1 text-sm text-stone-400">
                {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 py-2 pl-10 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                className={statusFilter === "all" ? "bg-amber-600 hover:bg-amber-500" : "border-stone-700 text-stone-300"}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}
                className={statusFilter === "active" ? "bg-green-600 hover:bg-green-500" : "border-stone-700 text-stone-300"}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "paused" ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter("paused"); setCurrentPage(1); }}
                className={statusFilter === "paused" ? "bg-stone-600 hover:bg-stone-500" : "border-stone-700 text-stone-300"}
              >
                Paused
              </Button>
            </div>

            {/* More Filters */}
            <Button variant="outline" size="sm" className="border-stone-700 text-stone-300">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Agents Table */}
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-800">
                  <thead className="bg-stone-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Created by
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Runs
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {paginatedAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/agents/${agent.id}`}
                            className="text-sm font-medium text-stone-100 hover:text-amber-500 transition-colors"
                          >
                            {agent.name}
                          </Link>
                          <p className="text-xs text-stone-500 mt-0.5 max-w-xs truncate">
                            {agent.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-stone-300">{agent.createdBy}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant="outline" 
                            className={agent.status === "active" 
                              ? "bg-green-950 text-green-400 border-green-800" 
                              : "bg-stone-800 text-stone-400 border-stone-700"
                            }
                          >
                            {agent.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-stone-200">
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
                          <span className="text-sm text-stone-400">
                            {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-stone-400" suppressHydrationWarning>
                            {formatRelativeTime(agent.lastRun)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200">
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800">
                  <div className="text-sm text-stone-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAgents.length)} of {filteredAgents.length} agents
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-stone-700 text-stone-300 disabled:opacity-50"
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
                            : "text-stone-400 hover:text-stone-200"
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
                      className="border-stone-700 text-stone-300 disabled:opacity-50"
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
                  <p className="text-stone-400">No agents found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-stone-700 text-stone-300"
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
