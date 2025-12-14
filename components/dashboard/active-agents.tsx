import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/lib/data/mock-data";
import { formatCurrency, formatPercentage, formatRelativeTime } from "@/lib/utils";
import { Bot, TrendingUp } from "@/lib/icons";

interface ActiveAgentsProps {
  agents: Agent[];
}

export function ActiveAgents({ agents }: ActiveAgentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Agents</CardTitle>
          <Link
            href="/agents"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
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
              className="block rounded-lg border border p-4 hover:border-amber-600/50 hover:bg-accent/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {agent.name}
                      </h4>
                      <Badge 
                        variant="outline"
                        className={agent.status === "active" ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-foreground0">
                      <span>v{agent.version}</span>
                      <span>•</span>
                      <span>{agent.executionCount} runs</span>
                      <span>•</span>
                      <span suppressHydrationWarning>Last run {formatRelativeTime(agent.lastRun)}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    {formatPercentage(agent.successRate)}
                  </div>
                  <div className="text-sm text-muted-foreground">
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

