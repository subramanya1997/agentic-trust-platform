"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIntegrationIcon } from "@/lib/integration-icons";
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
} from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      { id: "claude-opus-4.5", name: "Claude Opus 4.5", description: "Most capable", speed: "Medium", cost: "$$$" },
      { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", description: "Best balance", speed: "Fast", cost: "$$" },
    ],
  },
  {
    name: "OpenAI",
    icon: Brain,
    color: "text-green-500",
    models: [
      { id: "gpt-5.1", name: "GPT-5.1", description: "Latest flagship", speed: "Fast", cost: "$$$" },
      { id: "gpt-5.1-mini", name: "GPT-5.1 Mini", description: "Cost-effective", speed: "Fast", cost: "$$" },
    ],
  },
  {
    name: "Google",
    icon: Globe,
    color: "text-blue-500",
    models: [
      { id: "gemini-3-pro", name: "Gemini 3 Pro", description: "Advanced multimodal", speed: "Medium", cost: "$$$" },
      { id: "gemini-3-flash", name: "Gemini 3 Flash", description: "Fast multimodal", speed: "Fast", cost: "$$" },
    ],
  },
  {
    name: "xAI",
    icon: Zap,
    color: "text-red-500",
    models: [
      { id: "grok-4.1", name: "Grok 4.1", description: "Real-time knowledge", speed: "Fast", cost: "$$$" },
    ],
  },
];

