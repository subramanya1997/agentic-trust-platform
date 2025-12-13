"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ToolSelector } from "@/components/mcp-registry/tool-selector";
import {
  ServerConfigForm,
  defaultServerConfig,
  type ServerConfig,
} from "@/components/mcp-registry/server-config-form";
import { IntegrationIcon } from "@/components/integration-icon";
import type { SelectedTool } from "@/lib/types";
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
} from "lucide-react";

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
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Link */}
          <Link
            href="/mcp-registry"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-green-600"
                          : isCurrent
                          ? "bg-amber-600"
                          : "bg-accent border border"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={isCurrent ? "text-white" : "text-muted-foreground"}
                        >
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
                      <p className="text-xs text-foreground0">
                        Step {index + 1} of {steps.length}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-4 ${
                        isCompleted ? "bg-green-600" : "bg-muted"
                      }`}
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-amber-950 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Server Configuration
                      </h2>
                      <p className="text-sm text-muted-foreground">
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-blue-950 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Select Tools</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose which tools to include in your MCP server
                      </p>
                    </div>
                  </div>

                  <ToolSelector
                    selectedTools={selectedTools}
                    onSelectionChange={setSelectedTools}
                  />

                  {selectedTools.length === 0 && (
                    <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/50">
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-green-950 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Review & Create</h2>
                      <p className="text-sm text-muted-foreground">
                        Review your configuration before creating the server
                      </p>
                    </div>
                  </div>

                  {/* Server Info Card */}
                  <Card className="bg-accent border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-foreground flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        Server Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-foreground0">Name</p>
                          <p className="text-sm text-foreground font-medium">{config.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground0">Authentication</p>
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-purple-400" />
                            <p className="text-sm text-foreground">{config.authType}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-foreground0">Rate Limit</p>
                          <div className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5 text-blue-400" />
                            <p className="text-sm text-foreground">
                              {config.rateLimitPerMinute} req/min
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-foreground0">Tools</p>
                          <p className="text-sm text-foreground">{selectedTools.length} tools</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-foreground0 mb-1">Description</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>

                      <div>
                        <p className="text-xs text-foreground0 mb-1">Server URL</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm text-amber-400 font-mono bg-card px-3 py-2 rounded">
                            {serverUrl}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-stone-600 text-muted-foreground hover:text-foreground"
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
                      <CardTitle className="text-base text-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        Selected Tools ({selectedTools.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTools.length === 0 ? (
                        <p className="text-sm text-foreground0 text-center py-4">
                          No tools selected
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {Object.values(groupedTools).map((group) => (
                            <div key={`${group.sourceType}-${group.sourceId}`}>
                              <div className="flex items-center gap-2 mb-2">
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
                                <span className="text-sm font-medium text-muted-foreground">
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
                                    variant={tool.category === "read" ? "success" : tool.category === "write" ? "info" : "warning"}
                                    className="text-xs"
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
              className="border text-muted-foreground disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={handleCreate}
                disabled={isCreating || selectedTools.length === 0}
                className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create MCP Server
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStep === "tools" && selectedTools.length === 0}
                className="bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

