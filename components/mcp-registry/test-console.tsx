"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIntegrationIcon } from "@/lib/integration-icons";
import type { SelectedTool } from "@/lib/types";
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
const generateMockResponse = (tool: SelectedTool, params: Record<string, unknown>): Record<string, unknown> => {
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

  const selectedTool = tools.find(
    (t) => `${t.sourceId}-${t.toolName}` === selectedToolId
  );

  const handleToolChange = useCallback((toolId: string) => {
    setSelectedToolId(toolId);
    setParams({});
    setResult(null);
  }, []);

  const handleParamChange = (paramName: string, value: string) => {
    setParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

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
            params: Object.fromEntries(
              Object.entries(params).filter((entry) => entry[1] !== "")
            ),
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
        <CardTitle className="text-base text-foreground">
          Test Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Select Tool</Label>
          <Select value={selectedToolId} onValueChange={handleToolChange}>
            <SelectTrigger className="bg-accent border text-foreground">
              <SelectValue placeholder="Choose a tool to test" />
            </SelectTrigger>
            <SelectContent className="bg-accent border max-h-[300px]">
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
                      className={`text-[10px] px-1 py-0 ml-1 ${
                        tool.category === "read" 
                          ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
                          : tool.category === "write"
                          ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                          : "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400"
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
            <p className="text-xs text-foreground0">{selectedTool.toolDescription}</p>
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
                    <Label
                      htmlFor={param.name}
                      className="text-sm text-muted-foreground font-mono"
                    >
                      {param.name}
                    </Label>
                    {param.required && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
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
                      className="bg-accent border text-foreground placeholder:text-stone-600 text-sm font-mono resize-none"
                    />
                  ) : (
                    <Input
                      id={param.name}
                      type={param.type === "number" ? "number" : "text"}
                      value={params[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      className="bg-accent border text-foreground placeholder:text-stone-600 text-sm font-mono"
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
          className="w-full bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute Tool
            </>
          )}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="space-y-4">
            {/* Status Bar */}
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                result.success
                  ? "bg-green-950/30 border border-green-800/50"
                  : "bg-red-950/30 border border-red-800/50"
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
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {result.duration}ms
                </span>
              </div>
            </div>

            {/* Request/Response Tabs */}
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="bg-accent border border">
                <TabsTrigger
                  value="response"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <FileJson className="h-3.5 w-3.5 mr-1.5" />
                  Response
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  MCP Request
                </TabsTrigger>
                <TabsTrigger
                  value="mcp-response"
                  className="data-[state=active]:bg-muted text-muted-foreground data-[state=active]:text-foreground"
                >
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  MCP Response
                </TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-foreground0 hover:text-muted-foreground"
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
                  <pre className="p-4 rounded-lg bg-background border border text-xs font-mono text-muted-foreground overflow-x-auto max-h-[300px]">
                    {result.success
                      ? JSON.stringify(result.response, null, 2)
                      : result.error}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="request" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-foreground0 hover:text-muted-foreground"
                    onClick={() => copyToClipboard(mcpRequest, "request")}
                  >
                    {copiedRequest ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <pre className="p-4 rounded-lg bg-background border border text-xs font-mono text-muted-foreground overflow-x-auto max-h-[300px]">
                    {mcpRequest}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="mcp-response" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-foreground0 hover:text-muted-foreground"
                    onClick={() => copyToClipboard(mcpResponse, "response")}
                  >
                    {copiedResponse ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <pre className="p-4 rounded-lg bg-background border border text-xs font-mono text-muted-foreground overflow-x-auto max-h-[300px]">
                    {mcpResponse}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Server URL Info */}
        <div className="pt-4">
          <p className="text-xs text-foreground0 mb-2">Server Endpoint</p>
          <code className="block text-xs text-muted-foreground font-mono bg-accent px-3 py-2 rounded break-all">
            {serverUrl}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

