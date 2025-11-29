"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Link2, FileJson, Upload, Check, Loader2 } from "lucide-react";

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
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800">
        <DialogHeader>
          <DialogTitle className="text-stone-100">
            {isSuccess ? "Integration Added" : selectedType ? (selectedType === "mcp" ? "Add MCP Server" : "Import OpenAPI") : "Add Integration"}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            {isSuccess 
              ? "Your integration has been added successfully."
              : selectedType 
                ? (selectedType === "mcp" 
                    ? "Enter the URL of your MCP server to connect."
                    : "Upload an OpenAPI specification file to create an integration.")
                : "Choose how you want to add a new integration."
            }
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center py-8">
            <div className="h-12 w-12 rounded-full bg-green-950 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-stone-300">Integration configured successfully</p>
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
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">
                MCP Server URL
              </label>
              <input
                type="url"
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                placeholder="https://mcp.example.com/server"
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="mt-2 text-xs text-stone-500">
                The URL should point to a running MCP server endpoint
              </p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
                disabled={!canSubmit || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">
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
                  className="flex items-center justify-center gap-3 w-full rounded-lg border-2 border-dashed border-stone-700 bg-stone-800/50 px-4 py-8 cursor-pointer hover:border-stone-600 transition-colors"
                >
                  {fileName ? (
                    <div className="flex items-center gap-2 text-stone-200">
                      <FileJson className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-stone-500 mx-auto mb-2" />
                      <p className="text-sm text-stone-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        JSON or YAML (OpenAPI 3.0+)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
                disabled={!canSubmit || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      className="flex items-start gap-4 p-4 rounded-lg border border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 transition-all text-left w-full"
    >
      <div className="h-10 w-10 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-100">{title}</span>
          <Badge variant="outline" className="text-xs bg-stone-800 text-stone-400 border-stone-700">
            {badge}
          </Badge>
        </div>
        <p className="text-xs text-stone-500 mt-1">{description}</p>
      </div>
    </button>
  );
}

