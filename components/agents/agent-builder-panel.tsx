"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group";
import { getModelNames } from "@/lib/data/models";
import { ArrowUp, Paperclip } from "@/lib/icons";

interface AgentBuilderPanelProps {
  agentName: string;
  isOpen: boolean;
}

export function AgentBuilderPanel({ agentName: _agentName, isOpen }: AgentBuilderPanelProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("Sonnet 4.5");
  const [panelWidth, setPanelWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Use centralized model names
  const models = getModelNames();

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [chatMessage]);

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) {
        return;
      }

      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = panelRect.right - e.clientX;

      // Min width: 280px, Max width: 600px
      if (newWidth >= 280 && newWidth <= 600) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return (
    <div
      ref={panelRef}
      className={`border-sidebar-border bg-sidebar text-sidebar-foreground relative flex flex-col border-l transition-all ${
        isResizing ? "duration-0" : "duration-300"
      } overflow-hidden ease-in-out`}
      style={{ width: isOpen ? `${panelWidth}px` : "0px" }}
    >
      {/* Resize Handle */}
      {isOpen && (
        <div
          className="hover:bg-sidebar-accent/50 active:bg-sidebar-accent absolute top-0 bottom-0 left-0 z-10 w-1 cursor-ew-resize"
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      <div className="flex h-full flex-col" style={{ width: `${panelWidth}px` }}>
        {/* Spacer to push content to bottom */}
        <div className="flex-1" />

        {/* Bottom section: Quick Actions and Chat Input */}
        <div className="flex shrink-0 flex-col">
          {/* Quick Actions */}
          <div className="space-y-2 p-4">
            <Button
              variant="outline"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
            >
              Add error handling
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
            >
              Suggest optimizations
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
            >
              Add more integrations
            </Button>
          </div>

          {/* Chat Input */}
          <div className="p-4">
            <InputGroup className="bg-sidebar-accent/50 border-sidebar-border">
              <InputGroupTextarea
                ref={textareaRef}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask, Search or Chat..."
                className="text-sidebar-foreground placeholder:text-sidebar-foreground/70 max-h-[160px] min-h-[56px]"
              />
              <InputGroupAddon align="block-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton variant="ghost" className="text-sidebar-foreground">
                      {selectedModel}
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="[--radius:0.95rem]">
                    {models.map((model) => (
                      <DropdownMenuItem key={model} onClick={() => setSelectedModel(model)}>
                        {model}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  className="text-sidebar-foreground ml-auto"
                >
                  <Paperclip />
                  <span className="sr-only">Attach file</span>
                </InputGroupButton>
                <InputGroupText className="text-sidebar-foreground">@</InputGroupText>
                <InputGroupButton
                  variant="default"
                  className="rounded-full"
                  size="icon-xs"
                  onClick={() => setChatMessage("")}
                >
                  <ArrowUp />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
