"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Bell,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Clock,
  Copy,
  MoreHorizontal,
  PanelRight,
  PanelRightClose,
} from "@/lib/icons";

interface HeaderProps {
  // Page subtitle to display in header
  subtitle?: string;
  // For agent builder page
  agentMode?: boolean;
  agentName?: string;
  onAgentNameChange?: (name: string) => void;
  isBuilderOpen?: boolean;
  onToggleBuilder?: () => void;
  // Custom action button
  actionButton?: React.ReactNode;
}

export function Header({
  subtitle,
  agentMode = false,
  agentName = "",
  onAgentNameChange,
  isBuilderOpen = true,
  onToggleBuilder,
  actionButton,
}: HeaderProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (agentMode) {
    return (
      <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1" />
              <Separator orientation="vertical" className="mx-2 h-4" />
            </>
          )}

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/agents"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              General
            </Link>
            <ChevronRight className="text-muted-foreground/50 h-4 w-4" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onAgentNameChange?.(e.currentTarget.textContent || "New Agent")}
                className="text-foreground focus:bg-accent min-w-[100px] rounded px-1 font-medium focus:outline-none"
              >
                {agentName}
              </span>
            </div>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-2 text-xs">Edited 2 months ago</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleBuilder}
            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
            title={isBuilderOpen ? "Close Agent Builder" : "Open Agent Builder"}
          >
            {isBuilderOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>
    );
  }

  // Default header
  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 min-w-0 shrink-0 items-center gap-4 border-b px-4">
      <div className="mr-auto flex items-center gap-3">
        {!isCollapsed && (
          <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1 shrink-0" />
        )}
        {subtitle && <span className="text-muted-foreground text-sm">{subtitle}</span>}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-accent relative h-8 w-8"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        {actionButton && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            {actionButton}
          </>
        )}
      </div>
    </header>
  );
}
