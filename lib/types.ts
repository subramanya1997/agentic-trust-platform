// Centralized TypeScript types for Agentic Trust platform

// ============ Agent Types ============
export type AgentStatus = "active" | "paused" | "deprecated";
export type ExecutionStatus = "completed" | "failed" | "running" | "waiting_approval";
export type StepType = "trigger" | "llm_call" | "api_call" | "conditional" | "human_approval";

export interface AgentIntegration {
  name: string;
  type: "API" | "MCP";
  connected: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  createdBy: string;
  version: string;
  executionCount: number;
  successRate: number;
  avgCost: number;
  lastRun: string;
  createdAt: string;
  model: string;
  integrations: AgentIntegration[];
  goal: string;
  instructions: string[];
}

// ============ Execution Types ============
export interface ExecutionStep {
  id: string;
  name: string;
  type: StepType;
  status: ExecutionStatus;
  duration: number;
  cost: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface Execution {
  id: string;
  agentId: string;
  agentName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration: number;
  cost: number;
  steps: ExecutionStep[];
  traceId: string;
}

// ============ Analytics Types ============
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  successRate: number;
  totalCost: number;
  avgResponseTime: number;
}

export interface DailyCostData {
  date: string;
  cost: number;
  executions: number;
}

export interface CostBreakdownItem {
  name: string;
  cost: number;
  percentage: number;
}

export interface AgentPerformanceData {
  agentId: string;
  agentName: string;
  executions: number;
  successRate: number;
  avgDuration: number;
  avgCost: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface DailyAgentMetric {
  date: string;
  executions: number;
  success: number;
  failed: number;
  avgDuration: number;
  cost: number;
}

export interface IntegrationUsageData {
  integrationId: string;
  integrationName: string;
  callCount: number;
  avgLatency: number;
  errorRate: number;
  cost: number;
  agentsUsing: number;
}

export interface HourlyUsageData {
  hour: number;
  executions: number;
  cost: number;
}

export interface UsageByDayData {
  day: string;
  executions: number;
  uniqueAgents: number;
  uniqueUsers: number;
}

// ============ Integration Types ============
export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "API" | "MCP";
  connected: boolean;
  usageCount?: number;
}

// ============ Policy Types ============
export type PolicyType = "rate_limit" | "authentication" | "cost_limit" | "security";
export type PolicyScope = "organization" | "team" | "agent";
export type PolicyStatus = "active" | "inactive";

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  scope: PolicyScope;
  status: PolicyStatus;
  description: string;
  appliesTo: string;
  createdAt: string;
}

// ============ Date Range Types ============
export type DateRangePreset = "7d" | "14d" | "30d" | "90d" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
}

// ============ Activity & Trace Types ============
export type TraceStepType =
  | "trigger"
  | "llm_call"
  | "api_call"
  | "conditional"
  | "human_approval"
  | "transform";
export type TraceStepStatus = "completed" | "failed" | "running" | "skipped" | "waiting";
export type ActivityEventType =
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "tool_called"
  | "approval_requested"
  | "approval_granted"
  | "approval_denied"
  | "error_occurred"
  | "agent_created"
  | "agent_updated"
  | "integration_connected"
  | "integration_disconnected";

export interface TraceStep {
  id: string;
  name: string;
  type: TraceStepType;
  status: TraceStepStatus;
  startOffset: number; // ms from execution start
  duration: number; // ms
  cost: number;
  integration?: string;
  model?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  tokens?: {
    input: number;
    output: number;
  };
  children?: TraceStep[];
}

export interface ExecutionTrace {
  id: string;
  agentId: string;
  agentName: string;
  status: "completed" | "failed" | "running";
  triggeredBy: string;
  triggerType: "manual" | "scheduled" | "webhook" | "api";
  startedAt: string;
  completedAt?: string;
  duration: number;
  totalCost: number;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  steps: TraceStep[];
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  executionId?: string;
  userId: string;
  userName: string;
  details: Record<string, unknown>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    region?: string;
  };
}

// ============ Trigger Types ============
export type TriggerType = "webhook" | "scheduled" | "api";
export type TriggerStatus = "active" | "inactive";

export interface WebhookTriggerConfig {
  webhookId: string;
  webhookUrl: string;
  authType: "none" | "hmac" | "bearer" | "basic";
}

export interface ScheduledTriggerConfig {
  cronExpression: string;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
}

export interface ApiTriggerConfig {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  apiKeyRequired: boolean;
}

export type TriggerConfig = WebhookTriggerConfig | ScheduledTriggerConfig | ApiTriggerConfig;

export interface AgentTrigger {
  id: string;
  type: TriggerType;
  name: string;
  agentId: string;
  agentName: string;
  enabled: boolean;
  createdAt: string;
  config: TriggerConfig;
  lastTriggered?: string;
  triggerCount: number;
}

// ============ Extended Agent Types ============
export interface ExtendedAgent extends Agent {
  triggers: AgentTrigger[];
  mcpConfig?: MCPServerConfig;
}

// ============ MCP Server Types ============
export interface MCPServerConfig {
  enabled: boolean;
  serverUrl?: string;
  toolName: string;
  toolDescription: string;
  authRequired: boolean;
  authType?: "api_key" | "oauth2" | "none";
  rateLimitPerMinute?: number;
  allowedOrigins?: string[];
}

export interface MCPServerStats {
  agentId: string;
  totalCalls: number;
  successRate: number;
  avgLatency: number;
  uniqueClients: number;
  lastCalledAt?: string;
}

// ============ Custom MCP Server Types ============
export type MCPServerType = "agent" | "custom";
export type MCPAuthType = "api_key" | "oauth2" | "none";

export interface SelectedTool {
  sourceType: "integration" | "agent";
  sourceId: string;
  sourceName: string;
  toolName: string;
  toolDescription: string;
  category: "read" | "write" | "action";
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface CustomMCPServer {
  id: string;
  name: string;
  description: string;
  serverUrl: string;
  type: MCPServerType;
  authType: MCPAuthType;
  rateLimitPerMinute?: number;
  selectedTools: SelectedTool[];
  stats: {
    totalCalls: number;
    successRate: number;
    avgLatency: number;
    uniqueClients: number;
    lastCalledAt?: string;
  };
  createdAt: string;
  createdBy: string;
}

export interface MCPToolInvocation {
  id: string;
  serverId: string;
  toolName: string;
  timestamp: string;
  duration: number;
  status: "success" | "error";
  clientId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}
