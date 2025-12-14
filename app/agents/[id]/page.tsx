"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use } from "react";
import { TriggersList, AgentStats, AgentActivity, AgentBuilderPanel } from "@/components/agents";
import { IntegrationIcon } from "@/components/integration-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAgents } from "@/lib/data/mock-data";
import { getTriggersByAgentId } from "@/lib/data/triggers-data";
import {
  ArrowLeft,
  Play,
  Copy,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
  Plus,
  PanelRight,
  PanelRightClose,
} from "@/lib/icons";
import { getIntegrationIcon } from "@/lib/integration-icons";
import { formatRelativeTime } from "@/lib/utils";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = use(params);
  const [isBuilderOpen, setIsBuilderOpen] = useState(true);

  const triggers = getTriggersByAgentId(id);
  const agent = mockAgents.find((a) => a.id === id);

  if (!agent) {
    notFound();
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Agents
          </Link>
          <span className="text-stone-600">/</span>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-foreground font-medium">{agent.name}</span>
          </div>
          <Badge
            variant="outline"
            className={
              agent.status === "active"
                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-accent text-muted-foreground border"
            }
          >
            {agent.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground0 text-xs" suppressHydrationWarning>
            Last run {formatRelativeTime(agent.lastRun)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          >
            {isBuilderOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Left Panel - Document View */}
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-10">
            {/* Agent Title + Run Button */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-foreground text-3xl font-bold">{agent.name}</h1>
              <Button className="bg-amber-600 text-white hover:bg-amber-500">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model & Schedule Row */}
            <div className="mb-6 flex items-center gap-4">
              <button className="bg-accent text-foreground hover:border-accent flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {agent.model}
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </button>
            </div>

            {/* Connected Integrations Row */}
            <div className="border-border mb-8 flex flex-wrap items-center gap-2 border-b pb-6">
              {agent.integrations.map((integration, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-accent text-foreground flex items-center gap-2 border px-3 py-1.5"
                >
                  <Image
                    src={getIntegrationIcon(integration.name)}
                    alt={integration.name}
                    width={16}
                    height={16}
                    className="rounded"
                  />
                  {integration.name}
                  <span className="text-foreground0 text-xs">({integration.type})</span>
                  {integration.connected ? (
                    <button className="ml-1 transition-colors hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="ml-1 flex items-center gap-0.5 text-xs text-amber-500">
                      Connect <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))}
              <button className="text-foreground0 hover:text-muted-foreground flex items-center gap-1 text-sm transition-colors">
                <Plus className="h-4 w-4" />
                Add integration
              </button>
            </div>

            {/* Triggers Section - Now using modular component */}
            <TriggersList agentId={agent.id} agentName={agent.name} triggers={triggers} />

            {/* Goal Section */}
            <div className="mb-8">
              <h2 className="text-foreground mb-3 font-semibold">Goal</h2>
              <p className="text-muted-foreground leading-relaxed">{agent.goal}</p>
            </div>

            {/* Integrations List */}
            <div className="mb-8">
              <h2 className="text-foreground mb-3 font-semibold">Integrations</h2>
              <ol className="text-muted-foreground ml-2 space-y-2">
                {agent.integrations.map((integration, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-foreground0 w-4">{index + 1}.</span>
                    <IntegrationIcon
                      integrationId={integration.name}
                      alt={integration.name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                    <span className="font-medium">{integration.name}</span>
                    <span className="text-foreground0 text-xs">({integration.type})</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="text-foreground mb-3 font-semibold">Instructions</h2>
              <ol className="text-muted-foreground space-y-3">
                {agent.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-foreground0 shrink-0">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Stats Cards - Now using modular component */}
            <AgentStats agent={agent} />

            {/* Activity Timeline - Now using modular component */}
            <AgentActivity agent={agent} />
          </div>
        </div>

        {/* Right Panel - Agent Builder Chat (Collapsible) - Now using modular component */}
        <AgentBuilderPanel agentName={agent.name} isOpen={isBuilderOpen} />
      </div>
    </div>
  );
}
