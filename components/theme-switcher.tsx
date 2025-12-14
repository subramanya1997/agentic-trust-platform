"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "@/lib/icons";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isCollapsed ? (
          <SidebarMenuButton
            tooltip={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton onClick={toggleTheme} className="flex w-full items-center gap-2">
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
  );
}
