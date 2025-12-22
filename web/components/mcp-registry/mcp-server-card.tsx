"use client";

import Link from "next/link";
import { useState } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Copy, Check, McpIcon } from "@/lib/icons";
import type { CustomMCPServer } from "@/lib/types";

interface MCPServerCardProps {
  server: CustomMCPServer;
}

export function MCPServerCard({ server }: MCPServerCardProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(server.serverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={`/mcp-registry/${server.id}`}>
      <Card className="bg-card h-full border transition-colors hover:border">
        <CardContent className="px-4">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  server.type === "agent" ? "bg-amber-500/10" : "bg-blue-500/10"
                }`}
              >
                {server.type === "agent" ? (
                  <Bot className="h-4 w-4 text-amber-500" />
                ) : (
                  <McpIcon size={16} className="text-blue-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-medium">{server.name}</p>
                <p className="text-muted-foreground text-xs">
                  {server.selectedTools.length} tools · {server.stats.totalCalls.toLocaleString()}{" "}
                  calls
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] ${
                server.type === "agent"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {server.type}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-2 line-clamp-1 text-xs">{server.description}</p>

          {/* Tools Preview */}
          <div className="mb-2 flex flex-wrap gap-1">
            {server.selectedTools.slice(0, 2).map((tool, idx) => (
              <div
                key={idx}
                className="bg-accent/50 border-border/50 flex items-center gap-1 rounded-md border px-1.5 py-0.5"
              >
                {tool.sourceType === "integration" ? (
                  <IntegrationIcon
                    integrationId={tool.sourceId}
                    alt={tool.sourceName}
                    width={12}
                    height={12}
                    className="rounded"
                  />
                ) : (
                  <Bot className="h-3 w-3 text-amber-500" />
                )}
                <span className="text-muted-foreground text-[11px]">{tool.toolName}</span>
              </div>
            ))}
            {server.selectedTools.length > 2 && (
              <div className="bg-accent/50 border-border/50 flex items-center rounded-md border px-1.5 py-0.5">
                <span className="text-muted-foreground text-[11px]">
                  +{server.selectedTools.length - 2}
                </span>
              </div>
            )}
          </div>

          {/* URL */}
          <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
            <code className="text-muted-foreground bg-accent/50 flex-1 truncate rounded px-2 py-1 font-mono text-[11px]">
              {server.serverUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-6 w-6 shrink-0"
              onClick={(e) => {
                e.preventDefault();
                copyUrl();
              }}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="border-border/50 text-muted-foreground mt-2 flex items-center gap-3 border-t pt-2 text-xs">
            <span>{server.stats.successRate}% success</span>
            <span>{server.stats.avgLatency}ms avg</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
