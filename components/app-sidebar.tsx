"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAVIGATION, ROUTES } from "@/lib/constants";

const userData = {
  name: "Sara Klein",
  email: "sara@company.com",
  avatar: "",
};

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
        <ThemeSwitcher />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
