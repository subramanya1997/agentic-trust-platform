// Webhooks data and types for Agentic Trust platform

// ============ Webhook Types ============
export type WebhookStatus = "active" | "inactive";
export type WebhookAuthType = "none" | "hmac" | "bearer" | "basic";
export type DeliveryStatus = "success" | "failed" | "pending" | "retrying";

export interface WebhookSecurity {
  authType: WebhookAuthType;
  hmacSecret?: string;
  hmacAlgorithm?: "sha256" | "sha512";
  bearerToken?: string;
  basicAuth?: { username: string; password: string };
  ipAllowlist?: string[];
  rateLimitPerMinute?: number;
}

export interface WebhookTransformRule {
  id: string;
  sourcePath: string;
  targetPath: string;
  transform?: "uppercase" | "lowercase" | "trim" | "parse_json" | "stringify";
}

export interface WebhookRoutingCondition {
  id: string;
  field: string;
  operator: "equals" | "contains" | "starts_with" | "ends_with" | "regex" | "exists";
  value: string;
  targetAgentId: string;
  targetAgentName: string;
}

export interface Webhook {
  id: string;
  name: string;
  description: string;
  url: string;
  targetAgentId: string;
  targetAgentName: string;
  status: WebhookStatus;
  createdAt: string;
  lastTriggered?: string;
  totalDeliveries: number;
  successRate: number;
  security: WebhookSecurity;
  transformRules: WebhookTransformRule[];
  routingConditions: WebhookRoutingCondition[];
  headers?: Record<string, string>;
  retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
    exponentialBackoff: boolean;
  };
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  webhookName: string;
  status: DeliveryStatus;
  timestamp: string;
  duration: number; // ms
  requestPayload: Record<string, unknown>;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  retryCount: number;
  targetAgentId: string;
  targetAgentName: string;
  executionId?: string;
  sourceIp: string;
}

