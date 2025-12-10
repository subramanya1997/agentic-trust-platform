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
import { Shield, Bot } from "lucide-react";
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
            className="bg-purple-950/50 text-purple-400 border-purple-800 text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            {server.authType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Source</TableHead>
              <TableHead className="text-muted-foreground">Tool Name</TableHead>
              <TableHead className="text-muted-foreground">Description</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground text-right">Parameters</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {server.selectedTools.map((tool, idx) => (
              <TableRow key={idx} className="border hover:bg-accent/50">
                <TableCell>
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
                <TableCell>
                  <code className="text-sm font-mono text-foreground">{tool.toolName}</code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {tool.toolDescription}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tool.category === "read" ? "success" : tool.category === "write" ? "info" : "warning"}
                    className="text-xs"
                  >
                    {tool.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-foreground0">
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