const getProviderColor = (providerName: string) => {
  const provider = llmProviders.find(p => p.name === providerName);
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
    model: llmProviders[0].models[1]
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
    i => i.name.toLowerCase().includes(mentionFilter.toLowerCase()) && !connectedIntegrations.includes(i.name)
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectModel = (providerName: string, model: typeof llmProviders[0]["models"][0]) => {
    setSelectedModel({ provider: providerName, model });
    setIsModelDropdownOpen(false);
  };

  const removeIntegration = (name: string) => {
    setConnectedIntegrations(prev => prev.filter(i => i !== name));
  };

  const addIntegration = useCallback((name: string) => {
    if (!connectedIntegrations.includes(name)) {
      setConnectedIntegrations(prev => [...prev, name]);
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
            const newText = text.substring(0, lastAtIndex) + `@${name.toLowerCase()} ` + text.substring(cursorPos);
            textNode.textContent = newText;
            // Move cursor after the inserted text
            const newCursorPos = lastAtIndex + name.length + 2;
            range.setStart(textNode, newCursorPos);
            range.setEnd(textNode, newCursorPos);
          }
        }
      }
    }
  }, [connectedIntegrations]);

  // Handle input in contentEditable
  const handleInput = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

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
            left: rect.left - containerRect.left
          });
        }
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  }, []);

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showMentionDropdown || filteredIntegrations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredIntegrations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
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
  }, [showMentionDropdown, filteredIntegrations, selectedMentionIndex, addIntegration]);

  // Handle file upload for context
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newContexts = Array.from(files).map(file => ({
        name: file.name,
        type: file.type.split('/')[1] || 'file'
      }));
      setContexts(prev => [...prev, ...newContexts]);
    }
  };

  const removeContext = (name: string) => {
    setContexts(prev => prev.filter(c => c.name !== name));
  };

  const addScheduledTrigger = () => {
    if (!newScheduleName || !newScheduleCron) return;
    const newTrigger: ScheduleTrigger = {
      id: `schedule-${Date.now()}`,
      name: newScheduleName,
      cron: newScheduleCron,
      timezone: newScheduleTimezone,
      enabled: true,
    };
    setScheduledTriggers(prev => [...prev, newTrigger]);
    setNewScheduleName("");
    setNewScheduleCron("");
    setNewScheduleTimezone("utc");
    setIsAddScheduleOpen(false);
  };

  const removeScheduledTrigger = (id: string) => {
    setScheduledTriggers(prev => prev.filter(t => t.id !== id));
  };

  const toggleScheduledTrigger = (id: string) => {
    setScheduledTriggers(prev => 
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
  };

  const selectedProvider = llmProviders.find(p => p.name === selectedModel.provider);
  const ProviderIcon = selectedProvider?.icon || Sparkles;

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
            <span className="text-foreground font-medium">New Agent</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent Name"
                className="text-3xl font-bold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-full"
              />
              <Button className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 ml-4">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model Row */}
            <div className="flex items-center gap-4 mb-6">
              {/* Model Selector Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button 
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border bg-accent text-sm text-foreground hover:border-accent transition-colors"
                >
                  <ProviderIcon className={`h-4 w-4 ${getProviderColor(selectedModel.provider)}`} />
                  {selectedModel.model.name}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 max-h-[400px] overflow-y-auto rounded-lg border border bg-card shadow-xl z-50">
                    {llmProviders.map((provider) => (
                      <div key={provider.name}>
                        <div className="sticky top-0 px-3 py-2 bg-accent border-b border-border flex items-center gap-2">
                          <provider.icon className={`h-4 w-4 ${provider.color}`} />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {provider.name}
                          </span>
                        </div>
                        {provider.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => selectModel(provider.name, model)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-accent transition-colors text-left"
                          >
                            <div>
                              <span className="text-sm font-medium text-foreground">{model.name}</span>
                              <p className="text-xs text-muted-foreground">{model.description}</p>
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
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Triggers</h2>
                <button 
                  onClick={() => setIsAddScheduleOpen(true)}
                  className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add schedule
                </button>
              </div>

              <div className="space-y-2">
                {/* Manual API Trigger */}
                <div className="flex items-center justify-between p-3 rounded-lg border border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-950 flex items-center justify-center">
                      <Code className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Manual API</p>
                      <p className="text-xs text-foreground0">Invoke via REST API</p>
                    </div>
                  </div>
                  <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
                </div>

                {/* MCP Server Trigger */}
                <div className="flex items-center justify-between p-3 rounded-lg border border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-950 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">MCP Server</p>
                      <p className="text-xs text-foreground0">Expose as MCP tool</p>
                    </div>
                  </div>
                  <Switch checked={mcpEnabled} onCheckedChange={setMcpEnabled} />
                </div>

                {/* Webhook Trigger */}
                <div className="flex items-center justify-between p-3 rounded-lg border border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-950 flex items-center justify-center">
                      <Webhook className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Webhook</p>
                      <p className="text-xs text-foreground0">Trigger via HTTP webhook</p>
                    </div>
                  </div>
                  <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
                </div>

                {/* Scheduled Triggers */}
                {scheduledTriggers.map((trigger) => (
                  <div 
                    key={trigger.id}
                    className="flex items-center justify-between p-3 rounded-lg border border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-950 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{trigger.name}</p>
                        <p className="text-xs text-foreground0 font-mono">{trigger.cron}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={trigger.enabled} 
                        onCheckedChange={() => toggleScheduledTrigger(trigger.id)} 
                      />
                      <button 
                        onClick={() => removeScheduledTrigger(trigger.id)}
                        className="p-1 text-foreground0 hover:text-red-400 transition-colors"
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
                      className="bg-accent border text-foreground placeholder:text-foreground0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Schedule (Cron Expression)</Label>
                    <Input
                      value={newScheduleCron}
                      onChange={(e) => setNewScheduleCron(e.target.value)}
                      placeholder="0 8 * * 1"
                      className="bg-accent border text-foreground placeholder:text-foreground0 font-mono"
                    />
                    <p className="text-xs text-foreground0">
                      Example: &quot;0 8 * * 1&quot; = Every Monday at 8 AM
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Timezone</Label>
                    <Select value={newScheduleTimezone} onValueChange={setNewScheduleTimezone}>
                      <SelectTrigger className="bg-accent border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="utc" className="text-foreground focus:bg-muted">
                          UTC
                        </SelectItem>
                        <SelectItem value="america_new_york" className="text-foreground focus:bg-muted">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="america_los_angeles" className="text-foreground focus:bg-muted">
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem value="europe_london" className="text-foreground focus:bg-muted">
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="asia_tokyo" className="text-foreground focus:bg-muted">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg bg-blue-950/30 border border-blue-800/50 p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-200 font-medium">Next Run Preview</p>
                        <p className="text-xs text-blue-300/70 mt-0.5">
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
                    className="border text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                    onClick={addScheduledTrigger}
                    disabled={!newScheduleName || !newScheduleCron}
                  >
                    Add Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Connected Integrations Row */}
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-border">
              {connectedIntegrations.map((name) => (
                <Badge 
                  key={name}
                  variant="outline" 
                  className="px-3 py-1.5 bg-accent border text-foreground flex items-center gap-2"
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
                    className="ml-1 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {connectedIntegrations.length === 0 && (
                <span className="text-sm text-foreground0">Type @ to add integrations</span>
              )}
            </div>

            {/* Main Content */}
            <div className="relative mb-8">
              <div
                ref={contentRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="w-full min-h-[400px] text-muted-foreground leading-relaxed focus:outline-none text-sm"
                suppressContentEditableWarning
              >
                <p><strong>Goal</strong></p>
                <p>Describe what this agent should accomplish...</p>
                <br />
                <p><strong>Instructions</strong></p>
                <p>1. When triggered, perform the main task</p>
                <p>2. Process the data and extract relevant information</p>
                <p>3. Take action based on the results</p>
                <br />
                <p><strong>Notes</strong></p>
                <p>Add any additional notes here</p>
              </div>

              {/* @ Mention Dropdown - Positioned above cursor */}
              {showMentionDropdown && filteredIntegrations.length > 0 && (
                <div 
                  ref={mentionDropdownRef}
                  className="absolute z-50 w-72 rounded-lg border border bg-card shadow-xl max-h-64 overflow-y-auto"
                  style={{ 
                    bottom: `calc(100% - ${mentionPosition.top}px + 20px)`,
                    left: mentionPosition.left 
                  }}
                >
                  <div className="p-2">
                    <div className="text-xs font-semibold text-foreground0 px-2 py-1 mb-1">
                      Select Integration
                    </div>
                    {filteredIntegrations.map((integration, index) => (
                      <button
                        key={integration.id}
                        onClick={() => addIntegration(integration.name)}
                        className={`w-full text-left px-2 py-2 rounded flex items-center gap-3 transition-colors ${
                          index === selectedMentionIndex 
                            ? 'bg-muted' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Image 
                          src={getIntegrationIcon(integration.id)} 
                          alt={integration.name} 
                          width={20} 
                          height={20}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              @{integration.name.toLowerCase()}
                            </span>
                            <Badge variant="outline" className="text-xs bg-accent text-muted-foreground border">
                              {integration.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground0 truncate">
                            {integration.description}
                          </p>
                        </div>
                        {index === selectedMentionIndex && (
                          <span className="text-xs text-foreground0">Enter</span>
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
                  <h2 className="font-semibold text-foreground mb-3">Context</h2>
                  <div className="flex flex-wrap gap-2">
                    {contexts.map((ctx) => (
                      <Badge 
                        key={ctx.name}
                        variant="outline" 
                        className="px-3 py-1.5 bg-accent border text-foreground flex items-center gap-2"
                      >
                        <Paperclip className="h-3 w-3" />
                        {ctx.name}
                        <button 
                          onClick={() => removeContext(ctx.name)}
                          className="ml-1 hover:text-red-400 transition-colors"
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
                className="flex items-center gap-1.5 text-sm text-foreground0 hover:text-muted-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add context
              </button>
            </div>

          </div>
        </div>

        {/* Right Panel - Agent Builder Chat */}
        <div 
          className={`flex flex-col border-l border-border bg-card transition-all duration-300 ease-in-out ${
            isBuilderOpen ? 'w-[340px]' : 'w-0'
          } overflow-hidden`}
        >
          <div className="w-[340px] h-full flex flex-col">
            <div className="p-5 border-b border-border shrink-0">
              <h2 className="font-semibold text-foreground">Agent builder</h2>
              <p className="text-sm text-muted-foreground mt-1">
                I&apos;ll help you create {agentName || "your agent"}
              </p>
            </div>

            <div className="p-4 border-b border-border space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border text-muted-foreground hover:bg-accent">
                Suggest integrations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border text-muted-foreground hover:bg-accent">
                Generate instructions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border text-muted-foreground hover:bg-accent">
                Add error handling
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-background">
              <div className="bg-card rounded-lg p-3 border border">
                <p className="text-sm text-muted-foreground">
                  I can help you build this agent. Try:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>- &quot;Create an agent that monitors competitors&quot;</li>
                  <li>- &quot;Add Slack notifications&quot;</li>
                  <li>- &quot;What integrations should I use?&quot;</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-card shrink-0">
              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Describe what you want to build..."
                  rows={2}
                  className="w-full rounded-xl border border bg-accent px-4 py-3 pr-20 text-sm text-foreground placeholder:text-foreground0 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button className="p-1.5 text-muted-foreground hover:text-muted-foreground rounded-lg transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1.5 text-muted-foreground hover:text-amber-500 rounded-lg transition-colors"
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
