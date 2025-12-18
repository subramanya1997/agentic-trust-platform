import Link from "next/link";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Execution } from "@/lib/data/mock-data";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "@/lib/icons";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/utils";

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
        <DataTable
          headers={[
            { label: "Time", align: "left" },
            { label: "Agent", align: "left" },
            { label: "Status", align: "left" },
            { label: "Duration", align: "right" },
            { label: "Cost", align: "right" },
          ]}
        >
          {executions.map((execution) => (
            <TableRow key={execution.id} className="cursor-pointer">
              <TableCell
                className="text-muted-foreground px-4 py-3 text-sm"
                suppressHydrationWarning
              >
                {formatRelativeTime(execution.startedAt)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <Link
                  href={`/agents/${execution.agentId}`}
                  className="text-foreground text-sm font-medium hover:text-amber-500"
                >
                  {execution.agentName}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3">
                <ExecutionStatusBadge status={execution.status} />
              </TableCell>
              <TableCell className="text-muted-foreground px-4 py-3 text-right text-sm">
                {formatDuration(execution.duration)}
              </TableCell>
              <TableCell className="text-foreground px-4 py-3 text-right text-sm font-medium">
                {formatCurrency(execution.cost)}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </CardContent>
    </Card>
  );
}

function ExecutionStatusBadge({ status }: { status: Execution["status"] }) {
  const config = {
    completed: {
      className: "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400",
      icon: CheckCircle2,
      label: "Success",
    },
    failed: {
      className: "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400",
      icon: XCircle,
      label: "Failed",
    },
    running: {
      className: "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400",
      icon: Clock,
      label: "Running",
    },
    waiting_approval: {
      className: "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400",
      icon: AlertCircle,
      label: "Waiting",
    },
  };

  const { className, icon: Icon, label } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
