"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Play, Settings, Zap, TrendingUp, Sparkles } from "lucide-react";
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-800">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground0 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground0 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground0 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-foreground0 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                <tr className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-green-950 flex items-center justify-center">
                        <Play className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-sm text-foreground">Agent Run</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">System</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Completed successfully</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground0" suppressHydrationWarning>
                    {formatRelativeTime(agent.lastRun)}
                  </td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-blue-950 flex items-center justify-center">
                        <Settings className="h-3 w-3 text-blue-400" />
                      </div>
                      <span className="text-sm text-foreground">Config Updated</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Updated instructions</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground0">2 days ago</td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-purple-950 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-purple-400" />
                      </div>
                      <span className="text-sm text-foreground">Integration Added</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    Connected {agent.integrations[0]?.name}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground0">1 week ago</td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-orange-950 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-orange-400" />
                      </div>
                      <span className="text-sm text-foreground">Version Released</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Released v{agent.version}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground0">2 weeks ago</td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-amber-950 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                      </div>
                      <span className="text-sm text-foreground">Agent Created</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{agent.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">Created {agent.name}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground0">
                    {new Date(agent.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

