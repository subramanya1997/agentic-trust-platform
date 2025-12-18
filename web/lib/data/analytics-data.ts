// Enhanced analytics data for Agentic Trust platform

import type {
  AgentPerformanceData,
  DailyAgentMetric,
  IntegrationUsageData,
  HourlyUsageData,
  UsageByDayData,
  DailyCostData,
  CostBreakdownItem,
} from "@/lib/types";

// Helper to format date as "Mon DD"
function formatDate(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Seeded random number generator for consistent results per day
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate cost data for a given number of days
function generateCostData(days: number): DailyCostData[] {
  const data: DailyCostData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = formatDate(date);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    // Base values with day-of-week variation (weekends are lower)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseExec = isWeekend ? 500 : 850;
    const baseCost = isWeekend ? 28 : 45;

    // Add randomness
    const randomFactor = 0.8 + seededRandom(seed) * 0.4;

    data.push({
      date: dateStr,
      cost: Math.round(baseCost * randomFactor * 10) / 10,
      executions: Math.round(baseExec * randomFactor),
    });
  }

  return data;
}

// ============ Cost Analytics ============
export const mockCostData7Days = generateCostData(7);
export const mockCostData14Days = generateCostData(14);
export const mockCostData30Days = generateCostData(30);

// For backwards compatibility
export const mockCostData = mockCostData7Days;

// Cost breakdown by model - scales with date range and has random variation
export function getCostBreakdown(range: "7d" | "14d" | "30d"): CostBreakdownItem[] {
  const costData =
    range === "7d" ? mockCostData7Days : range === "14d" ? mockCostData14Days : mockCostData30Days;
  const totalCost = costData.reduce((sum, d) => sum + d.cost, 0);

  // Base percentages with random variation per range
  const seed = range === "7d" ? 200 : range === "14d" ? 210 : 220;

  // Generate random percentages that sum to 100
  const basePercentages = [40, 25, 15, 10, 10];
  const randomizedPercentages = basePercentages.map((base, idx) => {
    const variation = (seededRandom(seed + idx) - 0.5) * 10; // ±5% variation
    return Math.max(5, base + variation);
  });

  // Normalize to sum to 100
  const sum = randomizedPercentages.reduce((a, b) => a + b, 0);
  const normalizedPercentages = randomizedPercentages.map((p) => Math.round((p / sum) * 100));

  // Adjust last one to ensure exact 100
  const currentSum = normalizedPercentages.slice(0, -1).reduce((a, b) => a + b, 0);
  normalizedPercentages[normalizedPercentages.length - 1] = 100 - currentSum;

  const models = ["Sonnet 4.5", "GPT-5.2", "Opus 4.5", "Gemini 3 Pro", "Other Models"];

  return models.map((name, idx) => ({
    name,
    cost: Math.round(totalCost * (normalizedPercentages[idx] / 100) * 10) / 10,
    percentage: normalizedPercentages[idx],
  }));
}

// Default cost breakdown (7 days)
export const mockCostBreakdown: CostBreakdownItem[] = getCostBreakdown("7d");

// Cost by integration
export const mockIntegrationCosts: CostBreakdownItem[] = [
  { name: "Salesforce", cost: 89.5, percentage: 28.7 },
  { name: "Clearbit", cost: 67.2, percentage: 21.5 },
  { name: "Slack", cost: 45.8, percentage: 14.7 },
  { name: "GitHub", cost: 38.4, percentage: 12.3 },
  { name: "Zendesk", cost: 32.1, percentage: 10.3 },
  { name: "Others", cost: 39.0, percentage: 12.5 },
];

