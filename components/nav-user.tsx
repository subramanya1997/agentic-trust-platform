"use client"

import { LogOut } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isCollapsed ? (
          <SidebarMenuButton
            tooltip="Log out"
            className="flex items-center justify-center"
          >
            <LogOut className="size-4" />
          </SidebarMenuButton>
        ) : (
          <div className="flex w-full items-center gap-2 rounded-md p-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-muted text-muted-foreground font-medium">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <SidebarMenuButton
              tooltip="Log out"
              className="ml-auto size-8 p-0"
            >
              <LogOut className="size-4" />
            </SidebarMenuButton>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
