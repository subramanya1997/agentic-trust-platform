"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Copy, PanelRight, PanelRightClose, Sparkles } from "@/lib/icons";

export interface AgentHeaderProps {
  agentName: string;
  onNameChange?: (name: string) => void;
  showNameInput?: boolean;
  isBuilderOpen: boolean;
  onBuilderToggle: () => void;
  backHref?: string;
  backLabel?: string;
  /** Custom actions to render on the right side (replaces default run button) */
  actions?: React.ReactNode;
}

export function AgentHeader({
  agentName,
  onNameChange,
  showNameInput = false,
  isBuilderOpen,
  onBuilderToggle,
  backHref = "/agents",
  backLabel = "Agents",
  actions,
}: AgentHeaderProps) {
  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
        <span className="text-stone-600">/</span>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {showNameInput && onNameChange ? (
            <input
              type="text"
              value={agentName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Agent Name"
              className="text-foreground w-48 border-none bg-transparent font-medium focus:ring-0 focus:outline-none"
            />
          ) : (
            <span className="text-foreground font-medium">{agentName || "New Agent"}</span>
          )}
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
          onClick={onBuilderToggle}
        >
          {isBuilderOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRight className="h-4 w-4" />
          )}
        </Button>
        {actions}
      </div>
    </header>
  );
}
