import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  HelpCircle,
  Key,
  LayoutDashboard,
  McpIcon,
  Users,
  Webhook,
  Zap,
  type LucideIcon,
} from "@/lib/icons";

// Route constants
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

// Navigation types
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon | typeof McpIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

// Navigation structure
export const NAVIGATION = {
  dashboard: {
    items: [
      {
        title: "Dashboard",
        url: ROUTES.HOME,
        icon: LayoutDashboard,
      },
    ],
  },
  build: {
    label: "Build",
    items: [
      {
        title: "Agents",
        url: ROUTES.AGENTS,
        icon: Bot,
      },
      {
        title: "Integrations",
        url: ROUTES.INTEGRATIONS,
        icon: Zap,
      },
      {
        title: "Webhooks",
        url: ROUTES.WEBHOOKS,
        icon: Webhook,
      },
      {
        title: "MCP Registry",
        url: ROUTES.MCP_REGISTRY,
        icon: McpIcon,
      },
    ],
  },
  run: {
    label: "Run",
    items: [
      {
        title: "Activity",
        url: ROUTES.ACTIVITY,
        icon: Activity,
      },
      {
        title: "Analytics",
        url: ROUTES.ANALYTICS,
        icon: BarChart3,
      },
    ],
  },
  access: {
    label: "Access",
    items: [
      {
        title: "Organization",
        url: ROUTES.ORGANIZATION,
        icon: Building2,
      },
      {
        title: "API Keys",
        url: ROUTES.API_KEYS,
        icon: Key,
      },
      {
        title: "Team",
        url: ROUTES.TEAM,
        icon: Users,
      },
    ],
  },
  resources: {
    label: "Resources",
    items: [
      {
        title: "Documentation",
        url: ROUTES.DOCS,
        icon: BookOpen,
      },
      {
        title: "Help",
        url: ROUTES.HELP,
        icon: HelpCircle,
      },
    ],
  },
};