// ============ Mock Webhooks ============
export const mockWebhooks: Webhook[] = [
  {
    id: "wh-1",
    name: "Salesforce Lead Created",
    description: "Triggered when a new lead is created in Salesforce",
    url: "https://api.agentictrust.com/webhooks/wh-1",
    targetAgentId: "agent-1",
    targetAgentName: "Lead Enrichment Agent",
    status: "active",
    createdAt: "2024-10-15T10:30:00Z",
    lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    totalDeliveries: 1234,
    successRate: 99.2,
    security: {
      authType: "hmac",
      hmacSecret: "whsec_abc123def456...",
      hmacAlgorithm: "sha256",
      ipAllowlist: ["52.89.214.238", "52.89.214.239"],
      rateLimitPerMinute: 100,
    },
    transformRules: [
      { id: "tr-1", sourcePath: "$.lead.email", targetPath: "$.input.email" },
      { id: "tr-2", sourcePath: "$.lead.company", targetPath: "$.input.company_name" },
    ],
    routingConditions: [],
    headers: {
      "X-Source": "salesforce",
    },
    retryConfig: {
      maxRetries: 3,
      retryDelayMs: 1000,
      exponentialBackoff: true,
    },
  },
  {
    id: "wh-2",
    name: "GitHub PR Opened",
    description: "Triggered when a pull request is opened or updated",
    url: "https://api.agentictrust.com/webhooks/wh-2",
    targetAgentId: "agent-4",
    targetAgentName: "Code Review Assistant",
    status: "active",
    createdAt: "2024-09-20T14:15:00Z",
    lastTriggered: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    totalDeliveries: 892,
    successRate: 98.5,
    security: {
      authType: "hmac",
      hmacSecret: "whsec_github_xyz789...",
      hmacAlgorithm: "sha256",
      rateLimitPerMinute: 50,
    },
    transformRules: [
      { id: "tr-3", sourcePath: "$.pull_request.number", targetPath: "$.input.pr_number" },
      { id: "tr-4", sourcePath: "$.pull_request.head.sha", targetPath: "$.input.commit_sha" },
      { id: "tr-5", sourcePath: "$.repository.full_name", targetPath: "$.input.repo" },
    ],
    routingConditions: [],
    headers: {
      "X-GitHub-Event": "pull_request",
    },
    retryConfig: {
      maxRetries: 5,
      retryDelayMs: 2000,
      exponentialBackoff: true,
    },
  },
  {
    id: "wh-3",
    name: "Zendesk Ticket Created",
    description: "Routes new support tickets to the appropriate agent",
    url: "https://api.agentictrust.com/webhooks/wh-3",
    targetAgentId: "agent-2",
    targetAgentName: "Customer Support Ticket Router",
    status: "active",
    createdAt: "2024-08-10T09:00:00Z",
    lastTriggered: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    totalDeliveries: 3456,
    successRate: 99.8,
    security: {
      authType: "bearer",
      bearerToken: "zd_token_abc...",
      rateLimitPerMinute: 200,
    },
    transformRules: [
      { id: "tr-6", sourcePath: "$.ticket.subject", targetPath: "$.input.subject" },
      { id: "tr-7", sourcePath: "$.ticket.description", targetPath: "$.input.body" },
      { id: "tr-8", sourcePath: "$.ticket.requester.email", targetPath: "$.input.customer_email" },
    ],
    routingConditions: [
      {
        id: "rc-1",
        field: "$.ticket.tags",
        operator: "contains",
        value: "billing",
        targetAgentId: "agent-billing",
        targetAgentName: "Billing Support Agent",
      },
      {
        id: "rc-2",
        field: "$.ticket.tags",
        operator: "contains",
        value: "technical",
        targetAgentId: "agent-tech",
        targetAgentName: "Technical Support Agent",
      },
    ],
    headers: {},
    retryConfig: {
      maxRetries: 3,
      retryDelayMs: 1000,
      exponentialBackoff: false,
    },
  },
  {
    id: "wh-4",
    name: "Stripe Payment Received",
    description: "Processes incoming payment notifications",
    url: "https://api.agentictrust.com/webhooks/wh-4",
    targetAgentId: "agent-5",
    targetAgentName: "Invoice Processing Agent",
    status: "inactive",
    createdAt: "2024-11-01T11:20:00Z",
    lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalDeliveries: 234,
    successRate: 94.5,
    security: {
      authType: "hmac",
      hmacSecret: "whsec_stripe_...",
      hmacAlgorithm: "sha256",
      ipAllowlist: ["3.18.12.63", "3.130.192.231"],
      rateLimitPerMinute: 100,
    },
    transformRules: [
      { id: "tr-9", sourcePath: "$.data.object.amount", targetPath: "$.input.amount" },
      { id: "tr-10", sourcePath: "$.data.object.currency", targetPath: "$.input.currency" },
    ],
    routingConditions: [],
    headers: {},
    retryConfig: {
      maxRetries: 5,
      retryDelayMs: 5000,
      exponentialBackoff: true,
    },
  },
  {
    id: "wh-5",
    name: "Zoom Recording Ready",
    description: "Triggered when a meeting recording is available",
    url: "https://api.agentictrust.com/webhooks/wh-5",
    targetAgentId: "agent-6",
    targetAgentName: "Meeting Notes Summarizer",
    status: "active",
    createdAt: "2024-10-25T08:30:00Z",
    lastTriggered: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    totalDeliveries: 567,
    successRate: 97.2,
    security: {
      authType: "bearer",
      bearerToken: "zoom_token_...",
      rateLimitPerMinute: 20,
    },
    transformRules: [
      {
        id: "tr-11",
        sourcePath: "$.payload.object.recording_files[0].download_url",
        targetPath: "$.input.recording_url",
      },
      { id: "tr-12", sourcePath: "$.payload.object.topic", targetPath: "$.input.meeting_title" },
    ],
    routingConditions: [],
    headers: {
      "X-Zoom-Event": "recording.completed",
    },
    retryConfig: {
      maxRetries: 3,
      retryDelayMs: 10000,
      exponentialBackoff: true,
    },
  },
  {
    id: "wh-6",
    name: "Linear Issue Updated",
    description: "Syncs Linear issue updates with other systems",
    url: "https://api.agentictrust.com/webhooks/wh-6",
    targetAgentId: "agent-4",
    targetAgentName: "Code Review Assistant",
    status: "active",
    createdAt: "2024-11-10T16:45:00Z",
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    totalDeliveries: 189,
    successRate: 100,
    security: {
      authType: "hmac",
      hmacSecret: "linear_secret_...",
      hmacAlgorithm: "sha256",
      rateLimitPerMinute: 60,
    },
    transformRules: [],
    routingConditions: [],
    headers: {},
    retryConfig: {
      maxRetries: 3,
      retryDelayMs: 1000,
      exponentialBackoff: true,
    },
  },
];

