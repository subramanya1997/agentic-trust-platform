"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { parseCronExpression } from "@/lib/data/triggers-data";
import { Calendar } from "@/lib/icons";
import type { AgentTrigger, ScheduledTriggerConfig } from "@/lib/types";

interface ScheduledTriggerProps {
  trigger: AgentTrigger;
  onEnabledChange?: (enabled: boolean) => void;
}

export function ScheduledTrigger({ trigger, onEnabledChange }: ScheduledTriggerProps) {
  const config = trigger.config as ScheduledTriggerConfig;
  const description = parseCronExpression(config.cronExpression);

  return (
    <div className="bg-card flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950">
          <Calendar className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-medium">{trigger.name}</span>
            <Badge
              variant="outline"
              className={
                trigger.enabled
                  ? "border-green-500 bg-green-500/10 text-xs text-green-600 dark:text-green-400"
                  : "text-xs"
              }
            >
              {trigger.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-foreground0 mt-0.5 font-mono text-xs">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-foreground0 text-xs">
          {trigger.triggerCount.toLocaleString()} runs
        </span>
        <Switch checked={trigger.enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  );
}
