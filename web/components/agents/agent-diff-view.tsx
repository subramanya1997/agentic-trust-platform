"use client";

import Image from "next/image";
import { IntegrationIcon } from "@/components/integration-icon";
import { Badge } from "@/components/ui/badge";
import { getIntegrationIcon } from "@/lib/data/integrations";
import { Plus, Minus, Code, Zap, Webhook, Calendar, Sparkles } from "@/lib/icons";
import type { GeneratedAgent } from "@/lib/types/agent";
import type { TriggersState } from "@/lib/types/agent-form";

interface AgentDiffViewProps {
  agent: GeneratedAgent;
  currentName: string;
  currentTriggers: TriggersState;
  currentIntegrations: string[];
}

// Diff line component
function DiffLine({
  type,
  children,
}: {
  type: "add" | "remove" | "context";
  children: React.ReactNode;
}) {
  const styles = {
    add: "bg-green-500/10 border-l-2 border-green-500 text-green-400",
    remove: "bg-red-500/10 border-l-2 border-red-500 text-red-400 line-through opacity-60",
    context: "text-muted-foreground",
  };

  const prefix = {
    add: <Plus className="mr-2 h-3 w-3 shrink-0" />,
    remove: <Minus className="mr-2 h-3 w-3 shrink-0" />,
    context: <span className="w-5 shrink-0" />,
  };

  return (
    <div className={`flex items-start px-3 py-1.5 font-mono text-sm ${styles[type]}`}>
      {prefix[type]}
      <span className="flex-1">{children}</span>
    </div>
  );
}

