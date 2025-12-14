// Integration icon mappings - supports light and dark mode
export const integrationIcons: Record<string, { light: string; dark: string }> = {
  salesforce: {
    light: "/integrations/light/salesforce.svg",
    dark: "/integrations/dark/salesforce.svg",
  },
  clearbit: {
    light: "/integrations/light/clearbit.webp",
    dark: "/integrations/dark/clearbit.webp",
  },
  zendesk: {
    light: "/integrations/light/zendesk.svg",
    dark: "/integrations/dark/zendesk.svg",
  },
  slack: {
    light: "/integrations/light/slack.svg",
    dark: "/integrations/dark/slack.svg",
  },
  notion: {
    light: "/integrations/light/notion.svg",
    dark: "/integrations/dark/notion.svg",
  },
  gmail: {
    light: "/integrations/light/gmail.svg",
    dark: "/integrations/dark/gmail.svg",
  },
  github: {
    light: "/integrations/light/github.svg",
    dark: "/integrations/dark/github.svg",
  },
  linear: {
    light: "/integrations/light/linear.svg",
    dark: "/integrations/dark/linear.svg",
  },
  zoom: {
    light: "/integrations/light/zoom.svg",
    dark: "/integrations/dark/zoom.svg",
  },
  quickbooks: {
    light: "/integrations/light/quickbooks.svg",
    dark: "/integrations/dark/quickbooks.svg",
  },
};

/**
 * Get integration icon path based on theme
 * @param name - Integration name
 * @param theme - Theme mode ('light' or 'dark'), defaults to 'light'
 * @returns Path to the integration icon
 */
export function getIntegrationIcon(name: string, theme: "light" | "dark" = "light"): string {
  const key = name.toLowerCase();
  const icon = integrationIcons[key];

  if (!icon) {
    return theme === "dark" ? "/integrations/dark/notion.svg" : "/integrations/light/notion.svg";
  }

  return icon[theme];
}

/**
 * Get both light and dark mode icon paths for an integration
 * @param name - Integration name
 * @returns Object with light and dark icon paths
 */
export function getIntegrationIcons(name: string): { light: string; dark: string } {
  const key = name.toLowerCase();
  return (
    integrationIcons[key] || {
      light: "/integrations/light/notion.svg",
      dark: "/integrations/dark/notion.svg",
    }
  );
}
