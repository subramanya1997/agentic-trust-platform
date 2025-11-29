"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";

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

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedMentionIndex(0);
  }, [mentionFilter]);

  const getProviderIcon = (providerName: string) => {
    const provider = llmProviders.find(p => p.name === providerName);
    return provider?.icon || Sparkles;
  };

  const getProviderColor = (providerName: string) => {
    const provider = llmProviders.find(p => p.name === providerName);
    return provider?.color || "text-purple-500";
  };

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

  const ProviderIcon = getProviderIcon(selectedModel.provider);

  return (
    <div className="flex flex-col h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-stone-800 bg-stone-950 px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="flex items-center text-sm text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Agents
          </Link>
          <span className="text-stone-600">/</span>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-stone-100 font-medium">New Agent</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200">
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-stone-400 hover:text-stone-200"
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          >
            {isBuilderOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Document View */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Agent Title + Run Button */}
            <div className="flex items-center justify-between mb-6">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent Name"
                className="text-3xl font-bold text-stone-100 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
              />
              <Button className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 ml-4">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model & Schedule Row */}
            <div className="flex items-center gap-4 mb-6">
              {/* Model Selector Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button 
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-200 hover:border-stone-600 transition-colors"
                >
                  <ProviderIcon className={`h-4 w-4 ${getProviderColor(selectedModel.provider)}`} />
                  {selectedModel.model.name}
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 max-h-[400px] overflow-y-auto rounded-lg border border-stone-700 bg-stone-900 shadow-xl z-50">
                    {llmProviders.map((provider) => (
                      <div key={provider.name}>
                        <div className="sticky top-0 px-3 py-2 bg-stone-800 border-b border-stone-700 flex items-center gap-2">
                          <provider.icon className={`h-4 w-4 ${provider.color}`} />
                          <span className="text-xs font-semibold text-stone-300 uppercase tracking-wide">
                            {provider.name}
                          </span>
                        </div>
                        {provider.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => selectModel(provider.name, model)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-800 transition-colors text-left"
                          >
                            <div>
                              <span className="text-sm font-medium text-stone-200">{model.name}</span>
                              <p className="text-xs text-stone-400">{model.description}</p>
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

              <button className="text-sm text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors">
                <Plus className="h-4 w-4" />
                Add schedule/trigger
              </button>
            </div>

            {/* Connected Integrations Row */}
            <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-stone-800">
              {connectedIntegrations.map((name) => (
                <Badge 
                  key={name}
                  variant="outline" 
                  className="px-3 py-1.5 bg-stone-800 border-stone-700 text-stone-200 flex items-center gap-2"
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
                <span className="text-sm text-stone-500">Type @ to add integrations</span>
              )}
            </div>

            {/* Main Content */}
            <div className="relative mb-8">
              <div
                ref={contentRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="w-full min-h-[400px] text-stone-300 leading-relaxed focus:outline-none text-sm"
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
                  className="absolute z-50 w-72 rounded-lg border border-stone-700 bg-stone-900 shadow-xl max-h-64 overflow-y-auto"
                  style={{ 
                    bottom: `calc(100% - ${mentionPosition.top}px + 20px)`,
                    left: mentionPosition.left 
                  }}
                >
                  <div className="p-2">
                    <div className="text-xs font-semibold text-stone-500 px-2 py-1 mb-1">
                      Select Integration
                    </div>
                    {filteredIntegrations.map((integration, index) => (
                      <button
                        key={integration.id}
                        onClick={() => addIntegration(integration.name)}
                        className={`w-full text-left px-2 py-2 rounded flex items-center gap-3 transition-colors ${
                          index === selectedMentionIndex 
                            ? 'bg-stone-700' 
                            : 'hover:bg-stone-800'
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
                            <span className="text-sm font-medium text-stone-200">
                              @{integration.name.toLowerCase()}
                            </span>
                            <Badge variant="outline" className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                              {integration.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-500 truncate">
                            {integration.description}
                          </p>
                        </div>
                        {index === selectedMentionIndex && (
                          <span className="text-xs text-stone-500">Enter</span>
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
                  <h2 className="font-semibold text-stone-100 mb-3">Context</h2>
                  <div className="flex flex-wrap gap-2">
                    {contexts.map((ctx) => (
                      <Badge 
                        key={ctx.name}
                        variant="outline" 
                        className="px-3 py-1.5 bg-stone-800 border-stone-700 text-stone-200 flex items-center gap-2"
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
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add context
              </button>
            </div>

            {/* Activity Section */}
            <div className="mt-12 pt-6 border-t border-stone-800">
              <h2 className="font-semibold text-stone-100 mb-4">Activity</h2>
              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <div className="h-6 w-6 rounded bg-amber-950 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                    </div>
                    <span>Draft created just now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Panel - Agent Builder Chat */}
        <div 
          className={`flex flex-col border-l border-stone-800 bg-stone-900 transition-all duration-300 ease-in-out ${
            isBuilderOpen ? 'w-[340px]' : 'w-0'
          } overflow-hidden`}
        >
          <div className="w-[340px] h-full flex flex-col">
            <div className="p-5 border-b border-stone-800 shrink-0">
              <h2 className="font-semibold text-stone-100">Agent builder</h2>
              <p className="text-sm text-stone-400 mt-1">
                I'll help you create {agentName || "your agent"}
              </p>
            </div>

            <div className="p-4 border-b border-stone-800 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Suggest integrations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Generate instructions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Add error handling
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-stone-950">
              <div className="bg-stone-900 rounded-lg p-3 border border-stone-800">
                <p className="text-sm text-stone-300">
                  I can help you build this agent. Try:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-stone-400">
                  <li>- "Create an agent that monitors competitors"</li>
                  <li>- "Add Slack notifications"</li>
                  <li>- "What integrations should I use?"</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-900 shrink-0">
              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Describe what you want to build..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 pr-20 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button className="p-1.5 text-stone-400 hover:text-stone-300 rounded-lg transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg transition-colors"
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
