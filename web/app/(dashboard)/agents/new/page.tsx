"use client";

import { useState, useCallback } from "react";
import {
  AgentBuilderPanel,
  AgentHeader,
  ModelSelector,
  TriggersEditor,
  IntegrationsBar,
  ContentEditor,
  ContextSection,
  AgentDiffView,
} from "@/components/agents";
import { Button } from "@/components/ui/button";
import { LLM_PROVIDERS } from "@/lib/data/models";
import { Play, Check, X } from "@/lib/icons";
import type { GeneratedAgent } from "@/lib/types/agent";
import type {
  TriggersState,
  SelectedModel,
  ContextFile,
  ScheduleTrigger,
} from "@/lib/types/agent-form";

// Default model selection
const DEFAULT_MODEL: SelectedModel = {
  provider: "Anthropic",
  model: LLM_PROVIDERS[0].models[1], // Sonnet 4.5
};

// Default triggers state
const DEFAULT_TRIGGERS: TriggersState = {
  api: true,
  mcp: false,
  webhook: false,
  scheduled: [],
};

// Default content for the editor
const DEFAULT_CONTENT = `<p><strong>Goal</strong></p>
<p>Describe what this agent should accomplish...</p>
<br/>
<p><strong>Instructions</strong></p>
<p>1. When triggered, perform the main task</p>
<p>2. Process the data and extract relevant information</p>
<p>3. Take action based on the results</p>
<br/>
<p><strong>Notes</strong></p>
<p>Add any additional notes here</p>`;

