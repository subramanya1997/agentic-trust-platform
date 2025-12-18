import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Bot } from "@/lib/icons";
import { getIntegrationIcon } from "@/lib/integration-icons";
import type { CustomMCPServer } from "@/lib/types";

interface ToolsTableProps {
  server: CustomMCPServer;
}

export function ToolsTable({ server }: ToolsTableProps) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center justify-between text-sm">
          <span>Tools ({server.selectedTools.length})</span>
          <Badge
            variant="outline"
            className="border-purple-500 bg-purple-500/10 text-xs text-purple-600 dark:text-purple-400"
          >
            <Shield className="mr-1 h-3 w-3" />
            {server.authType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table className="rounded-none">
          <TableHeader className="!bg-card">
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                Source
              </TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                Tool Name
              </TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                Description
              </TableHead>
              <TableHead className="px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase">
                Category
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-xs font-medium tracking-wider text-white uppercase">
                Parameters
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="!bg-card [&_tr]:!bg-card [&_tr:hover]:!bg-muted">
            {server.selectedTools.map((tool, idx) => (
              <TableRow key={idx}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {tool.sourceType === "integration" ? (
                      <Image
                        src={getIntegrationIcon(tool.sourceId)}
                        alt={tool.sourceName}
                        width={16}
                        height={16}
                        className="rounded"
                      />
                    ) : (
                      <Bot className="h-4 w-4 text-amber-400" />
                    )}
                    <span className="text-muted-foreground text-sm">{tool.sourceName}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <code className="text-foreground font-mono text-sm">{tool.toolName}</code>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate px-4 py-3 text-sm">
                  {tool.toolDescription}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      tool.category === "read"
                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : tool.category === "write"
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {tool.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground0 px-4 py-3 text-right text-xs">
                  {tool.parameters.filter((p) => p.required).length} required,{" "}
                  {tool.parameters.filter((p) => !p.required).length} optional
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
