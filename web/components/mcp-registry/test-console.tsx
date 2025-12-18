"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Loader2,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Code,
  FileJson,
} from "@/lib/icons";
import { getIntegrationIcon } from "@/lib/integration-icons";
import type { SelectedTool } from "@/lib/types";

interface TestConsoleProps {
  tools: SelectedTool[];
  serverUrl: string;
}

interface TestResult {
  success: boolean;
  duration: number;
  timestamp: string;
  request: {
    method: string;
    tool: string;
    params: Record<string, unknown>;
  };
  response?: Record<string, unknown>;
  error?: string;
}

// Mock responses for different tool types
const generateMockResponse = (
  tool: SelectedTool,
  params: Record<string, unknown>
): Record<string, unknown> => {
  // Generate realistic mock responses based on tool name patterns
  if (tool.toolName.includes("search") || tool.toolName.includes("list")) {
    return {
      results: [
        { id: "item-1", name: "Sample Result 1", created_at: new Date().toISOString() },
        { id: "item-2", name: "Sample Result 2", created_at: new Date().toISOString() },
      ],
      total: 2,
      has_more: false,
    };
  }

  if (tool.toolName.includes("create")) {
    return {
      id: `new-${Date.now()}`,
      created: true,
      ...params,
      created_at: new Date().toISOString(),
    };
  }

  if (tool.toolName.includes("get") || tool.toolName.includes("enrich")) {
    return {
      id: params.id || params.email || "sample-id",
      data: {
        name: "Sample Entity",
        email: "sample@example.com",
        company: "Sample Corp",
        industry: "Technology",
        employee_count: 150,
      },
      enriched_at: new Date().toISOString(),
    };
  }

  if (tool.toolName.includes("send") || tool.toolName.includes("message")) {
    return {
      sent: true,
      message_id: `msg-${Date.now()}`,
      delivered_at: new Date().toISOString(),
    };
  }

  // Default response
  return {
    success: true,
    tool: tool.toolName,
    executed_at: new Date().toISOString(),
    result: "Operation completed successfully",
  };
};

