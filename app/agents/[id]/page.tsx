"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAgents } from "@/lib/data/mock-data";
import { getTriggersByAgentId } from "@/lib/data/triggers-data";
import { formatRelativeTime } from "@/lib/utils";
import { IntegrationIcon } from "@/components/integration-icon";
import { getIntegrationIcon } from "@/lib/integration-icons";
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
} from "lucide-react";
import {
  TriggersList,
  AgentStats,
  AgentActivity,
  AgentBuilderPanel,
} from "@/components/agents";

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                ? "bg-green-950 text-green-400 border-green-800"
                : "bg-accent text-muted-foreground border"
            }
          >
            {agent.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground0" suppressHydrationWarning>
            Last run {formatRelativeTime(agent.lastRun)}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          >
            {isBuilderOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Left Panel - Document View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Agent Title + Run Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model & Schedule Row */}
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border bg-accent text-sm text-foreground hover:border-accent transition-colors">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {agent.model}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Connected Integrations Row */}
            <div className="flex items-center gap-2 flex-wrap mb-8 pb-6 border-b border-border">
              {agent.integrations.map((integration, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1.5 bg-accent border text-foreground flex items-center gap-2"
                >
                  <Image
                    src={getIntegrationIcon(integration.name)}
                    alt={integration.name}
                    width={16}
                    height={16}
                    className="rounded"
                  />
                  {integration.name}
                  <span className="text-xs text-foreground0">({integration.type})</span>
                  {integration.connected ? (
                    <button className="ml-1 hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="ml-1 text-amber-500 flex items-center gap-0.5 text-xs">
                      Connect <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))}
              <button className="text-sm text-foreground0 hover:text-muted-foreground flex items-center gap-1 transition-colors">
                <Plus className="h-4 w-4" />
                Add integration
              </button>
            </div>

            {/* Triggers Section - Now using modular component */}
            <TriggersList 
              agentId={agent.id} 
              agentName={agent.name} 
              triggers={triggers} 
            />

            {/* Goal Section */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-3">Goal</h2>
              <p className="text-muted-foreground leading-relaxed">{agent.goal}</p>
            </div>

            {/* Integrations List */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-3">Integrations</h2>
              <ol className="space-y-2 text-muted-foreground ml-2">
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
                    <span className="text-xs text-foreground0">({integration.type})</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-3">Instructions</h2>
              <ol className="space-y-3 text-muted-foreground">
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
