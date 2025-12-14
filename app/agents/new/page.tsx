"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Sparkles,
  Play,
  ChevronDown,
  X,
  Plus,
  Paperclip,
  Send,
  Check,
  Zap,
  Brain,
  Globe,
  Clock,
  Copy,
  PanelRight,
  PanelRightClose,
  ArrowLeft,
  Code,
  Webhook,
  Calendar,
} from "@/lib/icons";
import { getIntegrationIcon } from "@/lib/integration-icons";

// Available integrations for @ mentions
const availableIntegrations = [
  { id: "notion", name: "Notion", type: "API", description: "Workspace for notes and docs" },
  { id: "linear", name: "Linear", type: "API", description: "Issue tracking" },
  { id: "github", name: "GitHub", type: "API", description: "Code repository" },
  { id: "slack", name: "Slack", type: "API", description: "Team communication" },
  { id: "salesforce", name: "Salesforce", type: "API", description: "CRM platform" },
  { id: "clearbit", name: "Clearbit", type: "API", description: "Data enrichment" },
  { id: "gmail", name: "Gmail", type: "API", description: "Email service" },
  { id: "zendesk", name: "Zendesk", type: "API", description: "Customer support" },
  { id: "zoom", name: "Zoom", type: "API", description: "Video meetings" },
  { id: "quickbooks", name: "QuickBooks", type: "MCP", description: "Accounting" },
];

// LLM Models data
const llmProviders = [
  {
    name: "Anthropic",
    icon: Sparkles,
    color: "text-orange-500",
    models: [
      {
        id: "claude-opus-4.5",
        name: "Claude Opus 4.5",
        description: "Most capable",
        speed: "Medium",
        cost: "$$$",
      },
      {
        id: "claude-sonnet-4.5",
        name: "Claude Sonnet 4.5",
        description: "Best balance",
        speed: "Fast",
        cost: "$$",
      },
    ],
  },
  {
    name: "OpenAI",
    icon: Brain,
    color: "text-green-500",
    models: [
      {
        id: "gpt-5.1",
        name: "GPT-5.1",
        description: "Latest flagship",
        speed: "Fast",
        cost: "$$$",
      },
      {
        id: "gpt-5.1-mini",
        name: "GPT-5.1 Mini",
        description: "Cost-effective",
        speed: "Fast",
        cost: "$$",
      },
    ],
  },
  {
    name: "Google",
    icon: Globe,
    color: "text-blue-500",
    models: [
      {
        id: "gemini-3-pro",
        name: "Gemini 3 Pro",
        description: "Advanced multimodal",
        speed: "Medium",
        cost: "$$$",
      },
      {
        id: "gemini-3-flash",
        name: "Gemini 3 Flash",
        description: "Fast multimodal",
        speed: "Fast",
        cost: "$$",
      },
    ],
  },
  {
    name: "xAI",
    icon: Zap,
    color: "text-red-500",
    models: [
      {
        id: "grok-4.1",
        name: "Grok 4.1",
        description: "Real-time knowledge",
        speed: "Fast",
        cost: "$$$",
      },
    ],
  },
];

const getProviderColor = (providerName: string) => {
  const provider = llmProviders.find((p) => p.name === providerName);
  return provider?.color || "text-purple-500";
};

// Schedule trigger type
interface ScheduleTrigger {
  id: string;
  name: string;
  cron: string;
  timezone: string;
  enabled: boolean;
}

