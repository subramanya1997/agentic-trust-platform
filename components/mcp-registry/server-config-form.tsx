"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MCPAuthType } from "@/lib/types";
import { Shield, Server, FileText, Gauge } from "@/lib/icons";

export interface ServerConfig {
  name: string;
  description: string;
  authType: MCPAuthType;
  rateLimitPerMinute: number;
}

interface ServerConfigFormProps {
  config: ServerConfig;
  onChange: (config: ServerConfig) => void;
  errors?: Partial<Record<keyof ServerConfig, string>>;
}

export function ServerConfigForm({ config, onChange, errors }: ServerConfigFormProps) {
  const updateConfig = <K extends keyof ServerConfig>(key: K, value: ServerConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Server Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          Server Name
        </Label>
        <Input
          id="name"
          value={config.name}
          onChange={(e) => updateConfig("name", e.target.value)}
          placeholder="e.g., Sales Toolkit, DevOps Hub"
          className={`bg-accent border text-foreground placeholder:text-foreground0 focus:border-amber-500 ${
            errors?.name ? "border-red-500" : ""
          }`}
        />
        {errors?.name && <p className="text-xs text-red-400">{errors.name}</p>}
        <p className="text-xs text-foreground0">
          A descriptive name for your MCP server. This will be visible to clients.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Description
        </Label>
        <Textarea
          id="description"
          value={config.description}
          onChange={(e) => updateConfig("description", e.target.value)}
          placeholder="Describe what this MCP server does and what tools it provides..."
          rows={3}
          className={`bg-accent border text-foreground placeholder:text-foreground0 focus:border-amber-500 resize-none ${
            errors?.description ? "border-red-500" : ""
          }`}
        />
        {errors?.description && <p className="text-xs text-red-400">{errors.description}</p>}
        <p className="text-xs text-foreground0">
          Help users understand what tools are available and when to use this server.
        </p>
      </div>

      {/* Authentication Type */}
      <div className="space-y-2">
        <Label htmlFor="authType" className="text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Authentication
        </Label>
        <Select
          value={config.authType}
          onValueChange={(value) => updateConfig("authType", value as MCPAuthType)}
        >
          <SelectTrigger
            className={`bg-accent border text-foreground focus:border-amber-500 ${
              errors?.authType ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Select authentication type" />
          </SelectTrigger>
          <SelectContent className="bg-accent border">
            <SelectItem value="api_key" className="text-foreground focus:bg-muted">
              <div className="flex items-center gap-2">
                <span>API Key</span>
                <span className="text-xs text-foreground0">- Simple token-based auth</span>
              </div>
            </SelectItem>
            <SelectItem value="oauth2" className="text-foreground focus:bg-muted">
              <div className="flex items-center gap-2">
                <span>OAuth 2.0</span>
                <span className="text-xs text-foreground0">- Delegated authorization</span>
              </div>
            </SelectItem>
            <SelectItem value="none" className="text-foreground focus:bg-muted">
              <div className="flex items-center gap-2">
                <span>None</span>
                <span className="text-xs text-foreground0">- Public access (not recommended)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors?.authType && <p className="text-xs text-red-400">{errors.authType}</p>}
        <p className="text-xs text-foreground0">
          {config.authType === "api_key" &&
            "Clients will need to provide an API key in the Authorization header."}
          {config.authType === "oauth2" &&
            "Clients will authenticate using OAuth 2.0 flow with your configured provider."}
          {config.authType === "none" &&
            "Warning: Anyone with the server URL can invoke tools. Use for testing only."}
        </p>
      </div>

      {/* Rate Limit */}
      <div className="space-y-2">
        <Label htmlFor="rateLimit" className="text-foreground flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          Rate Limit
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="rateLimit"
            type="number"
            min={1}
            max={1000}
            value={config.rateLimitPerMinute}
            onChange={(e) =>
              updateConfig("rateLimitPerMinute", Math.max(1, parseInt(e.target.value) || 60))
            }
            className={`w-32 bg-accent border text-foreground focus:border-amber-500 ${
              errors?.rateLimitPerMinute ? "border-red-500" : ""
            }`}
          />
          <span className="text-sm text-muted-foreground">requests per minute</span>
        </div>
        {errors?.rateLimitPerMinute && (
          <p className="text-xs text-red-400">{errors.rateLimitPerMinute}</p>
        )}
        <p className="text-xs text-foreground0">
          Maximum number of tool invocations allowed per minute per client.
        </p>
      </div>

      {/* Preview URL */}
      <div className="space-y-2">
        <Label className="text-foreground">Server URL Preview</Label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent border border">
          <code className="text-sm text-muted-foreground font-mono">
            https://mcp.agentictrust.com/servers/custom/
            <span className="text-amber-400">
              {config.name
                ? config.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                : "your-server-name"}
            </span>
          </code>
        </div>
        <p className="text-xs text-foreground0">
          This URL will be used by MCP clients to connect to your server.
        </p>
      </div>
    </div>
  );
}

export const defaultServerConfig: ServerConfig = {
  name: "",
  description: "",
  authType: "api_key",
  rateLimitPerMinute: 60,
};