// ============ Agent Performance Analytics ============
// Base performance data for 7 days
const baseAgentPerformance: AgentPerformanceData[] = [
  {
    agentId: "agent-1",
    agentName: "Lead Enrichment Agent",
    executions: 1234,
    successRate: 98.5,
    avgDuration: 2340,
    avgCost: 0.052,
    trend: "up",
    trendValue: 5.2,
  },
  {
    agentId: "agent-2",
    agentName: "Customer Support Ticket Router",
    executions: 3456,
    successRate: 99.2,
    avgDuration: 1890,
    avgCost: 0.034,
    trend: "up",
    trendValue: 2.1,
  },
  {
    agentId: "agent-3",
    agentName: "Weekly Report Generator",
    executions: 48,
    successRate: 100,
    avgDuration: 5670,
    avgCost: 0.087,
    trend: "stable",
    trendValue: 0,
  },
  {
    agentId: "agent-4",
    agentName: "Code Review Assistant",
    executions: 892,
    successRate: 97.8,
    avgDuration: 8920,
    avgCost: 0.156,
    trend: "down",
    trendValue: -1.3,
  },
  {
    agentId: "agent-5",
    agentName: "Invoice Processing Agent",
    executions: 234,
    successRate: 94.2,
    avgDuration: 3450,
    avgCost: 0.045,
    trend: "down",
    trendValue: -3.8,
  },
  {
    agentId: "agent-6",
    agentName: "Meeting Notes Summarizer",
    executions: 567,
    successRate: 96.3,
    avgDuration: 4560,
    avgCost: 0.089,
    trend: "up",
    trendValue: 4.5,
  },
  {
    agentId: "agent-7",
    agentName: "Competitor Monitor",
    executions: 180,
    successRate: 100,
    avgDuration: 7890,
    avgCost: 0.12,
    trend: "stable",
    trendValue: 0,
  },
];

export function getAgentPerformance(range: "7d" | "14d" | "30d"): AgentPerformanceData[] {
  const multiplier = range === "7d" ? 1 : range === "14d" ? 2.1 : 4.5;
  const seed = range === "7d" ? 1 : range === "14d" ? 2 : 3;

  return baseAgentPerformance.map((agent, idx) => ({
    ...agent,
    executions: Math.round(agent.executions * multiplier * (0.9 + seededRandom(seed + idx) * 0.2)),
  }));
}

// Default (7 days)
export const mockAgentPerformance = baseAgentPerformance;

// Daily metrics for individual agents (for drill-down)
export const mockAgentDailyMetrics: Record<string, DailyAgentMetric[]> = {
  "agent-1": [
    { date: "Nov 22", executions: 178, success: 175, failed: 3, avgDuration: 2340, cost: 9.26 },
    { date: "Nov 23", executions: 165, success: 163, failed: 2, avgDuration: 2210, cost: 8.58 },
    { date: "Nov 24", executions: 192, success: 189, failed: 3, avgDuration: 2450, cost: 9.98 },
    { date: "Nov 25", executions: 183, success: 180, failed: 3, avgDuration: 2380, cost: 9.52 },
    { date: "Nov 26", executions: 171, success: 169, failed: 2, avgDuration: 2290, cost: 8.89 },
    { date: "Nov 27", executions: 186, success: 184, failed: 2, avgDuration: 2410, cost: 9.67 },
    { date: "Nov 28", executions: 159, success: 156, failed: 3, avgDuration: 2180, cost: 8.27 },
  ],
  "agent-2": [
    { date: "Nov 22", executions: 512, success: 508, failed: 4, avgDuration: 1890, cost: 17.41 },
    { date: "Nov 23", executions: 478, success: 474, failed: 4, avgDuration: 1820, cost: 16.25 },
    { date: "Nov 24", executions: 534, success: 530, failed: 4, avgDuration: 1950, cost: 18.16 },
    { date: "Nov 25", executions: 498, success: 494, failed: 4, avgDuration: 1880, cost: 16.93 },
    { date: "Nov 26", executions: 467, success: 464, failed: 3, avgDuration: 1790, cost: 15.88 },
    { date: "Nov 27", executions: 523, success: 519, failed: 4, avgDuration: 1920, cost: 17.78 },
    { date: "Nov 28", executions: 444, success: 440, failed: 4, avgDuration: 1750, cost: 15.1 },
  ],
};

