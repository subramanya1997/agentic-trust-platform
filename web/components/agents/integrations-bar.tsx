"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getIntegrationIcon } from "@/lib/data/integrations";
import { X } from "@/lib/icons";
import type { IntegrationsBarProps } from "@/lib/types/agent-form";

export function IntegrationsBar({
  integrations,
  onRemove,
  showPlaceholder = true,
}: IntegrationsBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {integrations.map((name) => (
        <Badge
          key={name}
          variant="outline"
          className="bg-accent text-foreground flex items-center gap-2 rounded-md border px-3 py-1.5"
        >
          <Image
            src={getIntegrationIcon(name.toLowerCase())}
            alt={name}
            width={14}
            height={14}
            className="rounded"
          />
          {name}
          <button
            onClick={() => onRemove(name)}
            className="ml-1 transition-colors hover:text-red-400"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {integrations.length === 0 && showPlaceholder && (
        <span className="text-foreground0 text-sm">Type @ to add integrations</span>
      )}
    </div>
  );
}
