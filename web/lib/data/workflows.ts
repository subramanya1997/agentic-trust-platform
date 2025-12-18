// Workflow templates for agent builder

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "support" | "marketing" | "devops" | "finance";
  icon: string;
  estimatedCost: number;
  steps: WorkflowStep[];
  requiredConnections: string[];
  usageCount: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type:
    | "trigger"
    | "llm_call"
    | "api_call"
    | "conditional"
    | "human_approval"
    | "loop"
    | "transform";
  icon: string;
  description: string;
  estimatedCost: number;
  estimatedDuration: number;
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "template-1",
    name: "Lead Enrichment",
    description: "Automatically enrich new leads with company data from external sources",
    category: "sales",
    icon: "🎯",
    estimatedCost: 0.05,
    usageCount: 1234,
    requiredConnections: ["Salesforce", "Clearbit"],
    steps: [
      {
        id: "step-1",
        name: "New Lead Trigger",
        type: "trigger",
        icon: "⚡",
        description: "Triggered when a new lead is created in Salesforce",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-2",
        name: "Extract Contact Info",
        type: "llm_call",
        icon: "🤖",
        description: "Use GPT-4 to extract and normalize contact information",
        estimatedCost: 0.002,
        estimatedDuration: 300,
      },
      {
        id: "step-3",
        name: "Enrich with Clearbit",
        type: "api_call",
        icon: "🔗",
        description: "Fetch company information and social profiles",
        estimatedCost: 0.045,
        estimatedDuration: 800,
      },
      {
        id: "step-4",
        name: "Update Salesforce",
        type: "api_call",
        icon: "✅",
        description: "Update lead record with enriched data",
        estimatedCost: 0.002,
        estimatedDuration: 150,
      },
    ],
  },
  {
    id: "template-2",
    name: "Support Ticket Router",
    description: "Automatically categorize and route support tickets to the right team",
    category: "support",
    icon: "🎫",
    estimatedCost: 0.03,
    usageCount: 892,
    requiredConnections: ["Zendesk", "Slack"],
    steps: [
      {
        id: "step-1",
        name: "New Ticket Webhook",
        type: "trigger",
        icon: "⚡",
        description: "Triggered when a new ticket is created",
        estimatedCost: 0.001,
        estimatedDuration: 40,
      },
      {
        id: "step-2",
        name: "Analyze Ticket Content",
        type: "llm_call",
        icon: "🤖",
        description: "Classify ticket category and urgency using AI",
        estimatedCost: 0.025,
        estimatedDuration: 450,
      },
      {
        id: "step-3",
        name: "Route to Team",
        type: "conditional",
        icon: "🔀",
        description: "Route based on category to appropriate team",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-4",
        name: "Notify Team in Slack",
        type: "api_call",
        icon: "💬",
        description: "Send notification to assigned team channel",
        estimatedCost: 0.003,
        estimatedDuration: 200,
      },
    ],
  },
  {
    id: "template-3",
    name: "Code Review Assistant",
    description: "Automatically review pull requests and provide feedback",
    category: "devops",
    icon: "👨‍💻",
    estimatedCost: 0.15,
    usageCount: 567,
    requiredConnections: ["GitHub"],
    steps: [
      {
        id: "step-1",
        name: "Pull Request Opened",
        type: "trigger",
        icon: "⚡",
        description: "Triggered when a new PR is opened",
        estimatedCost: 0.001,
        estimatedDuration: 60,
      },
      {
        id: "step-2",
        name: "Fetch Code Changes",
        type: "api_call",
        icon: "📥",
        description: "Get diff and changed files from GitHub",
        estimatedCost: 0.005,
        estimatedDuration: 300,
      },
      {
        id: "step-3",
        name: "AI Code Analysis",
        type: "llm_call",
        icon: "🤖",
        description: "Analyze code for bugs, security issues, and best practices",
        estimatedCost: 0.14,
        estimatedDuration: 5000,
      },
      {
        id: "step-4",
        name: "Post Review Comments",
        type: "api_call",
        icon: "💭",
        description: "Add inline comments to the pull request",
        estimatedCost: 0.004,
        estimatedDuration: 250,
      },
    ],
  },
  {
    id: "template-4",
    name: "Invoice Processing",
    description: "Extract data from invoices and update accounting system",
    category: "finance",
    icon: "💰",
    estimatedCost: 0.08,
    usageCount: 445,
    requiredConnections: ["Gmail", "QuickBooks"],
    steps: [
      {
        id: "step-1",
        name: "Email with Attachment",
        type: "trigger",
        icon: "📧",
        description: "Triggered when invoice email received",
        estimatedCost: 0.001,
        estimatedDuration: 100,
      },
      {
        id: "step-2",
        name: "Extract Invoice Data",
        type: "llm_call",
        icon: "🤖",
        description: "OCR and extract fields using GPT-4 Vision",
        estimatedCost: 0.055,
        estimatedDuration: 2000,
      },
      {
        id: "step-3",
        name: "Validate Data",
        type: "conditional",
        icon: "✓",
        description: "Check if all required fields are present",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-4",
        name: "Request Approval",
        type: "human_approval",
        icon: "👤",
        description: "Send to manager for approval if amount > $1000",
        estimatedCost: 0,
        estimatedDuration: 0,
      },
      {
        id: "step-5",
        name: "Create in QuickBooks",
        type: "api_call",
        icon: "📊",
        description: "Create invoice entry in accounting system",
        estimatedCost: 0.003,
        estimatedDuration: 300,
      },
    ],
  },
  {
    id: "template-5",
    name: "Social Media Monitor",
    description: "Monitor brand mentions and sentiment across social platforms",
    category: "marketing",
    icon: "📱",
    estimatedCost: 0.12,
    usageCount: 723,
    requiredConnections: ["Twitter", "Slack"],
    steps: [
      {
        id: "step-1",
        name: "Scheduled Scan",
        type: "trigger",
        icon: "⏰",
        description: "Run every 15 minutes",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-2",
        name: "Search Social Media",
        type: "api_call",
        icon: "🔍",
        description: "Search for brand mentions",
        estimatedCost: 0.01,
        estimatedDuration: 800,
      },
      {
        id: "step-3",
        name: "Analyze Sentiment",
        type: "llm_call",
        icon: "😊",
        description: "Determine sentiment and urgency",
        estimatedCost: 0.08,
        estimatedDuration: 1500,
      },
      {
        id: "step-4",
        name: "Alert on Negative",
        type: "conditional",
        icon: "🚨",
        description: "Send alert if negative sentiment detected",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-5",
        name: "Post to Slack",
        type: "api_call",
        icon: "💬",
        description: "Notify team in Slack channel",
        estimatedCost: 0.003,
        estimatedDuration: 200,
      },
    ],
  },
  {
    id: "template-6",
    name: "Weekly Report Generator",
    description: "Automatically generate and email weekly performance reports",
    category: "sales",
    icon: "📊",
    estimatedCost: 0.09,
    usageCount: 356,
    requiredConnections: ["Salesforce", "Gmail"],
    steps: [
      {
        id: "step-1",
        name: "Weekly Schedule",
        type: "trigger",
        icon: "📅",
        description: "Every Monday at 9 AM",
        estimatedCost: 0.001,
        estimatedDuration: 50,
      },
      {
        id: "step-2",
        name: "Fetch Sales Data",
        type: "api_call",
        icon: "📈",
        description: "Get past week's sales metrics",
        estimatedCost: 0.005,
        estimatedDuration: 500,
      },
      {
        id: "step-3",
        name: "Generate Report",
        type: "llm_call",
        icon: "🤖",
        description: "Create formatted report with insights",
        estimatedCost: 0.075,
        estimatedDuration: 3000,
      },
      {
        id: "step-4",
        name: "Send Email",
        type: "api_call",
        icon: "📧",
        description: "Email report to stakeholders",
        estimatedCost: 0.002,
        estimatedDuration: 200,
      },
    ],
  },
];

export function getTemplatesByCategory(category: WorkflowTemplate["category"]) {
  return workflowTemplates.filter((t) => t.category === category);
}

export function getPopularTemplates(limit: number = 5) {
  return [...workflowTemplates].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
}
