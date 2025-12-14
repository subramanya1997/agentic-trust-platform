export const ROUTES = {
  HOME: "/",
  AGENTS: "/agents",
  AGENT_NEW: "/agents/new",
  ACTIVITY: "/activity",
  ANALYTICS: "/analytics",
  INTEGRATIONS: "/integrations",
  MCP_REGISTRY: "/mcp-registry",
  WEBHOOKS: "/webhooks",
  TEAM: "/team",
  ORGANIZATION: "/organization",
  API_KEYS: "/api-keys",
  DOCS: "/docs",
  HELP: "/help",
} as const;

/** Generate dynamic route paths */
export const getAgentRoute = (id: string) => `/agents/${id}` as const;
export const getIntegrationRoute = (id: string) => `/integrations/${id}` as const;
export const getMcpServerRoute = (id: string) => `/mcp-registry/${id}` as const;
export const getWebhookRoute = (id: string) => `/webhooks/${id}` as const;
