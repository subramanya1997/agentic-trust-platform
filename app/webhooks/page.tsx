"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
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
import { mockWebhooks } from "@/lib/data/webhooks-data";
import { mockAgents } from "@/lib/data/mock-data";
import { formatRelativeTime } from "@/lib/utils";
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
  XCircle,
} from "@/lib/icons";

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
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
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
                    className="bg-accent border text-foreground placeholder:text-foreground0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Describe what triggers this webhook"
                    className="bg-accent border text-foreground placeholder:text-foreground0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent" className="text-foreground">
                    Target Agent
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-accent border text-foreground">
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
                    <SelectTrigger className="bg-accent border text-foreground">
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
                  className="border text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                placeholder="Search webhooks..."
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
                  {statusCounts[filter.value as keyof typeof statusCounts] > 0 && (
                    <span className="ml-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded">
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
                  { label: 'Webhook', align: 'left' },
                  { label: 'Target Agent', align: 'left' },
                  { label: 'Status', align: 'center' },
                  { label: 'Deliveries', align: 'center' },
                  { label: 'Success', align: 'center' },
                  { label: 'Last Triggered', align: 'left' },
                  { label: '', align: 'right' },
                ]}
              >
                {paginatedWebhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/webhooks/${webhook.id}`}
                          className="h-9 w-9 rounded-lg bg-purple-950 flex items-center justify-center shrink-0 mt-0.5"
                        >
                          <Webhook className="h-4 w-4 text-purple-400" />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/webhooks/${webhook.id}`}
                            className="text-sm font-medium text-foreground hover:text-amber-500 transition-colors block"
                          >
                            {webhook.name}
                          </Link>
                          <p className="text-xs text-foreground0 mt-0.5 truncate max-w-[280px]">
                            {webhook.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <code className="text-xs text-muted-foreground font-mono bg-accent px-2 py-0.5 rounded truncate max-w-[200px]">
                              {webhook.url}
                            </code>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(webhook.id, webhook.url);
                              }}
                              className="text-foreground0 hover:text-muted-foreground transition-colors shrink-0"
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
                        className="text-sm text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-1"
                      >
                        {webhook.targetAgentName}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                      <Badge
                        variant="outline"
                        className={webhook.status === "active" ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400" : ""}
                      >
                        {webhook.status === "active" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {webhook.status === "inactive" && (
                          <Circle className="h-3 w-3 mr-1" />
                        )}
                        {webhook.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-foreground">
                        {webhook.totalDeliveries.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-center">
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
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {webhook.lastTriggered
                          ? formatRelativeTime(webhook.lastTriggered)
                          : "Never"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-400"
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
                  <div className="text-sm text-muted-foreground">
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
                      className="border text-muted-foreground disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              {paginatedWebhooks.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Webhook className="h-12 w-12 text-stone-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No webhooks found matching your criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border text-muted-foreground"
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