export function TestConsole({ tools, serverUrl }: TestConsoleProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    tools.length > 0 ? `${tools[0].sourceId}-${tools[0].toolName}` : ""
  );
  const [params, setParams] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const selectedTool = tools.find((t) => `${t.sourceId}-${t.toolName}` === selectedToolId);

  const handleToolChange = useCallback((toolId: string) => {
    setSelectedToolId(toolId);
    setParams({});
    setResult(null);
  }, []);

  const handleParamChange = (paramName: string, value: string) => {
    setParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleExecute = async () => {
    if (!selectedTool) {
      return;
    }

    setIsExecuting(true);
    setResult(null);

    // Simulate API call with random delay
    await new Promise<void>((resolve) => {
      const delay = 200 + Math.random() * 800;
      setTimeout(() => {
        // Randomly fail ~10% of requests for realism
        const shouldFail = Math.random() < 0.1;

        const testResult: TestResult = {
          success: !shouldFail,
          duration: Math.round(delay),
          timestamp: new Date().toISOString(),
          request: {
            method: "POST",
            tool: selectedTool.toolName,
            params: Object.fromEntries(Object.entries(params).filter((entry) => entry[1] !== "")),
          },
        };

        if (shouldFail) {
          testResult.error = "Simulated error: Rate limit exceeded. Please try again.";
        } else {
          testResult.response = generateMockResponse(selectedTool, testResult.request.params);
        }

        setResult(testResult);
        setIsExecuting(false);
        resolve();
      }, delay);
    });
  };

  const copyToClipboard = (text: string, type: "request" | "response") => {
    navigator.clipboard.writeText(text);
    if (type === "request") {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const mcpRequest = selectedTool
    ? JSON.stringify(
        {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: selectedTool.toolName,
            arguments: Object.fromEntries(
              Object.entries(params).filter((entry) => entry[1] !== "")
            ),
          },
          id: 1,
        },
        null,
        2
      )
    : "";

  const mcpResponse = result
    ? JSON.stringify(
        result.success
          ? {
              jsonrpc: "2.0",
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result.response, null, 2),
                  },
                ],
              },
              id: 1,
            }
          : {
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: result.error,
              },
              id: 1,
            },
        null,
        2
      )
    : "";

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-base">Test Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Select Tool</Label>
          <Select value={selectedToolId} onValueChange={handleToolChange}>
            <SelectTrigger className="bg-accent text-foreground border">
              <SelectValue placeholder="Choose a tool to test" />
            </SelectTrigger>
            <SelectContent className="bg-accent max-h-[300px] border">
              {tools.map((tool) => (
                <SelectItem
                  key={`${tool.sourceId}-${tool.toolName}`}
                  value={`${tool.sourceId}-${tool.toolName}`}
                  className="text-foreground focus:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    {tool.sourceType === "integration" ? (
                      <Image
                        src={getIntegrationIcon(tool.sourceId)}
                        alt={tool.sourceName}
                        width={14}
                        height={14}
                        className="rounded"
                      />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span className="font-mono text-sm">{tool.toolName}</span>
                    <Badge
                      variant="outline"
                      className={`ml-1 px-1 py-0 text-[10px] ${
                        tool.category === "read"
                          ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                          : tool.category === "write"
                            ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {tool.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTool && (
            <p className="text-foreground0 text-xs">{selectedTool.toolDescription}</p>
          )}
        </div>

        {/* Parameters Form */}
        {selectedTool && selectedTool.parameters.length > 0 && (
          <div className="space-y-4">
            <Label className="text-muted-foreground">Parameters</Label>
            <div className="grid gap-4">
              {selectedTool.parameters.map((param) => (
                <div key={param.name} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={param.name} className="text-muted-foreground font-mono text-sm">
                      {param.name}
                    </Label>
                    {param.required && (
                      <Badge
                        variant="outline"
                        className="border-red-500 bg-red-500/10 px-1 py-0 text-[10px] text-red-600 dark:text-red-400"
                      >
                        required
                      </Badge>
                    )}
                    <span className="text-xs text-stone-600">{param.type}</span>
                  </div>
                  {param.type === "string" && param.description.length > 50 ? (
                    <Textarea
                      id={param.name}
                      value={params[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      rows={2}
                      className="bg-accent text-foreground resize-none border font-mono text-sm placeholder:text-stone-600"
                    />
                  ) : (
                    <Input
                      id={param.name}
                      type={param.type === "number" ? "number" : "text"}
                      value={params[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      className="bg-accent text-foreground border font-mono text-sm placeholder:text-stone-600"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <Button
          onClick={handleExecute}
          disabled={!selectedTool || isExecuting}
          className="w-full bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute Tool
            </>
          )}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="space-y-4">
            {/* Status Bar */}
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                result.success
                  ? "border border-green-800/50 bg-green-950/30"
                  : "border border-red-800/50 bg-red-950/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    result.success ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {result.success ? "Success" : "Error"}
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {result.duration}ms
                </span>
              </div>
            </div>

            {/* Request/Response Tabs */}
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="bg-accent border">
                <TabsTrigger
                  value="response"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <FileJson className="mr-1.5 h-3.5 w-3.5" />
                  Response
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <Code className="mr-1.5 h-3.5 w-3.5" />
                  MCP Request
                </TabsTrigger>
                <TabsTrigger
                  value="mcp-response"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <Code className="mr-1.5 h-3.5 w-3.5" />
                  MCP Response
                </TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground0 hover:text-muted-foreground absolute top-2 right-2 h-7 w-7"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(result.response || { error: result.error }, null, 2),
                        "response"
                      )
                    }
                  >
                    {copiedResponse ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <pre className="bg-background text-muted-foreground max-h-[300px] overflow-x-auto rounded-lg border p-4 font-mono text-xs">
                    {result.success ? JSON.stringify(result.response, null, 2) : result.error}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="request" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground0 hover:text-muted-foreground absolute top-2 right-2 h-7 w-7"
                    onClick={() => copyToClipboard(mcpRequest, "request")}
                  >
                    {copiedRequest ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <pre className="bg-background text-muted-foreground max-h-[300px] overflow-x-auto rounded-lg border p-4 font-mono text-xs">
                    {mcpRequest}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="mcp-response" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground0 hover:text-muted-foreground absolute top-2 right-2 h-7 w-7"
                    onClick={() => copyToClipboard(mcpResponse, "response")}
                  >
                    {copiedResponse ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <pre className="bg-background text-muted-foreground max-h-[300px] overflow-x-auto rounded-lg border p-4 font-mono text-xs">
                    {mcpResponse}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Server URL Info */}
        <div className="pt-4">
          <p className="text-foreground0 mb-2 text-xs">Server Endpoint</p>
          <code className="text-muted-foreground bg-accent block rounded px-3 py-2 font-mono text-xs break-all">
            {serverUrl}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
