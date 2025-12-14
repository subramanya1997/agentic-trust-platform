"use client"

import { Moon, Sun } from "@/lib/icons"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isCollapsed ? (
          <SidebarMenuButton
            tooltip={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full"
          >
            {theme === "dark" ? (
              <>
                <Sun className="size-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="size-4" />
                <span>Dark Mode</span>
              </>
            )}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