// ============ Mock Webhook Deliveries ============
export const mockWebhookDeliveries: WebhookDelivery[] = [
  {
    id: "del-1",
    webhookId: "wh-1",
    webhookName: "Salesforce Lead Created",
    status: "success",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 245,
    requestPayload: {
      lead: {
        id: "lead-123",
        email: "john@acme.com",
        company: "Acme Corp",
        name: "John Smith",
      },
    },
    responseStatus: 200,
    responseBody: '{"status": "accepted", "executionId": "exec-abc123"}',
    retryCount: 0,
    targetAgentId: "agent-1",
    targetAgentName: "Lead Enrichment Agent",
    executionId: "exec-abc123",
    sourceIp: "52.89.214.238",
  },
  {
    id: "del-2",
    webhookId: "wh-2",
    webhookName: "GitHub PR Opened",
    status: "success",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration: 189,
    requestPayload: {
      action: "opened",
      pull_request: {
        number: 142,
        title: "feat: Add new authentication flow",
        head: { sha: "abc123def" },
      },
      repository: { full_name: "acme/web-app" },
    },
    responseStatus: 200,
    responseBody: '{"status": "accepted"}',
    retryCount: 0,
    targetAgentId: "agent-4",
    targetAgentName: "Code Review Assistant",
    executionId: "exec-def456",
    sourceIp: "192.30.252.41",
  },
  {
    id: "del-3",
    webhookId: "wh-3",
    webhookName: "Zendesk Ticket Created",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: 156,
    requestPayload: {
      ticket: {
        id: "ticket-789",
        subject: "Cannot access my account",
        description: "I've been locked out of my account...",
        requester: { email: "customer@example.com" },
        tags: ["technical", "urgent"],
      },
    },
    responseStatus: 200,
    responseBody: '{"status": "accepted", "routed_to": "Technical Support Agent"}',
    retryCount: 0,
    targetAgentId: "agent-2",
    targetAgentName: "Customer Support Ticket Router",
    executionId: "exec-ghi789",
    sourceIp: "104.16.53.111",
  },
  {
    id: "del-4",
    webhookId: "wh-1",
    webhookName: "Salesforce Lead Created",
    status: "failed",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    duration: 5234,
    requestPayload: {
      lead: {
        id: "lead-456",
        email: "invalid-email",
        company: "Test Corp",
      },
    },
    responseStatus: 422,
    responseBody: '{"error": "Invalid email format"}',
    error: "Validation failed: Invalid email format",
    retryCount: 3,
    targetAgentId: "agent-1",
    targetAgentName: "Lead Enrichment Agent",
    sourceIp: "52.89.214.238",
  },
  {
    id: "del-5",
    webhookId: "wh-5",
    webhookName: "Zoom Recording Ready",
    status: "success",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration: 312,
    requestPayload: {
      event: "recording.completed",
      payload: {
        object: {
          topic: "Weekly Team Sync",
          recording_files: [{ download_url: "https://zoom.us/rec/..." }],
        },
      },
    },
    responseStatus: 200,
    responseBody: '{"status": "accepted"}',
    retryCount: 0,
    targetAgentId: "agent-6",
    targetAgentName: "Meeting Notes Summarizer",
    executionId: "exec-jkl012",
    sourceIp: "3.21.137.128",
  },
  {
    id: "del-6",
    webhookId: "wh-4",
    webhookName: "Stripe Payment Received",
    status: "failed",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 30000,
    requestPayload: {
      type: "payment_intent.succeeded",
      data: {
        object: {
          amount: 9900,
          currency: "usd",
        },
      },
    },
    responseStatus: 503,
    error: "Agent unavailable: Invoice Processing Agent is paused",
    retryCount: 5,
    targetAgentId: "agent-5",
    targetAgentName: "Invoice Processing Agent",
    sourceIp: "3.18.12.63",
  },
  {
    id: "del-7",
    webhookId: "wh-2",
    webhookName: "GitHub PR Opened",
    status: "retrying",
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    duration: 2500,
    requestPayload: {
      action: "synchronize",
      pull_request: {
        number: 143,
        title: "fix: Memory leak in worker",
        head: { sha: "xyz789abc" },
      },
      repository: { full_name: "acme/backend" },
    },
    responseStatus: 429,
    error: "Rate limit exceeded, retrying in 30s",
    retryCount: 1,
    targetAgentId: "agent-4",
    targetAgentName: "Code Review Assistant",
    sourceIp: "192.30.252.42",
  },
  {
    id: "del-8",
    webhookId: "wh-6",
    webhookName: "Linear Issue Updated",
    status: "success",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration: 178,
    requestPayload: {
      action: "update",
      data: {
        id: "issue-abc",
        title: "Implement user dashboard",
        state: { name: "In Progress" },
      },
    },
    responseStatus: 200,
    responseBody: '{"status": "accepted"}',
    retryCount: 0,
    targetAgentId: "agent-4",
    targetAgentName: "Code Review Assistant",
    executionId: "exec-mno345",
    sourceIp: "35.190.247.13",
  },
];

// Helper functions
export function getWebhookById(id: string): Webhook | undefined {
  return mockWebhooks.find((w) => w.id === id);
}

export function getWebhookDeliveries(webhookId: string): WebhookDelivery[] {
  return mockWebhookDeliveries.filter((d) => d.webhookId === webhookId);
}

export function getRecentDeliveries(limit: number = 10): WebhookDelivery[] {
  return [...mockWebhookDeliveries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
