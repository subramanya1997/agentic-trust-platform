import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Execution } from "@/lib/data/mock-data";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface RecentExecutionsProps {
  executions: Execution[];
}

export function RecentExecutions({ executions }: RecentExecutionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="pb-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="pb-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="pb-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="pb-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {executions.map((execution) => (
                <tr
                  key={execution.id}
                  className="hover:bg-stone-800/50 cursor-pointer"
                >
                  <td className="py-4 text-sm text-stone-400" suppressHydrationWarning>
                    {formatRelativeTime(execution.startedAt)}
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/agents/${execution.agentId}`}
                      className="text-sm font-medium text-stone-200 hover:text-amber-500"
                    >
                      {execution.agentName}
                    </Link>
                  </td>
                  <td className="py-4">
                    <ExecutionStatusBadge status={execution.status} />
                  </td>
                  <td className="py-4 text-right text-sm text-stone-400">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="py-4 text-right text-sm text-stone-200 font-medium">
                    {formatCurrency(execution.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutionStatusBadge({ status }: { status: Execution["status"] }) {
  const config = {
    completed: {
      variant: "success" as const,
      icon: CheckCircle2,
      label: "Success",
    },
    failed: {
      variant: "error" as const,
      icon: XCircle,
      label: "Failed",
    },
    running: {
      variant: "info" as const,
      icon: Clock,
      label: "Running",
    },
    waiting_approval: {
      variant: "warning" as const,
      icon: AlertCircle,
      label: "Waiting",
    },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge variant={variant === "success" ? "default" : "destructive"}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

