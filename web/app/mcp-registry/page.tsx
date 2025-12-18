"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MCPServerCard } from "@/components/mcp-registry/mcp-server-card";
import { Button } from "@/components/ui/button";
import { allMCPServers } from "@/lib/data/mcp-servers-data";
import { Search, Server, Plus, Bot, Wrench } from "@/lib/icons";

type FilterType = "all" | "agent" | "custom";

export default function MCPRegistryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filteredServers = allMCPServers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.selectedTools.some((t) =>
        t.toolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesType = typeFilter === "all" || server.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const counts = {
    all: allMCPServers.length,
    agent: allMCPServers.filter((s) => s.type === "agent").length,
    custom: allMCPServers.filter((s) => s.type === "custom").length,
  };

  const filters: { type: FilterType; label: string; icon?: React.ReactNode }[] = [
    { type: "all", label: "All" },
    { type: "agent", label: "Agent", icon: <Bot className="h-3.5 w-3.5" /> },
    { type: "custom", label: "Custom", icon: <Wrench className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <Header
        subtitle="Custom MCP servers with tools from integrations and agents"
        actionButton={
          <Link href="/mcp-registry/new">
            <Button className="bg-amber-600 text-white hover:bg-amber-500">
              <Plus className="mr-2 h-4 w-4" />
              New Server
            </Button>
          </Link>
        }
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search servers or tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
              {filters.map((filter) => (
                <button
                  key={filter.type}
                  onClick={() => setTypeFilter(filter.type)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    typeFilter === filter.type
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                  {counts[filter.type] > 0 && (
                    <span className="ml-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
                      {counts[filter.type]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Server Grid */}
          {filteredServers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServers.map((server) => (
                <MCPServerCard key={server.id} server={server} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Server className="mx-auto mb-3 h-10 w-10 text-stone-700" />
              <p className="text-muted-foreground text-sm">No servers found</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {searchQuery ? "Try adjusting your search" : "Create your first MCP server"}
              </p>
              {!searchQuery && (
                <Link href="/mcp-registry/new">
                  <Button className="mt-4 bg-amber-600 text-sm text-white hover:bg-amber-500">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Server
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
