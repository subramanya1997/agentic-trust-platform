// Triggers data for Agentic Trust platform
import type { AgentTrigger } from "@/lib/types";

export const mockTriggers: AgentTrigger[] = [
  // Lead Enrichment Agent triggers
  {
    id: "trigger-1",
    type: "webhook",
    name: "Salesforce Lead Created",
    agentId: "agent-1",
    agentName: "Lead Enrichment Agent",
    enabled: true,
    createdAt: "2024-10-15T10:30:00Z",
    config: {
      webhookId: "wh-1",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-1",
      authType: "hmac",
    },
    lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    triggerCount: 1234,
  },
  {
    id: "trigger-2",
    type: "api",
    name: "Manual API Trigger",
    agentId: "agent-1",
    agentName: "Lead Enrichment Agent",
    enabled: true,
    createdAt: "2024-10-20T14:00:00Z",
    config: {
      endpoint: "/api/agents/agent-1/run",
      method: "POST",
      apiKeyRequired: true,
    },
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    triggerCount: 89,
  },

  // Customer Support Ticket Router triggers
  {
    id: "trigger-3",
    type: "webhook",
    name: "Zendesk Ticket Created",
    agentId: "agent-2",
    agentName: "Customer Support Ticket Router",
    enabled: true,
    createdAt: "2024-08-10T09:00:00Z",
    config: {
      webhookId: "wh-3",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-3",
      authType: "bearer",
    },
    lastTriggered: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    triggerCount: 3456,
  },

  // Weekly Report Generator triggers
  {
    id: "trigger-4",
    type: "scheduled",
    name: "Weekly Monday Report",
    agentId: "agent-3",
    agentName: "Weekly Report Generator",
    enabled: true,
    createdAt: "2024-10-01T09:00:00Z",
    config: {
      cronExpression: "0 8 * * 1",
      timezone: "America/New_York",
      nextRunAt: getNextMonday8AM(),
      lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 48,
  },

  // Code Review Assistant triggers
  {
    id: "trigger-5",
    type: "webhook",
    name: "GitHub PR Opened",
    agentId: "agent-4",
    agentName: "Code Review Assistant",
    enabled: true,
    createdAt: "2024-09-20T14:15:00Z",
    config: {
      webhookId: "wh-2",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-2",
      authType: "hmac",
    },
    lastTriggered: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    triggerCount: 892,
  },
  {
    id: "trigger-6",
    type: "webhook",
    name: "Linear Issue Updated",
    agentId: "agent-4",
    agentName: "Code Review Assistant",
    enabled: true,
    createdAt: "2024-11-10T16:45:00Z",
    config: {
      webhookId: "wh-6",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-6",
      authType: "hmac",
    },
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    triggerCount: 189,
  },

  // Invoice Processing Agent triggers
  {
    id: "trigger-7",
    type: "webhook",
    name: "Stripe Payment Received",
    agentId: "agent-5",
    agentName: "Invoice Processing Agent",
    enabled: false,
    createdAt: "2024-11-01T11:20:00Z",
    config: {
      webhookId: "wh-4",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-4",
      authType: "hmac",
    },
    lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 234,
  },
  {
    id: "trigger-8",
    type: "scheduled",
    name: "Daily Invoice Check",
    agentId: "agent-5",
    agentName: "Invoice Processing Agent",
    enabled: false,
    createdAt: "2024-11-05T10:00:00Z",
    config: {
      cronExpression: "0 9 * * *",
      timezone: "America/New_York",
      nextRunAt: getNextDay9AM(),
      lastRunAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 12,
  },

  // Meeting Notes Summarizer triggers
  {
    id: "trigger-9",
    type: "webhook",
    name: "Zoom Recording Ready",
    agentId: "agent-6",
    agentName: "Meeting Notes Summarizer",
    enabled: true,
    createdAt: "2024-10-25T08:30:00Z",
    config: {
      webhookId: "wh-5",
      webhookUrl: "https://api.agentictrust.com/webhooks/wh-5",
      authType: "bearer",
    },
    lastTriggered: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    triggerCount: 567,
  },

  // Competitor Monitor triggers
  {
    id: "trigger-10",
    type: "scheduled",
    name: "Daily Competitor Check",
    agentId: "agent-7",
    agentName: "Competitor Monitor",
    enabled: true,
    createdAt: "2024-09-28T13:00:00Z",
    config: {
      cronExpression: "0 6 * * *",
      timezone: "America/New_York",
      nextRunAt: getNextDay6AM(),
      lastRunAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    lastTriggered: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    triggerCount: 180,
  },
];

// Helper functions
function getNextMonday8AM(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(8, 0, 0, 0);
  return nextMonday.toISOString();
}

function getNextDay9AM(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString();
}

function getNextDay6AM(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);
  return tomorrow.toISOString();
}

export function getTriggersByAgentId(agentId: string): AgentTrigger[] {
  return mockTriggers.filter((t) => t.agentId === agentId);
}

export function getTriggersByType(type: AgentTrigger["type"]): AgentTrigger[] {
  return mockTriggers.filter((t) => t.type === type);
}

export function getActiveTriggers(): AgentTrigger[] {
  return mockTriggers.filter((t) => t.enabled);
}

export function parseCronExpression(cron: string): string {
  // Simple cron parser for common patterns
  const parts = cron.split(" ");
  if (parts.length !== 5) {
    return cron;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Daily at specific time
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Daily at ${hour}:${minute.padStart(2, "0")}`;
  }

  // Weekly on specific day
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[parseInt(dayOfWeek)] || dayOfWeek;
    return `Every ${dayName} at ${hour}:${minute.padStart(2, "0")}`;
  }

  // Monthly on specific day
  if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
    return `Monthly on day ${dayOfMonth} at ${hour}:${minute.padStart(2, "0")}`;
  }

  return cron;
}
