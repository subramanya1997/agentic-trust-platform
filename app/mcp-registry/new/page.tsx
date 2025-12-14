"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import { Header } from "@/components/layout/header";
import {
  ServerConfigForm,
  defaultServerConfig,
  type ServerConfig,
} from "@/components/mcp-registry/server-config-form";
import { ToolSelector } from "@/components/mcp-registry/tool-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Server,
  Wrench,
  Settings,
  Eye,
  Bot,
  Copy,
  Shield,
  Gauge,
  Loader2,
} from "@/lib/icons";
import type { SelectedTool } from "@/lib/types";

type Step = "config" | "tools" | "review";

export default function NewMCPServerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("config");
  const [config, setConfig] = useState<ServerConfig>(defaultServerConfig);
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ServerConfig, string>>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "config", label: "Configuration", icon: <Settings className="h-4 w-4" /> },
    { id: "tools", label: "Select Tools", icon: <Wrench className="h-4 w-4" /> },
    { id: "review", label: "Review & Create", icon: <Eye className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const validateConfig = (): boolean => {
    const newErrors: Partial<Record<keyof ServerConfig, string>> = {};

    if (!config.name.trim()) {
      newErrors.name = "Server name is required";
    } else if (config.name.length < 3) {
      newErrors.name = "Server name must be at least 3 characters";
    }

    if (!config.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (config.rateLimitPerMinute < 1 || config.rateLimitPerMinute > 1000) {
      newErrors.rateLimitPerMinute = "Rate limit must be between 1 and 1000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === "config") {
      if (validateConfig()) {
        setCurrentStep("tools");
      }
    } else if (currentStep === "tools") {
      if (selectedTools.length === 0) {
        // Could show an error, but for now just proceed
      }
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "tools") {
      setCurrentStep("config");
    } else if (currentStep === "review") {
      setCurrentStep("tools");
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In a real app, this would create the server and redirect
    router.push("/mcp-registry");
  };

  const serverUrl = `https://mcp.agentictrust.com/servers/custom/${config.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Group selected tools by source
  const groupedTools = selectedTools.reduce(
    (acc, tool) => {
      const key = `${tool.sourceType}-${tool.sourceId}`;
      if (!acc[key]) {
        acc[key] = {
          sourceType: tool.sourceType,
          sourceId: tool.sourceId,
          sourceName: tool.sourceName,
          tools: [],
        };
      }
      acc[key].tools.push(tool);
      return acc;
    },
    {} as Record<
      string,
      { sourceType: string; sourceId: string; sourceName: string; tools: SelectedTool[] }
    >
  );

  return (
    <>
      <Header subtitle="Create a custom MCP server with tools from integrations and agents" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Back Link */}
          <Link
            href="/mcp-registry"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MCP Registry
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isCompleted
                          ? "bg-green-600"
                          : isCurrent
                            ? "bg-amber-600"
                            : "bg-accent border"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span className={isCurrent ? "text-white" : "text-muted-foreground"}>
                          {step.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isCurrent ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-foreground0 text-xs">
                        Step {index + 1} of {steps.length}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-px flex-1 ${isCompleted ? "bg-green-600" : "bg-muted"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card className="bg-card border">
            <CardContent className="p-6">
              {/* Step 1: Configuration */}
              {currentStep === "config" && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950">
                      <Settings className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-semibold">
                        Server Configuration
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Set up the basic configuration for your MCP server
                      </p>
                    </div>
                  </div>

                  <ServerConfigForm config={config} onChange={setConfig} errors={errors} />
                </div>
              )}

              {/* Step 2: Select Tools */}
              {currentStep === "tools" && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950">
                      <Wrench className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-semibold">Select Tools</h2>
                      <p className="text-muted-foreground text-sm">
                        Choose which tools to include in your MCP server
                      </p>
                    </div>
                  </div>

                  <ToolSelector
                    selectedTools={selectedTools}
                    onSelectionChange={setSelectedTools}
                  />

                  {selectedTools.length === 0 && (
                    <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-4">
                      <p className="text-sm text-amber-200">
                        Select at least one tool to include in your MCP server.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === "review" && (
                <div className="space-y-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-950">
                      <Eye className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-semibold">Review & Create</h2>
                      <p className="text-muted-foreground text-sm">
                        Review your configuration before creating the server
                      </p>
                    </div>
                  </div>

                  {/* Server Info Card */}
                  <Card className="bg-accent border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground flex items-center gap-2 text-base">
                        <Server className="text-muted-foreground h-4 w-4" />
                        Server Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-foreground0 text-xs">Name</p>
                          <p className="text-foreground text-sm font-medium">{config.name}</p>
                        </div>
                        <div>
                          <p className="text-foreground0 text-xs">Authentication</p>
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-purple-400" />
                            <p className="text-foreground text-sm">{config.authType}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-foreground0 text-xs">Rate Limit</p>
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5 text-blue-400" />
                            <p className="text-foreground text-sm">
                              {config.rateLimitPerMinute} req/min
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-foreground0 text-xs">Tools</p>
                          <p className="text-foreground text-sm">{selectedTools.length} tools</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-foreground0 mb-1 text-xs">Description</p>
                        <p className="text-muted-foreground text-sm">{config.description}</p>
                      </div>

                      <div>
                        <p className="text-foreground0 mb-1 text-xs">Server URL</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-card flex-1 rounded px-3 py-2 font-mono text-sm text-amber-400">
                            {serverUrl}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground border-stone-600"
                            onClick={copyUrl}
                          >
                            {copiedUrl ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Tools */}
                  <Card className="bg-accent border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground flex items-center gap-2 text-base">
                        <Wrench className="text-muted-foreground h-4 w-4" />
                        Selected Tools ({selectedTools.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTools.length === 0 ? (
                        <p className="text-foreground0 py-4 text-center text-sm">
                          No tools selected
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {Object.values(groupedTools).map((group) => (
                            <div key={`${group.sourceType}-${group.sourceId}`}>
                              <div className="mb-2 flex items-center gap-2">
                                {group.sourceType === "integration" ? (
                                  <IntegrationIcon
                                    integrationId={group.sourceId}
                                    alt={group.sourceName}
                                    width={16}
                                    height={16}
                                    className="rounded"
                                  />
                                ) : (
                                  <Bot className="h-4 w-4 text-amber-400" />
                                )}
                                <span className="text-muted-foreground text-sm font-medium">
                                  {group.sourceName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-muted text-muted-foreground border-stone-600 text-xs"
                                >
                                  {group.tools.length}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 pl-6">
                                {group.tools.map((tool) => (
                                  <Badge
                                    key={`${tool.sourceId}-${tool.toolName}`}
                                    variant="outline"
                                    className={`text-xs ${
                                      tool.category === "read"
                                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                                        : tool.category === "write"
                                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                          : "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                    }`}
                                  >
                                    {tool.toolName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "config"}
              className="text-muted-foreground border disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={handleCreate}
                disabled={isCreating || selectedTools.length === 0}
                className="bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create MCP Server
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStep === "tools" && selectedTools.length === 0}
                className="bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
