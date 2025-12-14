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
      className={`border-border bg-card flex flex-col border-l transition-all duration-300 ease-in-out ${
        isOpen ? "w-[340px]" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex h-full w-[340px] flex-col">
        {/* Chat Header */}
        <div className="border-border shrink-0 border-b p-5">
          <h2 className="text-foreground font-semibold">Agent builder</h2>
          <p className="text-muted-foreground mt-1 text-sm">How can I improve {agentName}?</p>
        </div>

        {/* Quick Actions */}
        <div className="border-border space-y-2 border-b p-4">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:bg-accent w-full justify-start border"
          >
            Add error handling
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:bg-accent w-full justify-start border"
          >
            Suggest optimizations
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:bg-accent w-full justify-start border"
          >
            Add more integrations
          </Button>
        </div>

        {/* Chat Messages Area */}
        <div className="bg-background flex-1 overflow-y-auto p-4">
          <div className="bg-card rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">I can help you improve this agent. Try:</p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              <li>- &quot;Add retry logic for failed API calls&quot;</li>
              <li>- &quot;What integrations would improve this?&quot;</li>
              <li>- &quot;Add logging for debugging&quot;</li>
            </ul>
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-card shrink-0 p-4">
          <div className="relative">
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything..."
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
  );
}
