import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIntegrationIcon } from "@/lib/integration-icons";
import { Shield, Bot } from "@/lib/icons";
import type { CustomMCPServer } from "@/lib/types";

interface ToolsTableProps {
  server: CustomMCPServer;
}

export function ToolsTable({ server }: ToolsTableProps) {
  return (
    <Card className="bg-card border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-foreground flex items-center justify-between">
          <span>Tools ({server.selectedTools.length})</span>
          <Badge
            variant="outline"
            className="bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            {server.authType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table className="rounded-none">
          <TableHeader className="!bg-card">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="px-4 py-2.5 text-white text-xs font-medium uppercase tracking-wider">Source</TableHead>
              <TableHead className="px-4 py-2.5 text-white text-xs font-medium uppercase tracking-wider">Tool Name</TableHead>
              <TableHead className="px-4 py-2.5 text-white text-xs font-medium uppercase tracking-wider">Description</TableHead>
              <TableHead className="px-4 py-2.5 text-white text-xs font-medium uppercase tracking-wider">Category</TableHead>
              <TableHead className="px-4 py-2.5 text-white text-xs font-medium uppercase tracking-wider text-right">Parameters</TableHead>
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
                    <span className="text-sm text-muted-foreground">{tool.sourceName}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <code className="text-sm font-mono text-foreground">{tool.toolName}</code>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {tool.toolDescription}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      tool.category === "read" 
                        ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
                        : tool.category === "write"
                        ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {tool.category}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-xs text-foreground0">
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