// ============ Usage Analytics ============
// Base hourly usage for 7 days
const baseHourlyUsage: HourlyUsageData[] = [
  { hour: 0, executions: 45, cost: 2.34 },
  { hour: 1, executions: 32, cost: 1.67 },
  { hour: 2, executions: 28, cost: 1.46 },
  { hour: 3, executions: 21, cost: 1.09 },
  { hour: 4, executions: 18, cost: 0.94 },
  { hour: 5, executions: 24, cost: 1.25 },
  { hour: 6, executions: 56, cost: 2.91 },
  { hour: 7, executions: 89, cost: 4.63 },
  { hour: 8, executions: 145, cost: 7.54 },
  { hour: 9, executions: 234, cost: 12.17 },
  { hour: 10, executions: 312, cost: 16.22 },
  { hour: 11, executions: 287, cost: 14.92 },
  { hour: 12, executions: 198, cost: 10.3 },
  { hour: 13, executions: 267, cost: 13.88 },
  { hour: 14, executions: 298, cost: 15.5 },
  { hour: 15, executions: 276, cost: 14.35 },
  { hour: 16, executions: 243, cost: 12.64 },
  { hour: 17, executions: 187, cost: 9.72 },
  { hour: 18, executions: 134, cost: 6.97 },
  { hour: 19, executions: 98, cost: 5.1 },
  { hour: 20, executions: 76, cost: 3.95 },
  { hour: 21, executions: 67, cost: 3.48 },
  { hour: 22, executions: 54, cost: 2.81 },
  { hour: 23, executions: 48, cost: 2.5 },
];

export function getHourlyUsage(range: "7d" | "14d" | "30d"): HourlyUsageData[] {
  const multiplier = range === "7d" ? 1 : range === "14d" ? 2.1 : 4.5;
  const seed = range === "7d" ? 10 : range === "14d" ? 20 : 30;

  return baseHourlyUsage.map((item, idx) => ({
    ...item,
    executions: Math.round(item.executions * multiplier * (0.9 + seededRandom(seed + idx) * 0.2)),
    cost:
      Math.round(item.cost * multiplier * (0.9 + seededRandom(seed + idx + 100) * 0.2) * 100) / 100,
  }));
}

export const mockHourlyUsage = baseHourlyUsage;

// Base usage by day for 7 days
const baseUsageByDay: UsageByDayData[] = [
  { day: "Monday", executions: 1245, uniqueAgents: 7, uniqueUsers: 12 },
  { day: "Tuesday", executions: 1389, uniqueAgents: 7, uniqueUsers: 14 },
  { day: "Wednesday", executions: 1456, uniqueAgents: 7, uniqueUsers: 15 },
  { day: "Thursday", executions: 1378, uniqueAgents: 7, uniqueUsers: 13 },
  { day: "Friday", executions: 1234, uniqueAgents: 7, uniqueUsers: 12 },
  { day: "Saturday", executions: 456, uniqueAgents: 4, uniqueUsers: 3 },
  { day: "Sunday", executions: 312, uniqueAgents: 3, uniqueUsers: 2 },
];

export function getUsageByDay(range: "7d" | "14d" | "30d"): UsageByDayData[] {
  const multiplier = range === "7d" ? 1 : range === "14d" ? 2.1 : 4.5;
  const seed = range === "7d" ? 50 : range === "14d" ? 60 : 70;

  return baseUsageByDay.map((item, idx) => ({
    ...item,
    executions: Math.round(item.executions * multiplier * (0.9 + seededRandom(seed + idx) * 0.2)),
  }));
}

export const mockUsageByDay = baseUsageByDay;

