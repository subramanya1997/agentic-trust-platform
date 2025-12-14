import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "@/lib/icons";
import type { MCPToolInvocation } from "@/lib/types";

interface InvocationsTableProps {
  invocations: MCPToolInvocation[];
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

export function InvocationsTable({ invocations }: InvocationsTableProps) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-sm">Recent Invocations</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {invocations.length === 0 ? (
          <p className="text-foreground0 py-6 text-center text-sm">No invocations yet</p>
        ) : (
          <Table className="rounded-none">
            <TableHeader className="!bg-card">
              <TableRow className="border-border border-b hover:bg-transparent">
                <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                  Status
                </TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                  Tool Name
                </TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                  Client ID
                </TableHead>
                <TableHead className="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-white uppercase">
                  Duration
                </TableHead>
                <TableHead className="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-white uppercase">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="!bg-card [&_tr]:!bg-card [&_tr:hover]:!bg-muted">
              {invocations.slice(0, 10).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {inv.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={`text-sm ${inv.status === "success" ? "text-green-400" : "text-red-400"}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <code className="text-foreground font-mono text-sm">{inv.toolName}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                    {inv.clientId}
                  </TableCell>
                  <TableCell className="text-muted-foreground px-4 py-3 text-right text-sm">
                    {inv.duration}ms
                  </TableCell>
                  <TableCell
                    className="text-foreground0 px-4 py-3 text-right text-sm"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(inv.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
