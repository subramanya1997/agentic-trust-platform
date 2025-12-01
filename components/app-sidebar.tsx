"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Bot,
  Zap,
  HelpCircle,
  Activity,
  BookOpen,
  Key,
  Users,
  BarChart3,
  Webhook,
  Building2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
      url: "#",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Zap className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nexus</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI Agent Platform
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.dashboard} />
        <NavMain items={data.build} label="Build" />
        <NavMain items={data.run} label="Run" />
        <NavMain items={data.access} label="Access" />
        <NavMain items={data.resources} label="Resources" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