// ============ Integration Analytics ============
// Base integration usage for 7 days
const baseIntegrationUsage: IntegrationUsageData[] = [
  {
    integrationId: "salesforce",
    integrationName: "Salesforce",
    callCount: 4567,
    avgLatency: 234,
    errorRate: 0.8,
    cost: 89.5,
    agentsUsing: 3,
  },
  {
    integrationId: "slack",
    integrationName: "Slack",
    callCount: 8934,
    avgLatency: 87,
    errorRate: 0.2,
    cost: 45.8,
    agentsUsing: 5,
  },
  {
    integrationId: "clearbit",
    integrationName: "Clearbit",
    callCount: 2345,
    avgLatency: 456,
    errorRate: 1.5,
    cost: 67.2,
    agentsUsing: 2,
  },
  {
    integrationId: "github",
    integrationName: "GitHub",
    callCount: 3456,
    avgLatency: 189,
    errorRate: 0.5,
    cost: 38.4,
    agentsUsing: 2,
  },
  {
    integrationId: "zendesk",
    integrationName: "Zendesk",
    callCount: 5678,
    avgLatency: 167,
    errorRate: 0.3,
    cost: 32.1,
    agentsUsing: 1,
  },
  {
    integrationId: "notion",
    integrationName: "Notion",
    callCount: 2134,
    avgLatency: 145,
    errorRate: 0.4,
    cost: 18.5,
    agentsUsing: 4,
  },
  {
    integrationId: "linear",
    integrationName: "Linear",
    callCount: 1234,
    avgLatency: 112,
    errorRate: 0.1,
    cost: 12.3,
    agentsUsing: 2,
  },
  {
    integrationId: "zoom",
    integrationName: "Zoom",
    callCount: 567,
    avgLatency: 234,
    errorRate: 0.6,
    cost: 8.9,
    agentsUsing: 1,
  },
];

export function getIntegrationUsage(range: "7d" | "14d" | "30d"): IntegrationUsageData[] {
  const multiplier = range === "7d" ? 1 : range === "14d" ? 2.1 : 4.5;
  const seed = range === "7d" ? 80 : range === "14d" ? 90 : 100;

  return baseIntegrationUsage.map((item, idx) => ({
    ...item,
    callCount: Math.round(item.callCount * multiplier * (0.9 + seededRandom(seed + idx) * 0.2)),
    cost:
      Math.round(item.cost * multiplier * (0.9 + seededRandom(seed + idx + 50) * 0.2) * 10) / 10,
  }));
}

export const mockIntegrationUsage = baseIntegrationUsage;

// ============ Summary Statistics ============
export function getAnalyticsSummary(range: "7d" | "14d" | "30d") {
  const costData =
    range === "7d" ? mockCostData7Days : range === "14d" ? mockCostData14Days : mockCostData30Days;
  const totalCost = costData.reduce((sum, d) => sum + d.cost, 0);
  const totalExecutions = costData.reduce((sum, d) => sum + d.executions, 0);

  const integrationUsage = getIntegrationUsage(range);
  const totalApiCalls = integrationUsage.reduce((sum, i) => sum + i.callCount, 0);

  return {
    // Cost summary
    totalCost: Math.round(totalCost * 10) / 10,
    costChange: -5.2,
    costPerExecution: Math.round((totalCost / totalExecutions) * 1000) / 1000,
    projectedMonthly:
      Math.round((totalCost / (range === "7d" ? 7 : range === "14d" ? 14 : 30)) * 30 * 10) / 10,

    // Performance summary
    avgSuccessRate: 97.4,
    avgDuration: 3890,
    totalExecutions,
    executionChange: 8.3,

    // Usage summary
    peakHour: 10,
    peakDay: "Wednesday",
    activeAgents: 6,
    totalAgents: 7,

    // Integration summary
    totalApiCalls,
    avgLatency: 178,
    overallErrorRate: 0.54,
  };
}

// Default summary (7 days)
export const mockAnalyticsSummary = getAnalyticsSummary("7d");

// Helper to get cost data based on date range
export function getAnalyticsData(range: "7d" | "14d" | "30d") {
  switch (range) {
    case "7d":
      return mockCostData7Days;
    case "14d":
      return mockCostData14Days;
    case "30d":
      return mockCostData30Days;
    default:
      return mockCostData7Days;
  }
}
