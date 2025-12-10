import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
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

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function InvocationsTable({ invocations }: InvocationsTableProps) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-foreground">
          Recent Invocations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {invocations.length === 0 ? (
          <p className="text-sm text-foreground0 text-center py-6">
            No invocations yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Tool Name</TableHead>
                <TableHead className="text-muted-foreground">Client ID</TableHead>
                <TableHead className="text-muted-foreground text-right">Duration</TableHead>
                <TableHead className="text-muted-foreground text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invocations.slice(0, 10).map((inv) => (
                <TableRow key={inv.id} className="border hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {inv.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm ${inv.status === "success" ? "text-green-400" : "text-red-400"}`}>
                        {inv.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm font-mono text-foreground">{inv.toolName}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.clientId}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{inv.duration}ms</TableCell>
                  <TableCell className="text-right text-sm text-foreground0" suppressHydrationWarning>
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

