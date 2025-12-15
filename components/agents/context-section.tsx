"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Plus, X } from "@/lib/icons";
import type { ContextSectionProps, ContextFile } from "@/lib/types/agent-form";

export function ContextSection({ contexts, onAdd, onRemove }: ContextSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newContexts: ContextFile[] = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type.split("/")[1] || "file",
      }));
      onAdd(newContexts);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />
      {contexts.length > 0 && (
        <div className="mb-4">
          <h2 className="text-foreground mb-3 font-semibold">Context</h2>
          <div className="flex flex-wrap gap-2">
            {contexts.map((ctx) => (
              <Badge
                key={ctx.name}
                variant="outline"
                className="bg-accent text-foreground flex items-center gap-2 border px-3 py-1.5"
              >
                <Paperclip className="h-3 w-3" />
                {ctx.name}
                <button
                  onClick={() => onRemove(ctx.name)}
                  className="ml-1 transition-colors hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-foreground0 hover:text-muted-foreground flex items-center gap-1.5 text-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add context
      </button>
    </div>
  );
}