export default function NewAgentPage() {
  // Form state
  const [agentName, setAgentName] = useState("New Agent");
  const [selectedModel, setSelectedModel] = useState<SelectedModel>(DEFAULT_MODEL);
  const [triggers, setTriggers] = useState<TriggersState>(DEFAULT_TRIGGERS);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [contexts, setContexts] = useState<ContextFile[]>([]);
  const [editorContent, setEditorContent] = useState<string>(DEFAULT_CONTENT);

  // UI state
  const [isBuilderOpen, setIsBuilderOpen] = useState(true);

  // Preview/Diff state - when set, shows the diff view instead of the editor
  const [pendingAgent, setPendingAgent] = useState<GeneratedAgent | null>(null);

  // Integration handlers
  const handleAddIntegration = useCallback((name: string) => {
    setConnectedIntegrations((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const handleRemoveIntegration = useCallback((name: string) => {
    setConnectedIntegrations((prev) => prev.filter((i) => i !== name));
  }, []);

  // Context handlers
  const handleAddContexts = useCallback((files: ContextFile[]) => {
    setContexts((prev) => [...prev, ...files]);
  }, []);

  const handleRemoveContext = useCallback((name: string) => {
    setContexts((prev) => prev.filter((c) => c.name !== name));
  }, []);

  // Handle content change from editor
  const handleContentChange = useCallback((content: string) => {
    setEditorContent(content);
  }, []);

  // Handle receiving generated agent from builder panel - shows diff view
  const handleGeneratedAgent = useCallback((agent: GeneratedAgent) => {
    setPendingAgent(agent);
  }, []);

  // Apply the pending agent configuration
  const applyPendingAgent = useCallback(() => {
    if (!pendingAgent) {
      return;
    }

    // Update agent name
    if (pendingAgent.title) {
      setAgentName(pendingAgent.title);
    }

    // Update integrations
    if (pendingAgent.integrations && pendingAgent.integrations.length > 0) {
      setConnectedIntegrations(pendingAgent.integrations);
    }

    // Update triggers
    const newScheduled: ScheduleTrigger[] = [...triggers.scheduled];

    // Add scheduled trigger if provided
    if (pendingAgent.triggers?.scheduled?.enabled) {
      const newScheduledTrigger: ScheduleTrigger = {
        id: `schedule-ai-${Date.now()}`,
        name: pendingAgent.triggers.scheduled.description || "AI Generated Schedule",
        cron: pendingAgent.triggers.scheduled.cron || "0 0 * * *",
        timezone: "utc",
        enabled: true,
      };
      newScheduled.push(newScheduledTrigger);
    }

    setTriggers({
      api: pendingAgent.triggers?.api || false,
      mcp: pendingAgent.triggers?.mcp || false,
      webhook: pendingAgent.triggers?.webhook || false,
      scheduled: newScheduled,
    });

    // Update content editor with formatted content
    const formattedContent = `<p><strong>Goal</strong></p>
<p>${pendingAgent.goal || ""}</p>
<br/>
<p><strong>Instructions</strong></p>
${(pendingAgent.instructions || []).map((inst, idx) => `<p>${idx + 1}. ${inst}</p>`).join("\n")}
${pendingAgent.notes ? `<br/>\n<p><strong>Notes</strong></p>\n<p>${pendingAgent.notes}</p>` : ""}`;

    setEditorContent(formattedContent);

    // Clear the pending agent to exit diff mode
    setPendingAgent(null);
  }, [pendingAgent, triggers.scheduled]);

  // Dismiss the pending agent (cancel the diff)
  const dismissPendingAgent = useCallback(() => {
    setPendingAgent(null);
  }, []);

  const handleRun = useCallback(() => {
    // TODO: Implement agent run logic

    console.warn("Running agent:", {
      name: agentName,
      model: selectedModel,
      triggers,
      integrations: connectedIntegrations,
      contexts,
      content: editorContent,
    });
  }, [agentName, selectedModel, triggers, connectedIntegrations, contexts, editorContent]);

  // Are we in diff/preview mode?
  const isInDiffMode = pendingAgent !== null;

  // Header action buttons - changes based on mode
  const headerActions = isInDiffMode ? (
    <>
      <Button
        variant="outline"
        className="border-border text-muted-foreground"
        onClick={dismissPendingAgent}
      >
        <X className="mr-2 h-4 w-4" />
        Dismiss
      </Button>
      <Button className="bg-green-600 text-white hover:bg-green-500" onClick={applyPendingAgent}>
        <Check className="mr-2 h-4 w-4" />
        Apply Changes
      </Button>
    </>
  ) : (
    <Button className="bg-amber-600 text-white hover:bg-amber-500" onClick={handleRun}>
      <Play className="mr-2 h-4 w-4 fill-current" />
      Run agent
    </Button>
  );

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <AgentHeader
        agentName={isInDiffMode ? pendingAgent?.title || "New Agent" : "New Agent"}
        isBuilderOpen={isBuilderOpen}
        onBuilderToggle={() => setIsBuilderOpen(!isBuilderOpen)}
        backHref="/agents"
        backLabel="Agents"
        actions={headerActions}
      />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Left Panel - Document View or Diff View */}
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-10">
            {isInDiffMode ? (
              /* Diff View */
              <AgentDiffView
                agent={pendingAgent}
                currentName={agentName}
                currentTriggers={triggers}
                currentIntegrations={connectedIntegrations}
              />
            ) : (
              /* Normal Editor View */
              <>
                {/* Agent Title */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent Name"
                    className="text-foreground w-full border-none bg-transparent text-3xl font-bold focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Model Selector */}
                <div className="mb-6 flex items-center gap-4">
                  <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                </div>

                {/* Triggers Section */}
                <TriggersEditor triggers={triggers} onTriggersChange={setTriggers} />

                {/* Connected Integrations Row */}
                <IntegrationsBar
                  integrations={connectedIntegrations}
                  onAdd={handleAddIntegration}
                  onRemove={handleRemoveIntegration}
                />

                {/* Main Content Editor */}
                <ContentEditor
                  content={editorContent}
                  onContentChange={handleContentChange}
                  onIntegrationAdd={handleAddIntegration}
                  connectedIntegrations={connectedIntegrations}
                />

                {/* Context Section */}
                <ContextSection
                  contexts={contexts}
                  onAdd={handleAddContexts}
                  onRemove={handleRemoveContext}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Agent Builder Chat */}
        <AgentBuilderPanel
          isOpen={isBuilderOpen}
          agentName={agentName}
          onApplyAgent={handleGeneratedAgent}
        />
      </div>
    </div>
  );
}
