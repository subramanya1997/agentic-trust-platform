// Mock data for MCP servers (both agent-based and custom)

import type { CustomMCPServer, MCPToolInvocation, SelectedTool } from "@/lib/types";
import { integrationsWithTools } from "./integration-tools";
import { mockAgents } from "./mock-data";

// Agent-based MCP servers (existing agents exposed as MCP tools)
export const agentMCPServers: CustomMCPServer[] = [
  {
    id: "mcp-agent-1",
    name: "Lead Enrichment Agent",
    description: "Enriches leads with company information from Clearbit",
    serverUrl: "https://mcp.agentictrust.com/servers/agent-1",
    type: "agent",
    authType: "api_key",
    rateLimitPerMinute: 60,
    selectedTools: [
      {
        sourceType: "agent",
        sourceId: "agent-1",
        sourceName: "Lead Enrichment Agent",
        toolName: "enrich_lead",
        toolDescription: "Enriches a lead with company and contact information",
        category: "action",
        parameters: [
          { name: "email", type: "string", description: "Lead's email address", required: true },
          { name: "company", type: "string", description: "Company name", required: false },
        ],
      },
    ],
    stats: {
      totalCalls: 1234,
      successRate: 98.5,
      avgLatency: 245,
      uniqueClients: 8,
      lastCalledAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-09-15T10:30:00Z",
    createdBy: "Sara Klein",
  },
  {
    id: "mcp-agent-2",
    name: "Customer Support Ticket Router",
    description: "Routes support tickets to appropriate teams",
    serverUrl: "https://mcp.agentictrust.com/servers/agent-2",
    type: "agent",
    authType: "api_key",
    rateLimitPerMinute: 120,
    selectedTools: [
      {
        sourceType: "agent",
        sourceId: "agent-2",
        sourceName: "Customer Support Ticket Router",
        toolName: "route_ticket",
        toolDescription: "Analyzes and routes a support ticket to the appropriate team",
        category: "action",
        parameters: [
          { name: "ticket_id", type: "string", description: "Zendesk ticket ID", required: true },
          {
            name: "content",
            type: "string",
            description: "Ticket content for analysis",
            required: true,
          },
        ],
      },
    ],
    stats: {
      totalCalls: 3456,
      successRate: 99.2,
      avgLatency: 156,
      uniqueClients: 12,
      lastCalledAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-08-22T14:15:00Z",
    createdBy: "Taylor Chen",
  },
  {
    id: "mcp-agent-4",
    name: "Code Review Assistant",
    description: "Reviews code and provides feedback",
    serverUrl: "https://mcp.agentictrust.com/servers/agent-4",
    type: "agent",
    authType: "oauth2",
    rateLimitPerMinute: 30,
    selectedTools: [
      {
        sourceType: "agent",
        sourceId: "agent-4",
        sourceName: "Code Review Assistant",
        toolName: "review_code",
        toolDescription: "Reviews code changes and provides feedback",
        category: "action",
        parameters: [
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "pr_number", type: "number", description: "Pull request number", required: true },
        ],
      },
    ],
    stats: {
      totalCalls: 892,
      successRate: 97.8,
      avgLatency: 1234,
      uniqueClients: 5,
      lastCalledAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-07-10T16:45:00Z",
    createdBy: "Maya Rodriguez",
  },
  {
    id: "mcp-agent-6",
    name: "Meeting Notes Summarizer",
    description: "Summarizes meeting recordings into notes",
    serverUrl: "https://mcp.agentictrust.com/servers/agent-6",
    type: "agent",
    authType: "none",
    rateLimitPerMinute: 10,
    selectedTools: [
      {
        sourceType: "agent",
        sourceId: "agent-6",
        sourceName: "Meeting Notes Summarizer",
        toolName: "summarize_meeting",
        toolDescription: "Summarizes a meeting recording into structured notes",
        category: "action",
        parameters: [
          { name: "meeting_id", type: "string", description: "Zoom meeting ID", required: true },
        ],
      },
    ],
    stats: {
      totalCalls: 567,
      successRate: 96.3,
      avgLatency: 3456,
      uniqueClients: 3,
      lastCalledAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-10-20T08:30:00Z",
    createdBy: "Alex Park",
  },
];

// Custom MCP servers (user-created with selected tools)
export const customMCPServers: CustomMCPServer[] = [
  {
    id: "mcp-custom-1",
    name: "Sales Toolkit",
    description: "Combined CRM and enrichment tools for sales workflows",
    serverUrl: "https://mcp.agentictrust.com/servers/custom/sales-toolkit",
    type: "custom",
    authType: "api_key",
    rateLimitPerMinute: 100,
    selectedTools: [
      {
        sourceType: "integration",
        sourceId: "salesforce",
        sourceName: "Salesforce",
        toolName: "search_contacts",
        toolDescription: "Search for contacts by name, email, or company",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query string", required: true },
          {
            name: "limit",
            type: "number",
            description: "Maximum number of results",
            required: false,
          },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "salesforce",
        sourceName: "Salesforce",
        toolName: "create_lead",
        toolDescription: "Create a new lead record",
        category: "write",
        parameters: [
          { name: "first_name", type: "string", description: "Lead's first name", required: true },
          { name: "last_name", type: "string", description: "Lead's last name", required: true },
          { name: "company", type: "string", description: "Lead's company name", required: true },
          { name: "email", type: "string", description: "Lead's email address", required: false },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "clearbit",
        sourceName: "Clearbit",
        toolName: "enrich_person",
        toolDescription: "Get person data from an email address",
        category: "read",
        parameters: [
          { name: "email", type: "string", description: "Email address", required: true },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "clearbit",
        sourceName: "Clearbit",
        toolName: "enrich_company",
        toolDescription: "Get company data from a domain",
        category: "read",
        parameters: [
          { name: "domain", type: "string", description: "Company domain", required: true },
        ],
      },
      {
        sourceType: "agent",
        sourceId: "agent-1",
        sourceName: "Lead Enrichment Agent",
        toolName: "enrich_lead",
        toolDescription: "Enriches a lead with company and contact information",
        category: "action",
        parameters: [
          { name: "email", type: "string", description: "Lead's email address", required: true },
        ],
      },
    ],
    stats: {
      totalCalls: 2456,
      successRate: 97.8,
      avgLatency: 312,
      uniqueClients: 15,
      lastCalledAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-10-01T09:00:00Z",
    createdBy: "Sara Klein",
  },
  {
    id: "mcp-custom-2",
    name: "DevOps Automation Hub",
    description: "GitHub and Linear tools for development workflows",
    serverUrl: "https://mcp.agentictrust.com/servers/custom/devops-hub",
    type: "custom",
    authType: "oauth2",
    rateLimitPerMinute: 60,
    selectedTools: [
      {
        sourceType: "integration",
        sourceId: "github",
        sourceName: "GitHub",
        toolName: "create_issue",
        toolDescription: "Create a new issue",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "body", type: "string", description: "Issue description", required: false },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "github",
        sourceName: "GitHub",
        toolName: "create_pull_request",
        toolDescription: "Create a new pull request",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Pull request title", required: true },
          { name: "head", type: "string", description: "Source branch", required: true },
          { name: "base", type: "string", description: "Target branch", required: true },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "linear",
        sourceName: "Linear",
        toolName: "create_issue",
        toolDescription: "Create a new issue",
        category: "write",
        parameters: [
          { name: "team_id", type: "string", description: "Team ID", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          {
            name: "description",
            type: "string",
            description: "Issue description",
            required: false,
          },
        ],
      },
      {
        sourceType: "agent",
        sourceId: "agent-4",
        sourceName: "Code Review Assistant",
        toolName: "review_code",
        toolDescription: "Reviews code changes and provides feedback",
        category: "action",
        parameters: [
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "pr_number", type: "number", description: "Pull request number", required: true },
        ],
      },
    ],
    stats: {
      totalCalls: 1823,
      successRate: 99.1,
      avgLatency: 456,
      uniqueClients: 8,
      lastCalledAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-10-15T14:30:00Z",
    createdBy: "Maya Rodriguez",
  },
  {
    id: "mcp-custom-3",
    name: "Communication Suite",
    description: "Slack and email tools for team communication",
    serverUrl: "https://mcp.agentictrust.com/servers/custom/comm-suite",
    type: "custom",
    authType: "api_key",
    rateLimitPerMinute: 200,
    selectedTools: [
      {
        sourceType: "integration",
        sourceId: "slack",
        sourceName: "Slack",
        toolName: "send_message",
        toolDescription: "Send a message to a channel or user",
        category: "write",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID or name", required: true },
          { name: "text", type: "string", description: "Message text content", required: true },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "slack",
        sourceName: "Slack",
        toolName: "search_messages",
        toolDescription: "Search messages across channels",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
        ],
      },
      {
        sourceType: "integration",
        sourceId: "gmail",
        sourceName: "Gmail",
        toolName: "send_email",
        toolDescription: "Send an email",
        category: "write",
        parameters: [
          { name: "to", type: "string", description: "Recipient email", required: true },
          { name: "subject", type: "string", description: "Email subject", required: true },
          { name: "body", type: "string", description: "Email body", required: true },
        ],
      },
    ],
    stats: {
      totalCalls: 456,
      successRate: 95.2,
      avgLatency: 189,
      uniqueClients: 4,
      lastCalledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: "2024-11-01T11:00:00Z",
    createdBy: "Taylor Chen",
  },
];

// All MCP servers combined
export const allMCPServers: CustomMCPServer[] = [...agentMCPServers, ...customMCPServers];

// Mock tool invocations for testing/history
export const mockToolInvocations: MCPToolInvocation[] = [
  {
    id: "inv-1",
    serverId: "mcp-custom-1",
    toolName: "search_contacts",
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    duration: 234,
    status: "success",
    clientId: "client-cursor-ide",
    input: { query: "john@acme.com", limit: 10 },
    output: { contacts: [{ id: "001", name: "John Doe", email: "john@acme.com" }] },
  },
  {
    id: "inv-2",
    serverId: "mcp-custom-1",
    toolName: "enrich_person",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration: 567,
    status: "success",
    clientId: "client-cursor-ide",
    input: { email: "jane@techcorp.io" },
    output: { name: "Jane Smith", company: "TechCorp", role: "CTO" },
  },
  {
    id: "inv-3",
    serverId: "mcp-custom-2",
    toolName: "create_issue",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 312,
    status: "success",
    clientId: "client-vscode",
    input: { owner: "nexus", repo: "platform", title: "Bug: Login issue" },
    output: { issue_number: 1234, url: "https://github.com/agentictrust/platform/issues/1234" },
  },
  {
    id: "inv-4",
    serverId: "mcp-custom-1",
    toolName: "create_lead",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 1234,
    status: "error",
    clientId: "client-cursor-ide",
    input: { first_name: "Bob", last_name: "Wilson", company: "StartupXYZ" },
    error: "Rate limit exceeded. Please try again in 60 seconds.",
  },
  {
    id: "inv-5",
    serverId: "mcp-agent-1",
    toolName: "enrich_lead",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration: 2345,
    status: "success",
    clientId: "client-claude",
    input: { email: "ceo@bigcompany.com" },
    output: { enriched: true, company_size: "1000+", industry: "Technology" },
  },
];

// Helper function to get available tools from integrations
export function getAvailableIntegrationTools(): SelectedTool[] {
  const tools: SelectedTool[] = [];

  for (const integration of integrationsWithTools) {
    for (const tool of integration.tools) {
      tools.push({
        sourceType: "integration",
        sourceId: integration.id,
        sourceName: integration.name,
        toolName: tool.name,
        toolDescription: tool.description,
        category: tool.category,
        parameters: tool.parameters,
      });
    }
  }

  return tools;
}

// Helper function to get available tools from agents
export function getAvailableAgentTools(): SelectedTool[] {
  const tools: SelectedTool[] = [];

  for (const agent of mockAgents) {
    if (agent.status === "active") {
      // Each agent exposes itself as a single callable tool
      tools.push({
        sourceType: "agent",
        sourceId: agent.id,
        sourceName: agent.name,
        toolName: agent.name.toLowerCase().replace(/\s+/g, "_"),
        toolDescription: agent.description,
        category: "action",
        parameters: [
          { name: "input", type: "string", description: "Input for the agent", required: true },
        ],
      });
    }
  }

  return tools;
}

// Helper function to get all available tools
export function getAllAvailableTools(): SelectedTool[] {
  return [...getAvailableIntegrationTools(), ...getAvailableAgentTools()];
}

// Helper function to get MCP server by ID
export function getMCPServerById(id: string): CustomMCPServer | undefined {
  return allMCPServers.find((server) => server.id === id);
}

// Helper function to get invocations for a server
export function getServerInvocations(serverId: string): MCPToolInvocation[] {
  return mockToolInvocations.filter((inv) => inv.serverId === serverId);
}
