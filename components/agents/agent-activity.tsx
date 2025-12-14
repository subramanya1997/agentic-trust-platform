"use client";

import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Settings, Zap, TrendingUp, Sparkles } from "@/lib/icons";
import type { Agent } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface AgentActivityProps {
  agent: Agent;
}

export function AgentActivity({ agent }: AgentActivityProps) {
  return (
    <>
      <h2 className="text-foreground mb-4 font-semibold">Activity</h2>
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Event", align: "left" },
              { label: "User", align: "left" },
              { label: "Details", align: "left" },
              { label: "Time", align: "right" },
            ]}
          >
            <TableRow>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-green-950">
                    <Play className="h-3 w-3 text-green-400" />
                  </div>
                  <span className="text-foreground text-sm">Agent Run</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">System</TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                Completed successfully
              </TableCell>
              <TableCell
                className="text-foreground0 px-4 py-3 text-right text-sm"
                suppressHydrationWarning
              >
                {formatRelativeTime(agent.lastRun)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-950">
                    <Settings className="h-3 w-3 text-blue-400" />
                  </div>
                  <span className="text-foreground text-sm">Config Updated</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                {agent.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                Updated instructions
              </TableCell>
              <TableCell className="text-foreground0 px-4 py-3 text-right text-sm">
                2 days ago
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-950">
                    <Zap className="h-3 w-3 text-purple-400" />
                  </div>
                  <span className="text-foreground text-sm">Integration Added</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                {agent.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                Connected {agent.integrations[0]?.name}
              </TableCell>
              <TableCell className="text-foreground0 px-4 py-3 text-right text-sm">
                1 week ago
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-950">
                    <TrendingUp className="h-3 w-3 text-orange-400" />
                  </div>
                  <span className="text-foreground text-sm">Version Released</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                {agent.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                Released v{agent.version}
              </TableCell>
              <TableCell className="text-foreground0 px-4 py-3 text-right text-sm">
                2 weeks ago
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-950">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-foreground text-sm">Agent Created</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                {agent.createdBy}
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                Created {agent.name}
              </TableCell>
              <TableCell className="text-foreground0 px-4 py-3 text-right text-sm">
                {new Date(agent.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
            </TableRow>
          </DataTable>
        </CardContent>
      </Card>
    </>
  );
}
