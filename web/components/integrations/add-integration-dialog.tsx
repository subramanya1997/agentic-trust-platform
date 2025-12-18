"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Link2, FileJson, Upload, Check, Loader2 } from "@/lib/icons";

type IntegrationType = "mcp" | "openapi" | null;

interface AddIntegrationDialogProps {
  trigger?: React.ReactNode;
}

export function AddIntegrationDialog({ trigger }: AddIntegrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationType>(null);
  const [mcpUrl, setMcpUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);

    // Reset after showing success
    setTimeout(() => {
      setOpen(false);
      setSelectedType(null);
      setMcpUrl("");
      setFileName("");
      setIsSuccess(false);
    }, 1000);
  };

  const handleBack = () => {
    setSelectedType(null);
    setMcpUrl("");
    setFileName("");
  };

  const canSubmit = selectedType === "mcp" ? mcpUrl.trim() !== "" : fileName !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-amber-600 font-medium text-white hover:bg-amber-500">
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isSuccess
              ? "Integration Added"
              : selectedType
                ? selectedType === "mcp"
                  ? "Add MCP Server"
                  : "Import OpenAPI"
                : "Add Integration"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSuccess
              ? "Your integration has been added successfully."
              : selectedType
                ? selectedType === "mcp"
                  ? "Enter the URL of your MCP server to connect."
                  : "Upload an OpenAPI specification file to create an integration."
                : "Choose how you want to add a new integration."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-950">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-muted-foreground">Integration configured successfully</p>
          </div>
        ) : selectedType === null ? (
          <div className="grid gap-3 py-4">
            <IntegrationTypeCard
              icon={Link2}
              title="MCP Server"
              description="Connect to a Model Context Protocol server"
              badge="MCP"
              onClick={() => setSelectedType("mcp")}
            />
            <IntegrationTypeCard
              icon={FileJson}
              title="OpenAPI Specification"
              description="Import from OpenAPI/Swagger JSON file"
              badge="API"
              onClick={() => setSelectedType("openapi")}
            />
          </div>
        ) : selectedType === "mcp" ? (
          <div className="space-y-4 py-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                MCP Server URL
              </label>
              <input
                type="url"
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                placeholder="https://mcp.example.com/server"
                className="bg-accent text-foreground placeholder:text-foreground0 w-full rounded-lg border px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-foreground0 mt-2 text-xs">
                The URL should point to a running MCP server endpoint
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="text-muted-foreground hover:bg-accent flex-1 border"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-amber-600 text-white hover:bg-amber-500"
                disabled={!canSubmit || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                OpenAPI Specification
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="openapi-file"
                />
                <label
                  htmlFor="openapi-file"
                  className="bg-accent/50 hover:border-accent flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-2 border-dashed px-4 py-8 transition-colors"
                >
                  {fileName ? (
                    <div className="text-foreground flex items-center gap-2">
                      <FileJson className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="text-foreground0 mx-auto mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-foreground0 mt-1 text-xs">JSON or YAML (OpenAPI 3.0+)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="text-muted-foreground hover:bg-accent flex-1 border"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-amber-600 text-white hover:bg-amber-500"
                disabled={!canSubmit || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IntegrationTypeCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-accent/50 flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all hover:border"
    >
      <div className="bg-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="h-5 w-5 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium">{title}</span>
          <Badge variant="outline" className="bg-accent text-muted-foreground border text-xs">
            {badge}
          </Badge>
        </div>
        <p className="text-foreground0 mt-1 text-xs">{description}</p>
      </div>
    </button>
  );
}
