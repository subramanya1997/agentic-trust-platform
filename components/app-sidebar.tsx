"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  Bot,
  HelpCircle,
  Activity,
  BookOpen,
  Key,
  Users,
  BarChart3,
  Webhook,
  Building2,
  Zap,
} from "@/lib/icons"

// Custom MCP icon component to match Lucide icon interface
// Using inline SVG to ensure proper sizing in collapsed sidebar state
function McpIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/mcp.svg"
      alt="MCP"
      width={16}
      height={16}
      className={`brightness-0 dark:invert shrink-0 ${className || ""}`}
    />
  )
}

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Sara Klein",
    email: "sara@company.com",
    avatar: "",
  },
  build: [
    {
      title: "Agents",
      url: "/agents",
      icon: Bot,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Zap,
    },
    {
      title: "Webhooks",
      url: "/webhooks",
      icon: Webhook,
    },
    {
      title: "MCP Registry",
      url: "/mcp-registry",
      icon: McpIcon,
    },
  ],
  dashboard: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
  ],
  run: [
    {
      title: "Activity",
      url: "/activity",
      icon: Activity,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
  ],
  access: [
    {
      title: "Organization",
      url: "/organization",
      icon: Building2,
    },
    {
      title: "API Keys",
      url: "/api-keys",
      icon: Key,
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
    },
  ],
  resources: [
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
}

function SidebarHeaderContent() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          {isCollapsed ? (
            <SidebarTrigger className="size-8 mx-auto" />
          ) : (
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Agentic Trust</span>
                </div>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderContent />
      <SidebarContent>
        <NavMain items={data.dashboard} />
        <NavMain items={data.build} label="Build" />
        <NavMain items={data.run} label="Run" />
        <NavMain items={data.access} label="Access" />
        <NavMain items={data.resources} label="Resources" />
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
