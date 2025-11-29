// Integration icon mappings
export const integrationIcons: Record<string, string> = {
  salesforce: "/integrations/salesforce.svg",
  clearbit: "/integrations/clearbit.png",
  zendesk: "/integrations/zendesk.svg",
  slack: "/integrations/slack.svg",
  notion: "/integrations/notion.svg",
  gmail: "/integrations/gmail.svg",
  github: "/integrations/github.svg",
  linear: "/integrations/linear.svg",
  zoom: "/integrations/zoom.svg",
  quickbooks: "/integrations/quickbooks.svg",
};

export function getIntegrationIcon(name: string): string {
  const key = name.toLowerCase();
  return integrationIcons[key] || "/integrations/notion.svg"; // fallback
}

