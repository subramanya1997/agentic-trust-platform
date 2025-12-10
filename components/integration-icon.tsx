"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { getIntegrationIcon } from "@/lib/integration-icons";
import { useEffect, useState } from "react";

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
    setMounted(true);
  }, []);

  // Use light theme as default during SSR to avoid hydration issues
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  const iconSrc = getIntegrationIcon(integrationId, theme);

  return (
    <Image
      src={iconSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

