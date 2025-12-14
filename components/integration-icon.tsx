"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getIntegrationIcon } from "@/lib/integration-icons";

interface IntegrationIconProps {
  integrationId: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Theme-aware integration icon component
 * Automatically switches between light and dark mode logos based on the current theme
 */
export function IntegrationIcon({
  integrationId,
  alt,
  width,
  height,
  className,
}: IntegrationIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Use light theme as default during SSR to avoid hydration issues
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  const iconSrc = getIntegrationIcon(integrationId, theme);

  return <Image src={iconSrc} alt={alt} width={width} height={height} className={className} />;
}
