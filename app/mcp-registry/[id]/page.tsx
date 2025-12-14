"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MCPIcon,
  ServerHeader,
  ServerStats,
  ToolsTable,
  InvocationsTable,
  TestConsole,
} from "@/components/mcp-registry";
import {
  getMCPServerById,
  getServerInvocations,
} from "@/lib/data/mcp-servers-data";
import {
  ArrowLeft,
  Copy,
  Check,
  Server,
  Bot,
  Trash2,
  Settings,
} from "@/lib/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MCPServerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const server = getMCPServerById(id);
  const invocations = getServerInvocations(id);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!server) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-background px-4">
          <Link
            href="/mcp-registry"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            MCP Registry
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Server className="h-12 w-12 text-stone-600 mx-auto mb-4" />
            <p className="text-muted-foreground">MCP Server not found</p>
            <p className="text-sm text-foreground0 mt-1">
              The server you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Link href="/mcp-registry">
              <Button className="mt-4 bg-amber-600 hover:bg-amber-500 text-white">
                Back to Registry
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(server.serverUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Page Header */}
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/mcp-registry"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            MCP Registry
          </Link>
          <span className="text-stone-700">/</span>
          <div className="flex items-center gap-2">
            {server.type === "agent" ? (
              <Bot className="h-4 w-4 text-amber-500" />
            ) : (
              <MCPIcon className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-foreground font-medium text-sm">{server.name}</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              server.type === "agent"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
            }`}
          >
            {server.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground0" suppressHydrationWarning>
            Last called {server.stats.lastCalledAt ? formatRelativeTime(server.stats.lastCalledAt) : "Never"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={copyUrl}
          >
            {copiedUrl ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {server.type === "custom" && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Server Info */}
          <ServerHeader server={server} />

          {/* Stats */}
          <ServerStats server={server} />

          {/* Tools & Test Console */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[3fr_2fr]">
            <ToolsTable server={server} />
            <TestConsole tools={server.selectedTools} serverUrl={server.serverUrl} />
          </div>

          {/* Recent Invocations */}
          <InvocationsTable invocations={invocations} />
        </div>
      </div>
    </div>
  );
}
