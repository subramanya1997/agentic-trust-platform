"use client";

import { useState } from "react";
import { Copy, Check } from "@/lib/icons";
import type { CustomMCPServer } from "@/lib/types";

interface ServerHeaderProps {
  server: CustomMCPServer;
}

export function ServerHeader({ server }: ServerHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(server.serverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-foreground mb-1 text-2xl font-semibold">{server.name}</h1>
      <p className="text-muted-foreground mb-3 text-sm">{server.description}</p>

      <div className="mb-1 flex items-center gap-2">
        <code className="text-muted-foreground bg-accent rounded px-2.5 py-1 font-mono text-xs">
          {server.serverUrl}
        </code>
        <button
          onClick={copyUrl}
          className="text-foreground0 hover:text-muted-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="text-foreground0 text-xs">
        Created by {server.createdBy} on{" "}
        {new Date(server.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
