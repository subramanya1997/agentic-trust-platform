"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DynamicFavicon() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      return;
    }

    // Use resolvedTheme or fallback to theme, default to dark
    const currentTheme = resolvedTheme || theme || "dark";
    const faviconPath =
      currentTheme === "light" ? "/logo/light-favicon.png" : "/logo/dark-favicon.png";

    // Add cache-busting timestamp to force reload
    const cacheBuster = `?v=${new Date().getTime()}`;

    // Remove all existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((link) => link.remove());

    // Create and append new favicon link with cache buster
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = faviconPath + cacheBuster;
    document.head.appendChild(link);

    // Also add shortcut icon (some browsers need this)
    const shortcutLink = document.createElement("link");
    shortcutLink.rel = "shortcut icon";
    shortcutLink.type = "image/png";
    shortcutLink.href = faviconPath + cacheBuster;
    document.head.appendChild(shortcutLink);

    // Also add apple-touch-icon for better mobile support
    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = faviconPath + cacheBuster;
    document.head.appendChild(appleLink);
  }, [theme, resolvedTheme]);

  return null; // This component doesn't render anything
}
