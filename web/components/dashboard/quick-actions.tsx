"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Download, Zap, Webhook } from "@/lib/icons";

export function QuickActions() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/agents/new">
          <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Agent</span>
          </Button>
        </Link>
        <Link href="/integrations">
          <Button
            size="sm"
            variant="outline"
            className="text-muted-foreground hover:bg-accent hover:text-foreground border"
          >
            <Zap className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Integration</span>
          </Button>
        </Link>
        <Link href="/webhooks">
          <Button
            size="sm"
            variant="outline"
            className="text-muted-foreground hover:bg-accent hover:text-foreground border"
          >
            <Webhook className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Webhook</span>
          </Button>
        </Link>
        <Link href="/mcp-registry/new">
          <Button
            size="sm"
            variant="outline"
            className="text-muted-foreground hover:bg-accent hover:text-foreground border"
          >
            <Image
              src="/icons/mcp.svg"
              alt="MCP"
              width={16}
              height={16}
              className="h-4 w-4 opacity-70 brightness-0 invert sm:mr-2"
            />
            <span className="hidden sm:inline">Create Server</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/activity">
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Activity className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">View All Activity</span>
          </Button>
        </Link>
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Export Report</span>
        </Button>
      </div>
    </div>
  );
}
