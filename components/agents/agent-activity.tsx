"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Play, Settings, Zap, TrendingUp, Sparkles } from "@/lib/icons";
import { formatRelativeTime } from "@/lib/utils";
import type { Agent } from "@/lib/types";

interface AgentActivityProps {
  agent: Agent;
}

export function AgentActivity({ agent }: AgentActivityProps) {
  return (
    <>
      <h2 className="font-semibold text-foreground mb-4">Activity</h2>
      <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: 'Event', align: 'left' },
              { label: 'User', align: 'left' },
              { label: 'Details', align: 'left' },
              { label: 'Time', align: 'right' },
            ]}
          >
            <TableRow>
              <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-green-950 flex items-center justify-center">
                        <Play className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-sm text-foreground">Agent Run</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">System</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">Completed successfully</TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm text-foreground0" suppressHydrationWarning>
                    {formatRelativeTime(agent.lastRun)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-blue-950 flex items-center justify-center">
                        <Settings className="h-3 w-3 text-blue-400" />
                      </div>
                      <span className="text-sm text-foreground">Config Updated</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">Updated instructions</TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm text-foreground0">2 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-purple-950 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-purple-400" />
                      </div>
                      <span className="text-sm text-foreground">Integration Added</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    Connected {agent.integrations[0]?.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm text-foreground0">1 week ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-orange-950 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-orange-400" />
                      </div>
                      <span className="text-sm text-foreground">Version Released</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">Released v{agent.version}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm text-foreground0">2 weeks ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-amber-950 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                      </div>
                      <span className="text-sm text-foreground">Agent Created</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">Created {agent.name}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm text-foreground0">
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

