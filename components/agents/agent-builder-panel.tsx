"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "@/lib/icons";

interface AgentBuilderPanelProps {
  agentName: string;
  isOpen: boolean;
}

export function AgentBuilderPanel({ agentName, isOpen }: AgentBuilderPanelProps) {
  const [chatMessage, setChatMessage] = useState("");

  return (
    <div
      className={`flex flex-col border-l border-border bg-card transition-all duration-300 ease-in-out ${
        isOpen ? "w-[340px]" : "w-0"
      } overflow-hidden`}
    >
      <div className="w-[340px] h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-5 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground">Agent builder</h2>
          <p className="text-sm text-muted-foreground mt-1">How can I improve {agentName}?</p>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border text-muted-foreground hover:bg-accent"
          >
            Add error handling
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border text-muted-foreground hover:bg-accent"
          >
            Suggest optimizations
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start border text-muted-foreground hover:bg-accent"
          >
            Add more integrations
          </Button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="bg-card rounded-lg p-3 border border">
            <p className="text-sm text-muted-foreground">I can help you improve this agent. Try:</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>- &quot;Add retry logic for failed API calls&quot;</li>
              <li>- &quot;What integrations would improve this?&quot;</li>
              <li>- &quot;Add logging for debugging&quot;</li>
            </ul>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-card shrink-0">
          <div className="relative">
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
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
  );
}

