"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAgents } from "@/lib/data/mock-data";
import { mockWebhooks } from "@/lib/data/webhooks-data";
import {
  Plus,
  Search,
  Copy,
  Check,
  Webhook,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle,
} from "@/lib/icons";
import { formatRelativeTime } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function WebhooksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter webhooks
  const filteredWebhooks = mockWebhooks.filter((webhook) => {
    const matchesSearch =
      webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.targetAgentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || webhook.status === statusFilter;
    const matchesAgent = agentFilter === "all" || webhook.targetAgentId === agentFilter;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWebhooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedWebhooks = filteredWebhooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status counts
  const statusCounts = {
    all: mockWebhooks.length,
    active: mockWebhooks.filter((w) => w.status === "active").length,
    inactive: mockWebhooks.filter((w) => w.status === "inactive").length,
  };

  const statusFilters: { value: string; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { value: "inactive", label: "Inactive", icon: <Circle className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <Header
        subtitle="Trigger agents from external services via HTTP endpoints"
        actionButton={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
                <Plus className="mr-2 h-4 w-4" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Webhook</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create a new webhook endpoint to trigger agents from external services.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Salesforce Lead Created"
                    className="bg-accent text-foreground placeholder:text-foreground0 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Describe what triggers this webhook"
                    className="bg-accent text-foreground placeholder:text-foreground0 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent" className="text-foreground">
                    Target Agent
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-accent text-foreground border">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-accent border">
                      {mockAgents.map((agent) => (
                        <SelectItem
                          key={agent.id}
                          value={agent.id}
                          className="text-foreground focus:bg-muted"
                        >
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth" className="text-foreground">
                    Authentication
                  </Label>
                  <Select defaultValue="hmac">
                    <SelectTrigger className="bg-accent text-foreground border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-accent border">
                      <SelectItem value="none" className="text-foreground focus:bg-muted">
                        None
                      </SelectItem>
                      <SelectItem value="hmac" className="text-foreground focus:bg-muted">
                        HMAC Signature
                      </SelectItem>
                      <SelectItem value="bearer" className="text-foreground focus:bg-muted">
                        Bearer Token
                      </SelectItem>
                      <SelectItem value="basic" className="text-foreground focus:bg-muted">
                        Basic Auth
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-muted-foreground border"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-amber-600 text-white hover:bg-amber-500"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                placeholder="Search webhooks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-card text-foreground placeholder:text-foreground0 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
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

          {/* Webhooks Table */}
          <Card className="bg-card border">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  { label: "Webhook", align: "left" },
                  { label: "Target Agent", align: "left" },
                  { label: "Status", align: "center" },
                  { label: "Deliveries", align: "center" },
                  { label: "Success", align: "center" },
                  { label: "Last Triggered", align: "left" },
                  { label: "", align: "right" },
                ]}
              >
                {paginatedWebhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/webhooks/${webhook.id}`}
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-950"
                        >
                          <Webhook className="h-4 w-4 text-purple-400" />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/webhooks/${webhook.id}`}
                            className="text-foreground block text-sm font-medium transition-colors hover:text-amber-500"
                          >
                            {webhook.name}
                          </Link>
                          <p className="text-foreground0 mt-0.5 max-w-[280px] truncate text-xs">
                            {webhook.description}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <code className="text-muted-foreground bg-accent max-w-[200px] truncate rounded px-2 py-0.5 font-mono text-xs">
                              {webhook.url}
                            </code>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(webhook.id, webhook.url);
                              }}
                              className="text-foreground0 hover:text-muted-foreground shrink-0 transition-colors"
                            >
                              {copiedId === webhook.id ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/agents/${webhook.targetAgentId}`}
                        className="text-muted-foreground flex items-center gap-1 text-sm transition-colors hover:text-amber-500"
                      >
                        {webhook.targetAgentName}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          webhook.status === "active"
                            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                            : ""
                        }
                      >
                        {webhook.status === "active" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {webhook.status === "inactive" && <Circle className="mr-1 h-3 w-3" />}
                        {webhook.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="text-foreground text-sm font-medium">
                        {webhook.totalDeliveries.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          webhook.successRate >= 98
                            ? "text-green-400"
                            : webhook.successRate >= 95
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {webhook.successRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm" suppressHydrationWarning>
                        {webhook.lastTriggered
                          ? formatRelativeTime(webhook.lastTriggered)
                          : "Never"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-8 w-8 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredWebhooks.length)} of{" "}
                    {filteredWebhooks.length} webhooks
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
              {paginatedWebhooks.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Webhook className="mx-auto mb-4 h-12 w-12 text-stone-600" />
                  <p className="text-muted-foreground">No webhooks found matching your criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground mt-4 border"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setAgentFilter("all");
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