// Trigger diff item
function TriggerDiffItem({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  diffType,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  diffType: "add" | "remove" | "unchanged";
}) {
  const borderStyle =
    diffType === "add"
      ? "border-green-500/50 bg-green-500/5"
      : diffType === "remove"
        ? "border-red-500/50 bg-red-500/5 opacity-60"
        : "border-border bg-card/50";

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${borderStyle}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-foreground text-sm font-medium">{label}</p>
            {diffType === "add" && (
              <Badge className="border-0 bg-green-500/20 text-xs text-green-400">
                <Plus className="mr-1 h-2.5 w-2.5" />
                new
              </Badge>
            )}
            {diffType === "remove" && (
              <Badge className="border-0 bg-red-500/20 text-xs text-red-400">
                <Minus className="mr-1 h-2.5 w-2.5" />
                removed
              </Badge>
            )}
          </div>
          {sublabel && <p className="text-muted-foreground font-mono text-xs">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

export function AgentDiffView({
  agent,
  currentName,
  currentTriggers,
  currentIntegrations,
}: AgentDiffViewProps) {
  // Calculate diffs
  const nameChanged = agent.title !== currentName;

  // Trigger diffs
  const triggerDiffs = {
    api: {
      current: currentTriggers.api,
      proposed: agent.triggers?.api || false,
    },
    mcp: {
      current: currentTriggers.mcp,
      proposed: agent.triggers?.mcp || false,
    },
    webhook: {
      current: currentTriggers.webhook,
      proposed: agent.triggers?.webhook || false,
    },
  };

  // Integration diffs
  const addedIntegrations = (agent.integrations || []).filter(
    (i) => !currentIntegrations.includes(i)
  );
  const removedIntegrations = currentIntegrations.filter(
    (i) => !(agent.integrations || []).includes(i)
  );
  const unchangedIntegrations = currentIntegrations.filter((i) =>
    (agent.integrations || []).includes(i)
  );

  // New scheduled trigger
  const newSchedule = agent.triggers?.scheduled?.enabled ? agent.triggers.scheduled : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-500">AI Generated Configuration</span>
        <span className="text-muted-foreground text-sm">
          — Review changes below and click Apply to accept
        </span>
      </div>

      {/* Title Diff */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-accent/50 border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Agent Name
          </span>
        </div>
        <div className="bg-card">
          {nameChanged ? (
            <>
              <DiffLine type="remove">{currentName}</DiffLine>
              <DiffLine type="add">{agent.title}</DiffLine>
            </>
          ) : (
            <DiffLine type="context">{agent.title}</DiffLine>
          )}
        </div>
      </div>

      {/* Goal */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-accent/50 border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Goal
          </span>
        </div>
        <div className="bg-card">
          <DiffLine type="add">{agent.goal}</DiffLine>
        </div>
      </div>

      {/* Integrations Diff */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-accent/50 border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Integrations
          </span>
          {(addedIntegrations.length > 0 || removedIntegrations.length > 0) && (
            <span className="text-muted-foreground ml-2 text-xs">
              (+{addedIntegrations.length} / -{removedIntegrations.length})
            </span>
          )}
        </div>
        <div className="bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {/* Unchanged integrations */}
            {unchangedIntegrations.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="bg-accent text-foreground flex items-center gap-2 border px-3 py-1.5"
              >
                <Image
                  src={getIntegrationIcon(name.toLowerCase())}
                  alt={name}
                  width={14}
                  height={14}
                  className="rounded"
                />
                {name}
              </Badge>
            ))}

            {/* Removed integrations */}
            {removedIntegrations.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="flex items-center gap-2 border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-400 line-through opacity-60"
              >
                <Minus className="h-3 w-3" />
                <Image
                  src={getIntegrationIcon(name.toLowerCase())}
                  alt={name}
                  width={14}
                  height={14}
                  className="rounded"
                />
                {name}
              </Badge>
            ))}

            {/* Added integrations */}
            {addedIntegrations.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="flex items-center gap-2 border-green-500/30 bg-green-500/10 px-3 py-1.5 text-green-400"
              >
                <Plus className="h-3 w-3" />
                <IntegrationIcon
                  integrationId={name.toLowerCase()}
                  alt={name}
                  width={14}
                  height={14}
                  className="rounded"
                />
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Triggers Diff */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-accent/50 border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Triggers
          </span>
        </div>
        <div className="bg-card space-y-2 p-4">
          {/* API Trigger */}
          <TriggerDiffItem
            icon={Code}
            iconColor="text-green-400"
            iconBg="bg-green-950"
            label="Manual API"
            sublabel="Invoke via REST API"
            diffType={
              triggerDiffs.api.proposed && !triggerDiffs.api.current
                ? "add"
                : !triggerDiffs.api.proposed && triggerDiffs.api.current
                  ? "remove"
                  : "unchanged"
            }
          />

          {/* MCP Trigger */}
          {(triggerDiffs.mcp.proposed || triggerDiffs.mcp.current) && (
            <TriggerDiffItem
              icon={Zap}
              iconColor="text-amber-400"
              iconBg="bg-amber-950"
              label="MCP Server"
              sublabel="Expose as MCP tool"
              diffType={
                triggerDiffs.mcp.proposed && !triggerDiffs.mcp.current
                  ? "add"
                  : !triggerDiffs.mcp.proposed && triggerDiffs.mcp.current
                    ? "remove"
                    : "unchanged"
              }
            />
          )}

          {/* Webhook Trigger */}
          {(triggerDiffs.webhook.proposed || triggerDiffs.webhook.current) && (
            <TriggerDiffItem
              icon={Webhook}
              iconColor="text-purple-400"
              iconBg="bg-purple-950"
              label="Webhook"
              sublabel="Trigger via HTTP webhook"
              diffType={
                triggerDiffs.webhook.proposed && !triggerDiffs.webhook.current
                  ? "add"
                  : !triggerDiffs.webhook.proposed && triggerDiffs.webhook.current
                    ? "remove"
                    : "unchanged"
              }
            />
          )}

          {/* New Scheduled Trigger */}
          {newSchedule && (
            <TriggerDiffItem
              icon={Calendar}
              iconColor="text-blue-400"
              iconBg="bg-blue-950"
              label={newSchedule.description || "Scheduled"}
              sublabel={newSchedule.cron}
              diffType="add"
            />
          )}

          {/* Existing scheduled triggers */}
          {currentTriggers.scheduled.map((trigger) => (
            <TriggerDiffItem
              key={trigger.id}
              icon={Calendar}
              iconColor="text-blue-400"
              iconBg="bg-blue-950"
              label={trigger.name}
              sublabel={trigger.cron}
              diffType="unchanged"
            />
          ))}
        </div>
      </div>

      {/* Instructions Diff */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-accent/50 border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Instructions
          </span>
          <span className="text-muted-foreground ml-2 text-xs">
            ({agent.instructions?.length || 0} steps)
          </span>
        </div>
        <div className="bg-card">
          {agent.instructions?.map((instruction, index) => (
            <DiffLine key={index} type="add">
              {index + 1}. {instruction}
            </DiffLine>
          ))}
        </div>
      </div>

      {/* Notes */}
      {agent.notes && (
        <div className="overflow-hidden rounded-lg border">
          <div className="bg-accent/50 border-b px-4 py-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Notes
            </span>
          </div>
          <div className="bg-card">
            <DiffLine type="add">{agent.notes}</DiffLine>
          </div>
        </div>
      )}
    </div>
  );
}
