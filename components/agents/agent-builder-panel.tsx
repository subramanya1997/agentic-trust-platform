"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { IntegrationIcon } from "@/components/integration-icon";
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
import type { GeneratedAgent } from "@/lib/types/agent";
import type { Components } from "react-markdown";

interface AgentBuilderPanelProps {
  agentName: string;
  isOpen: boolean;
  onApplyAgent?: (agent: GeneratedAgent) => void;
}

// Custom text renderer to handle @mentions with integration icons
const renderTextWithMentions = (text: string) => {
  // Split by @mentions (word characters after @)
  const parts = text.split(/(@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const integrationName = part.slice(1); // Remove @
      return (
        <span
          key={index}
          className="bg-accent/50 inline-flex items-center gap-1 rounded px-1.5 py-0.5"
        >
          <IntegrationIcon
            integrationId={integrationName.toLowerCase()}
            alt={integrationName}
            width={14}
            height={14}
            className="rounded"
          />
          <span className="font-medium">{part}</span>
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AgentBuilderPanel({
  agentName: _agentName,
  isOpen,
  onApplyAgent,
}: AgentBuilderPanelProps) {
  const [selectedModel, setSelectedModel] = useState("Sonnet 4.5");
  const [panelWidth, setPanelWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use centralized model names
  const models = getModelNames();

  // Custom components for ReactMarkdown to handle @mentions
  const markdownComponents: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    // Override text rendering to add integration icons
    text: ({ children }) => {
      if (typeof children === "string") {
        return <>{renderTextWithMentions(children)}</>;
      }
      return <>{children}</>;
    },
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "text") {
                  // Text content from Claude
                  assistantMessage.content += data.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      lastMsg.content = assistantMessage.content;
                    }
                    return newMessages;
                  });
                } else if (data.type === "tool_call" && data.tool === "generate_agent") {
                  // Agent was generated! Immediately show preview in the main area
                  // Ensure data has the required structure
                  const agentData = data.data as GeneratedAgent;
                  if (agentData && agentData.title) {
                    // Immediately trigger the preview in the main area
                    if (onApplyAgent) {
                      onApplyAgent(agentData);
                    }

                    // Add a visual indicator to the message
                    assistantMessage.content +=
                      "\n\n✨ **Agent configuration generated!** Review the changes on the left and click 'Apply Changes' to accept.";
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMsg = newMessages[newMessages.length - 1];
                      if (lastMsg && lastMsg.role === "assistant") {
                        lastMsg.content = assistantMessage.content;
                      }
                      return newMessages;
                    });
                  } else {
                    console.error("Invalid agent data received:", data.data);
                  }
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) {
        return;
      }

      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = panelRect.right - e.clientX;

      // Min width: 280px, Max width: 800px
      if (newWidth >= 280 && newWidth <= 800) {
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

      <div className="flex h-full flex-col">
        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sidebar-foreground/70 mb-4 text-sm">
                Describe what you want your agent to do, and I&apos;ll help you build it.
              </p>
              {/* Quick Actions */}
              <div className="w-full space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
                  onClick={() =>
                    setInput(
                      "Create an agent that enriches leads from Salesforce with company data from Clearbit"
                    )
                  }
                >
                  Enrich leads automatically
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
                  onClick={() =>
                    setInput(
                      "Create an agent that monitors GitHub issues and creates Slack notifications for urgent bugs"
                    )
                  }
                >
                  Monitor GitHub issues
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border w-full justify-start"
                  onClick={() =>
                    setInput(
                      "Create an agent that generates weekly sales reports from Salesforce and sends them via email"
                    )
                  }
                >
                  Generate weekly reports
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-amber-600 text-white"
                        : "bg-sidebar-accent text-sidebar-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-sidebar-accent text-sidebar-foreground max-w-[85%] rounded-lg px-4 py-2">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="shrink-0 p-4">
          <form onSubmit={handleSubmit}>
            <InputGroup className="bg-sidebar-accent/50 border-sidebar-border">
              <InputGroupTextarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Describe what you want your agent to do..."
                className="text-sidebar-foreground placeholder:text-sidebar-foreground/70 max-h-[160px] min-h-[56px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }}
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
                  type="submit"
                  disabled={isLoading || !input.trim()}
                >
                  <ArrowUp />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