export default function NewAgentPage() {
  const [agentName, setAgentName] = useState("New Agent");
  const [contexts, setContexts] = useState<{ name: string; type: string }[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState({
    provider: "Anthropic",
    model: llmProviders[0].models[1],
  });

  // Integration mentions
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Triggers state
  const [apiEnabled, setApiEnabled] = useState(true);
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [scheduledTriggers, setScheduledTriggers] = useState<ScheduleTrigger[]>([]);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleCron, setNewScheduleCron] = useState("");
  const [newScheduleTimezone, setNewScheduleTimezone] = useState("utc");

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Get filtered integrations
  const filteredIntegrations = availableIntegrations.filter(
    (i) =>
      i.name.toLowerCase().includes(mentionFilter.toLowerCase()) &&
      !connectedIntegrations.includes(i.name)
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectModel = (providerName: string, model: (typeof llmProviders)[0]["models"][0]) => {
    setSelectedModel({ provider: providerName, model });
    setIsModelDropdownOpen(false);
  };

  const removeIntegration = (name: string) => {
    setConnectedIntegrations((prev) => prev.filter((i) => i !== name));
  };

  const addIntegration = useCallback(
    (name: string) => {
      if (!connectedIntegrations.includes(name)) {
        setConnectedIntegrations((prev) => [...prev, name]);
      }
      setShowMentionDropdown(false);
      setMentionFilter("");
      setSelectedMentionIndex(0);

      // Remove the @mention text from the content
      if (contentRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const textNode = range.startContainer;
          if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent || "";
            const cursorPos = range.startOffset;
            const textBefore = text.substring(0, cursorPos);
            const lastAtIndex = textBefore.lastIndexOf("@");
            if (lastAtIndex !== -1) {
              // Replace @mention with just the integration name
              const newText =
                text.substring(0, lastAtIndex) +
                `@${name.toLowerCase()} ` +
                text.substring(cursorPos);
              textNode.textContent = newText;
              // Move cursor after the inserted text
              const newCursorPos = lastAtIndex + name.length + 2;
              range.setStart(textNode, newCursorPos);
              range.setEnd(textNode, newCursorPos);
            }
          }
        }
      }
    },
    [connectedIntegrations]
  );

  // Handle input in contentEditable
  const handleInput = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowMentionDropdown(false);
      return;
    }

    const text = textNode.textContent || "";
    const cursorPos = range.startOffset;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if we're still typing the mention (no space after @)
      if (/^[a-zA-Z0-9]*$/.test(textAfterAt)) {
        setMentionFilter(textAfterAt);
        setSelectedMentionIndex(0);

        // Get cursor position for dropdown
        const rect = range.getBoundingClientRect();
        const containerRect = contentRef.current?.getBoundingClientRect();

        if (containerRect) {
          setMentionPosition({
            top: rect.top - containerRect.top - 10, // Position above cursor
            left: rect.left - containerRect.left,
          });
        }
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  }, []);

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showMentionDropdown || filteredIntegrations.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedMentionIndex((prev) =>
            prev < filteredIntegrations.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredIntegrations[selectedMentionIndex]) {
            addIntegration(filteredIntegrations[selectedMentionIndex].name);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowMentionDropdown(false);
          break;
        case "Tab":
          e.preventDefault();
          if (filteredIntegrations[selectedMentionIndex]) {
            addIntegration(filteredIntegrations[selectedMentionIndex].name);
          }
          break;
      }
    },
    [showMentionDropdown, filteredIntegrations, selectedMentionIndex, addIntegration]
  );

  // Handle file upload for context
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newContexts = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type.split("/")[1] || "file",
      }));
      setContexts((prev) => [...prev, ...newContexts]);
    }
  };

  const removeContext = (name: string) => {
    setContexts((prev) => prev.filter((c) => c.name !== name));
  };

  const addScheduledTrigger = () => {
    if (!newScheduleName || !newScheduleCron) {
      return;
    }
    const newTrigger: ScheduleTrigger = {
      id: `schedule-${Date.now()}`,
      name: newScheduleName,
      cron: newScheduleCron,
      timezone: newScheduleTimezone,
      enabled: true,
    };
    setScheduledTriggers((prev) => [...prev, newTrigger]);
    setNewScheduleName("");
    setNewScheduleCron("");
    setNewScheduleTimezone("utc");
    setIsAddScheduleOpen(false);
  };

  const removeScheduledTrigger = (id: string) => {
    setScheduledTriggers((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleScheduledTrigger = (id: string) => {
    setScheduledTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const selectedProvider = llmProviders.find((p) => p.name === selectedModel.provider);
  const ProviderIcon = selectedProvider?.icon || Sparkles;

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
            <span className="text-foreground font-medium">New Agent</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent Name"
                className="text-foreground w-full border-none bg-transparent text-3xl font-bold focus:ring-0 focus:outline-none"
              />
              <Button className="ml-4 shrink-0 bg-amber-600 text-white hover:bg-amber-500">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model Row */}
            <div className="mb-6 flex items-center gap-4">
              {/* Model Selector Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="bg-accent text-foreground hover:border-accent flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                >
                  <ProviderIcon className={`h-4 w-4 ${getProviderColor(selectedModel.provider)}`} />
                  {selectedModel.model.name}
                  <ChevronDown
                    className={`text-muted-foreground h-4 w-4 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isModelDropdownOpen && (
                  <div className="bg-card absolute top-full left-0 z-50 mt-2 max-h-[400px] w-72 overflow-y-auto rounded-lg border shadow-xl">
                    {llmProviders.map((provider) => (
                      <div key={provider.name}>
                        <div className="bg-accent border-border sticky top-0 flex items-center gap-2 border-b px-3 py-2">
                          <provider.icon className={`h-4 w-4 ${provider.color}`} />
                          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            {provider.name}
                          </span>
                        </div>
                        {provider.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => selectModel(provider.name, model)}
                            className="hover:bg-accent flex w-full items-center justify-between px-3 py-2 text-left transition-colors"
                          >
                            <div>
                              <span className="text-foreground text-sm font-medium">
                                {model.name}
                              </span>
                              <p className="text-muted-foreground text-xs">{model.description}</p>
                            </div>
                            {selectedModel.model.id === model.id && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Triggers Section */}
            <div className="border-border mb-6 border-b pb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-foreground font-semibold">Triggers</h2>
                <button
                  onClick={() => setIsAddScheduleOpen(true)}
                  className="flex items-center gap-1 text-sm text-amber-500 transition-colors hover:text-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  Add schedule
                </button>
              </div>

              <div className="space-y-2">
                {/* Manual API Trigger */}
                <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-950">
                      <Code className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Manual API</p>
                      <p className="text-foreground0 text-xs">Invoke via REST API</p>
                    </div>
                  </div>
                  <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
                </div>

                {/* MCP Server Trigger */}
                <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950">
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">MCP Server</p>
                      <p className="text-foreground0 text-xs">Expose as MCP tool</p>
                    </div>
                  </div>
                  <Switch checked={mcpEnabled} onCheckedChange={setMcpEnabled} />
                </div>

                {/* Webhook Trigger */}
                <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950">
                      <Webhook className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Webhook</p>
                      <p className="text-foreground0 text-xs">Trigger via HTTP webhook</p>
                    </div>
                  </div>
                  <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
                </div>

                {/* Scheduled Triggers */}
                {scheduledTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="bg-card/50 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">{trigger.name}</p>
                        <p className="text-foreground0 font-mono text-xs">{trigger.cron}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={trigger.enabled}
                        onCheckedChange={() => toggleScheduledTrigger(trigger.id)}
                      />
                      <button
                        onClick={() => removeScheduledTrigger(trigger.id)}
                        className="text-foreground0 p-1 transition-colors hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Schedule Dialog */}
            <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
              <DialogContent className="bg-card border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Scheduled Trigger</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Configure a cron-based schedule for this agent.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Name</Label>
                    <Input
                      value={newScheduleName}
                      onChange={(e) => setNewScheduleName(e.target.value)}
                      placeholder="e.g., Daily Report Generation"
                      className="bg-accent text-foreground placeholder:text-foreground0 border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Schedule (Cron Expression)</Label>
                    <Input
                      value={newScheduleCron}
                      onChange={(e) => setNewScheduleCron(e.target.value)}
                      placeholder="0 8 * * 1"
                      className="bg-accent text-foreground placeholder:text-foreground0 border font-mono"
                    />
                    <p className="text-foreground0 text-xs">
                      Example: &quot;0 8 * * 1&quot; = Every Monday at 8 AM
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Timezone</Label>
                    <Select value={newScheduleTimezone} onValueChange={setNewScheduleTimezone}>
                      <SelectTrigger className="bg-accent text-foreground border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="utc" className="text-foreground focus:bg-muted">
                          UTC
                        </SelectItem>
                        <SelectItem
                          value="america_new_york"
                          className="text-foreground focus:bg-muted"
                        >
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem
                          value="america_los_angeles"
                          className="text-foreground focus:bg-muted"
                        >
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem
                          value="europe_london"
                          className="text-foreground focus:bg-muted"
                        >
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="asia_tokyo" className="text-foreground focus:bg-muted">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border border-blue-800/50 bg-blue-950/30 p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                      <div>
                        <p className="text-xs font-medium text-blue-200">Next Run Preview</p>
                        <p className="mt-0.5 text-xs text-blue-300/70">
                          Will be calculated after creation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddScheduleOpen(false)}
                    className="text-muted-foreground border"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-amber-600 text-white hover:bg-amber-500"
                    onClick={addScheduledTrigger}
                    disabled={!newScheduleName || !newScheduleCron}
                  >
                    Add Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Connected Integrations Row */}
            <div className="border-border mb-6 flex flex-wrap items-center gap-2 border-b pb-6">
              {connectedIntegrations.map((name) => (
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
                  <button
                    onClick={() => removeIntegration(name)}
                    className="ml-1 transition-colors hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {connectedIntegrations.length === 0 && (
                <span className="text-foreground0 text-sm">Type @ to add integrations</span>
              )}
            </div>

            {/* Main Content */}
            <div className="relative mb-8">
              <div
                ref={contentRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="text-muted-foreground min-h-[400px] w-full text-sm leading-relaxed focus:outline-none"
                suppressContentEditableWarning
              >
                <p>
                  <strong>Goal</strong>
                </p>
                <p>Describe what this agent should accomplish...</p>
                <br />
                <p>
                  <strong>Instructions</strong>
                </p>
                <p>1. When triggered, perform the main task</p>
                <p>2. Process the data and extract relevant information</p>
                <p>3. Take action based on the results</p>
                <br />
                <p>
                  <strong>Notes</strong>
                </p>
                <p>Add any additional notes here</p>
              </div>

              {/* @ Mention Dropdown - Positioned above cursor */}
              {showMentionDropdown && filteredIntegrations.length > 0 && (
                <div
                  ref={mentionDropdownRef}
                  className="bg-card absolute z-50 max-h-64 w-72 overflow-y-auto rounded-lg border shadow-xl"
                  style={{
                    bottom: `calc(100% - ${mentionPosition.top}px + 20px)`,
                    left: mentionPosition.left,
                  }}
                >
                  <div className="p-2">
                    <div className="text-foreground0 mb-1 px-2 py-1 text-xs font-semibold">
                      Select Integration
                    </div>
                    {filteredIntegrations.map((integration, index) => (
                      <button
                        key={integration.id}
                        onClick={() => addIntegration(integration.name)}
                        className={`flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors ${
                          index === selectedMentionIndex ? "bg-muted" : "hover:bg-accent"
                        }`}
                      >
                        <Image
                          src={getIntegrationIcon(integration.id)}
                          alt={integration.name}
                          width={20}
                          height={20}
                          className="rounded"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm font-medium">
                              @{integration.name.toLowerCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-accent text-muted-foreground border text-xs"
                            >
                              {integration.type}
                            </Badge>
                          </div>
                          <p className="text-foreground0 truncate text-xs">
                            {integration.description}
                          </p>
                        </div>
                        {index === selectedMentionIndex && (
                          <span className="text-foreground0 text-xs">Enter</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Context Section */}
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
                          onClick={() => removeContext(ctx.name)}
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
          </div>
        </div>

        {/* Right Panel - Agent Builder Chat */}
        <div
          className={`border-border bg-card flex flex-col border-l transition-all duration-300 ease-in-out ${
            isBuilderOpen ? "w-[340px]" : "w-0"
          } overflow-hidden`}
        >
          <div className="flex h-full w-[340px] flex-col">
            <div className="border-border shrink-0 border-b p-5">
              <h2 className="text-foreground font-semibold">Agent builder</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                I&apos;ll help you create {agentName || "your agent"}
              </p>
            </div>

            <div className="border-border space-y-2 border-b p-4">
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:bg-accent w-full justify-start border"
              >
                Suggest integrations
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:bg-accent w-full justify-start border"
              >
                Generate instructions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:bg-accent w-full justify-start border"
              >
                Add error handling
              </Button>
            </div>

            <div className="bg-background flex-1 overflow-y-auto p-4">
              <div className="bg-card rounded-lg border p-3">
                <p className="text-muted-foreground text-sm">
                  I can help you build this agent. Try:
                </p>
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                  <li>- &quot;Create an agent that monitors competitors&quot;</li>
                  <li>- &quot;Add Slack notifications&quot;</li>
                  <li>- &quot;What integrations should I use?&quot;</li>
                </ul>
              </div>
            </div>

            <div className="bg-card shrink-0 p-4">
              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Describe what you want to build..."
                  rows={2}
                  className="bg-accent text-foreground placeholder:text-foreground0 w-full resize-none rounded-xl border px-4 py-3 pr-20 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-1">
                  <button className="text-muted-foreground hover:text-muted-foreground rounded-lg p-1.5 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:text-amber-500"
                    onClick={() => setChatMessage("")}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
