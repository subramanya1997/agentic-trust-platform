"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { NAVIGATION, ROUTES } from "@/lib/constants";

function SidebarHeaderContent() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to use based on theme
  const logoSrc = theme === "light" ? "/logo/light.png" : "/logo/dark.png";

  return (
    <SidebarHeader>
      {isCollapsed ? (
        <SidebarTrigger className="mx-auto size-8" />
      ) : (
        <Link href={ROUTES.HOME} className="block px-2 py-2">
          {mounted && (
            <Image
              src={logoSrc}
              alt="Agentic Trust"
              width={192}
              height={48}
              className="shrink-0"
              priority
            />
          )}
        </Link>
      )}
    </SidebarHeader>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.auth.me();
        const displayName = userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.first_name || userData.email.split("@")[0];

        setUser({
          name: displayName,
          email: userData.email,
          avatar: userData.avatar_url || "",
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Fallback to email from cookie or default
        setUser({
          name: "User",
          email: "",
          avatar: "",
        });
      }
    };

    fetchUser();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderContent />
      <SidebarContent>
        <NavMain items={NAVIGATION.dashboard.items} />
        <NavMain items={NAVIGATION.build.items} label={NAVIGATION.build.label} />
        <NavMain items={NAVIGATION.run.items} label={NAVIGATION.run.label} />
        <NavMain items={NAVIGATION.access.items} label={NAVIGATION.access.label} />
        <NavMain items={NAVIGATION.resources.items} label={NAVIGATION.resources.label} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
