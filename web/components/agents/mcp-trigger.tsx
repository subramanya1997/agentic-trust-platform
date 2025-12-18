"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Copy, Check, ExternalLink } from "@/lib/icons";

interface MCPTriggerProps {
  agentId: string;
  agentName: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function MCPTrigger({ agentId, agentName, enabled, onEnabledChange }: MCPTriggerProps) {
  const [copied, setCopied] = useState(false);
  const serverUrl = `https://mcp.agentictrust.com/servers/${agentId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
        enabled ? "bg-card border" : "bg-card/50 border/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            enabled ? "bg-orange-950" : "bg-accent"
          }`}
        >
          <Image
            src="/icons/mcp.svg"
            alt="MCP"
            width={16}
            height={16}
            style={{
              filter: enabled
                ? "invert(67%) sepia(74%) saturate(1200%) hue-rotate(346deg) brightness(101%) contrast(101%)"
                : "invert(50%)",
            }}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${enabled ? "text-foreground" : "text-foreground0"}`}
            >
              MCP Server
            </span>
            {enabled && (
              <Badge
                variant="outline"
                className="border-green-500 bg-green-500/10 text-xs text-green-600 dark:text-green-400"
              >
                Active
              </Badge>
            )}
          </div>
          <p
            className={`mt-0.5 font-mono text-xs ${enabled ? "text-foreground0" : "text-stone-600"}`}
          >
            {enabled ? serverUrl : "Expose agent as MCP-compatible tool"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {enabled && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              onClick={copyUrl}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Image
                      src="/icons/mcp.svg"
                      alt="MCP"
                      width={20}
                      height={20}
                      style={{
                        filter:
                          "invert(67%) sepia(74%) saturate(1200%) hue-rotate(346deg) brightness(101%) contrast(101%)",
                      }}
                    />
                    MCP Server Configuration
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Configure how this agent is exposed as an MCP tool.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Server URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={serverUrl}
                        readOnly
                        className="bg-accent text-muted-foreground border font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 border"
                        onClick={copyUrl}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Tool Name</Label>
                    <Input
                      defaultValue={agentName.toLowerCase().replace(/\s+/g, "_")}
                      className="bg-accent text-foreground border font-mono text-sm"
                    />
                    <p className="text-foreground0 text-xs">
                      The identifier used when calling this agent as a tool
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Rate Limit</Label>
                    <Select defaultValue="60">
                      <SelectTrigger className="bg-accent text-foreground border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="10" className="text-foreground focus:bg-muted">
                          10 requests/min
                        </SelectItem>
                        <SelectItem value="30" className="text-foreground focus:bg-muted">
                          30 requests/min
                        </SelectItem>
                        <SelectItem value="60" className="text-foreground focus:bg-muted">
                          60 requests/min
                        </SelectItem>
                        <SelectItem value="120" className="text-foreground focus:bg-muted">
                          120 requests/min
                        </SelectItem>
                        <SelectItem value="unlimited" className="text-foreground focus:bg-muted">
                          Unlimited
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-3">
                    <div className="text-foreground0 flex items-center justify-between text-xs">
                      <span>12 calls today • 3 unique clients</span>
                      <Link
                        href="/mcp-registry"
                        className="flex items-center gap-1 text-amber-500 hover:text-amber-400"
                      >
                        View in Registry
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-amber-600 text-white hover:bg-amber-500">
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  );
}
