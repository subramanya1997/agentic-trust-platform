import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@/lib/data/mock-data";
import { Bot, TrendingUp } from "@/lib/icons";
import { formatCurrency, formatPercentage, formatRelativeTime } from "@/lib/utils";

interface ActiveAgentsProps {
  agents: Agent[];
}

export function ActiveAgents({ agents }: ActiveAgentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Agents</CardTitle>
          <Link href="/agents" className="text-sm font-medium text-amber-500 hover:text-amber-400">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="hover:bg-accent/50 block rounded-lg border p-4 transition-all hover:border-amber-600/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground truncate font-semibold">{agent.name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          agent.status === "active"
                            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                            : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {agent.description}
                    </p>
                    <div className="text-foreground0 mt-3 flex items-center gap-4 text-xs">
                      <span>v{agent.version}</span>
                      <span>•</span>
                      <span>{agent.executionCount} runs</span>
                      <span>•</span>
                      <span suppressHydrationWarning>
                        Last run {formatRelativeTime(agent.lastRun)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    {formatPercentage(agent.successRate)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Avg: {formatCurrency(agent.avgCost)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
