"use client";

import React, { useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { ArrowLeft, Play, Send } from "lucide-react";
import Link from "next/link";
import { sampleAgentConfigs } from "@/lib/data/sample-agents";

interface AgentExamplePageProps {
  params: Promise<{ id: string }>;
}

export default function AgentExamplePage({ params }: AgentExamplePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Available integrations
  const integrations = [
    { name: "notion", type: "API", description: "Document management" },
    { name: "salesforce", type: "API", description: "CRM platform" },
    { name: "github", type: "API", description: "Code repository" },
    { name: "slack", type: "API", description: "Team communication" },
    { name: "clearbit", type: "API", description: "Data enrichment" },
    { name: "linear", type: "API", description: "Issue tracking" },
    { name: "stripe", type: "API", description: "Payment processing" },
    { name: "gmail", type: "API", description: "Email service" },
    { name: "postgres", type: "MCP", description: "PostgreSQL database" },
    { name: "filesystem", type: "MCP", description: "Local filesystem" },
  ];

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const agent = resolvedParams ? sampleAgentConfigs.find((a) => a.id === resolvedParams.id) : null;

  useEffect(() => {
    if (agent) {
      setMarkdown(agent.markdown);
    }
  }, [agent]);

  if (!resolvedParams) {
    return (
      <>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-stone-400">Loading...</div>
        </main>
      </>
    );
  }

  if (!agent) {
    notFound();
  }

  // Handle @ mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setMarkdown(value);
    setCursorPosition(cursorPos);

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (/^[a-z0-9]*$/i.test(textAfterAt)) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Insert integration mention
  const insertIntegration = (integrationName: string) => {
    const textBeforeCursor = markdown.substring(0, cursorPosition);
    const textAfterCursor = markdown.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    const newText = 
      markdown.substring(0, lastAtIndex) + 
      `@${integrationName}` + 
      textAfterCursor;
    
    setMarkdown(newText);
    setShowSuggestions(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastAtIndex + integrationName.length + 1;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Get mentioned integrations
  const getMentionedIntegrations = () => {
    const mentions = markdown.match(/@[a-z0-9]+/gi) || [];
    return mentions.map(m => m.substring(1).toLowerCase());
  };

  const mentionedIntegrations = getMentionedIntegrations();

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-3.5rem)] gap-0">
        {/* Left Panel - Markdown Editor */}
        <div className="flex-1 overflow-y-auto border-r border-stone-800 bg-stone-950">
          <div className="p-6 space-y-4">
            {/* Back Link */}
            <Link
              href="/agents"
              className="inline-flex items-center text-sm text-stone-400 hover:text-stone-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Link>

            {/* Title */}
            <h1 className="text-2xl font-bold text-stone-50">{agent.name}</h1>

            {/* Run Agent Button */}
            <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white">
              <Play className="mr-2 h-4 w-4" />
              Run agent
            </Button>

            {/* Model Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-orange-950 text-orange-400 border-orange-800">
                {agent.model}
              </Badge>
              <button className="text-sm text-stone-500 hover:text-stone-300">
                + Add schedule/trigger
              </button>
            </div>

            {/* Connected Integrations */}
            {mentionedIntegrations.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-stone-800">
                <span className="text-sm text-stone-400">Connected:</span>
                {mentionedIntegrations.map((name, index) => {
                  const integration = integrations.find(i => i.name === name);
                  return (
                    <Badge key={index} variant="outline" className="bg-stone-800 text-stone-300 border-stone-700">
                      {name}
                      <span className="ml-1 text-xs text-stone-500">({integration?.type || "API"})</span>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Markdown Editor */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={handleTextChange}
                placeholder="Write your agent configuration in markdown..."
                className="w-full min-h-[calc(100vh-24rem)] rounded-lg border border-stone-700 bg-stone-900 p-4 text-sm font-mono text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />

              {/* Integration Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 mt-1 w-80 rounded-lg border border-stone-700 bg-stone-900 shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-stone-500 px-2 py-1">
                      Available Integrations
                    </div>
                    {integrations.map((integration) => (
                      <button
                        key={integration.name}
                        onClick={() => insertIntegration(integration.name)}
                        className="w-full text-left px-2 py-2 hover:bg-stone-800 rounded flex items-start gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-200">
                              @{integration.name}
                            </span>
                            <Badge variant="outline" className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                              {integration.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-400 truncate">
                            {integration.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Helper Text */}
            <div className="text-xs text-stone-500 space-y-1">
              <p>Tip: Type @ to mention integrations</p>
              <p>Use markdown formatting for structure</p>
              <p>Changes are automatically saved</p>
            </div>

            {/* Add Context */}
            <button className="text-sm text-stone-500 hover:text-stone-300">
              + Add context
            </button>

            {/* Activity Section */}
            <div className="pt-6 border-t border-stone-800">
              <h3 className="text-sm font-semibold text-stone-200 mb-3">Activity</h3>
              <div className="space-y-2 text-sm text-stone-400">
                <div className="flex items-start gap-2">
                  <span className="text-stone-500">*</span>
                  <span>You created {agent.name} - 2 months ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Agent Chat */}
        <div className="w-[400px] flex flex-col bg-stone-900 border-l border-stone-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-800">
            <h2 className="font-semibold text-stone-100">Agent builder</h2>
            <p className="text-sm text-stone-400 mt-1">
              Welcome back! How can I improve {agent.name}?
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-950">
            <div className="space-y-4">
              {/* Example message */}
              <div className="bg-stone-900 rounded-lg p-3 border border-stone-800">
                <p className="text-sm text-stone-300">
                  I can help you build your agent. Try:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-stone-400">
                  <li>- "Add instructions for error handling"</li>
                  <li>- "Suggest integrations for this workflow"</li>
                  <li>- "Format this as a proper spec"</li>
                  <li>- "What's missing from this agent?"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-stone-800 bg-stone-900">
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setChatMessage("");
                  }
                }}
              />
              <Button 
                size="icon"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                onClick={() => setChatMessage("")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
