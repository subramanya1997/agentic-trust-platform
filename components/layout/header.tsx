"use client";

import Link from "next/link";
import { Bell, Search, HelpCircle, ChevronRight, Sparkles, Clock, Copy, MoreHorizontal, PanelRight, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
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
  agentMode = false, 
  agentName = "",
  onAgentNameChange,
  isBuilderOpen = true,
  onToggleBuilder,
  actionButton
}: HeaderProps) {
  if (agentMode) {
    return (
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-stone-800 bg-stone-950 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
          <Separator orientation="vertical" className="mx-2 h-4 bg-stone-700" />
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/agents" className="text-stone-400 hover:text-stone-200 transition-colors">
              General
            </Link>
            <ChevronRight className="h-4 w-4 text-stone-600" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onAgentNameChange?.(e.currentTarget.textContent || "New Agent")}
                className="text-stone-100 font-medium focus:outline-none focus:bg-stone-800 rounded px-1 min-w-[100px]"
              >
                {agentName}
              </span>
            </div>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-500 mr-2">Edited 2 months ago</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-2 h-4 bg-stone-700" />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleBuilder}
            className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
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

  // Default header with search
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-stone-800 bg-stone-950 px-4">
      <SidebarTrigger className="-ml-1 text-stone-400 hover:text-stone-200" />
      <Separator orientation="vertical" className="h-4 bg-stone-700" />
      
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search agents, executions..."
            className="w-full rounded-md border border-stone-700 bg-stone-900 py-1.5 pl-9 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        {actionButton !== null && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4 bg-stone-700" />
            {actionButton ?? (
              <Link href="/agents/new">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium">
                  Create Agent
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
