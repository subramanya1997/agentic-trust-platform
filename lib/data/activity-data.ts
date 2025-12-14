// Activity and execution trace mock data for Agentic Trust platform

import type {
  ExecutionTrace,
  TraceStep,
  ActivityEvent,
  TraceStepType,
  ActivityEventType,
} from "@/lib/types";
import { mockAgents } from "./mock-data";

// Helper to generate ISO date strings relative to fixed base date
function getRelativeDate(hoursAgo: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

// Seeded random for consistent mock data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Agent step templates based on actual agent definitions
interface StepTemplate {
  name: string;
  type: TraceStepType;
  integration?: string;
  model?: string;
  baseDuration: number;
  baseCost: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

// Generate detailed steps based on agent's instructions and integrations
function getAgentStepTemplates(agentId: string): StepTemplate[] {
  const agent = mockAgents.find((a) => a.id === agentId);
  if (!agent) {
    return [];
  }

  switch (agentId) {
    case "agent-1": // Lead Enrichment Agent
      return [
        {
          name: "Webhook Trigger",
          type: "trigger",
          baseDuration: 35,
          baseCost: 0,
          input: {
            source: "salesforce",
            event: "lead.created",
            payload: {
              leadId: "00Q5g00000ABC123",
              timestamp: "2024-11-28T10:30:00Z",
            },
          },
          output: {
            triggered: true,
            executionId: "exec-1001",
          },
        },
        {
          name: "Fetch Lead from Salesforce",
          type: "api_call",
          integration: "Salesforce",
          baseDuration: 180,
          baseCost: 0.001,
          input: {
            method: "GET",
            endpoint: "/services/data/v58.0/sobjects/Lead/00Q5g00000ABC123",
            headers: { Authorization: "Bearer ***" },
          },
          output: {
            status: 200,
            data: {
              Id: "00Q5g00000ABC123",
              FirstName: "John",
              LastName: "Smith",
              Email: "john.smith@acmecorp.com",
              Company: "Acme Corporation",
              Title: "VP of Engineering",
              Phone: "+1-555-0123",
              LeadSource: "Web",
              Status: "New",
            },
          },
        },
        {
          name: "Enrich with Clearbit",
          type: "api_call",
          integration: "Clearbit",
          baseDuration: 420,
          baseCost: 0.025,
          input: {
            method: "GET",
            endpoint: "/v2/companies/find",
            params: { domain: "acmecorp.com" },
          },
          output: {
            status: 200,
            data: {
              name: "Acme Corporation",
              domain: "acmecorp.com",
              industry: "Technology",
              employeesRange: "201-500",
              estimatedAnnualRevenue: "$50M-$100M",
              foundedYear: 2015,
              location: "San Francisco, CA",
              linkedin: "linkedin.com/company/acmecorp",
              technologies: ["AWS", "React", "Node.js", "PostgreSQL"],
            },
          },
        },
        {
          name: "Analyze Lead Quality",
          type: "llm_call",
          model: agent.model,
          baseDuration: 1200,
          baseCost: 0.018,
          input: {
            model: agent.model,
            system:
              "You are a lead scoring assistant. Analyze the lead and company data to determine lead quality and recommended next steps.",
            messages: [
              {
                role: "user",
                content: `Analyze this lead:
                
Lead: John Smith, VP of Engineering at Acme Corporation
Email: john.smith@acmecorp.com
Source: Web

Company Data:
- Industry: Technology
- Size: 201-500 employees
- Revenue: $50M-$100M
- Location: San Francisco, CA
- Tech Stack: AWS, React, Node.js, PostgreSQL

Score this lead (0-100) and provide recommended next steps.`,
              },
            ],
            temperature: 0.3,
            max_tokens: 500,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 245, completion_tokens: 187, total_tokens: 432 },
            response: {
              role: "assistant",
              content: `## Lead Score: 85/100

### Analysis:
- **Title Match**: VP of Engineering is a key decision-maker ✓
- **Company Size**: Mid-market (201-500) is our sweet spot ✓
- **Industry**: Technology aligns with our ICP ✓
- **Tech Stack**: Uses modern stack compatible with our product ✓
- **Revenue**: Strong buying power ($50M-$100M) ✓

### Recommended Next Steps:
1. **Priority**: High - Schedule discovery call within 24 hours
2. Send personalized demo video highlighting engineering workflow features
3. Connect on LinkedIn with relevant case study
4. Add to "Enterprise Tech" nurture sequence`,
            },
          },
        },
        {
          name: "Update Salesforce Record",
          type: "api_call",
          integration: "Salesforce",
          baseDuration: 150,
          baseCost: 0.001,
          input: {
            method: "PATCH",
            endpoint: "/services/data/v58.0/sobjects/Lead/00Q5g00000ABC123",
            body: {
              Lead_Score__c: 85,
              Lead_Tier__c: "High Value",
              Industry: "Technology",
              NumberOfEmployees: 350,
              AnnualRevenue: 75000000,
              Description: "Enriched via Clearbit. VP of Engineering, strong ICP fit.",
              Next_Steps__c: "Schedule discovery call within 24 hours",
            },
          },
          output: {
            status: 204,
            success: true,
            recordId: "00Q5g00000ABC123",
          },
        },
      ];

    case "agent-2": // Customer Support Ticket Router
      return [
        {
          name: "Zendesk Webhook",
          type: "trigger",
          baseDuration: 25,
          baseCost: 0,
          input: {
            source: "zendesk",
            event: "ticket.created",
            payload: {
              ticketId: "12847",
              timestamp: "2024-11-28T14:22:00Z",
            },
          },
          output: { triggered: true },
        },
        {
          name: "Fetch Ticket Details",
          type: "api_call",
          integration: "Zendesk",
          baseDuration: 120,
          baseCost: 0.001,
          input: {
            method: "GET",
            endpoint: "/api/v2/tickets/12847",
            headers: { Authorization: "Bearer ***" },
          },
          output: {
            status: 200,
            data: {
              id: 12847,
              subject: "Cannot access dashboard - getting 403 error",
              description:
                "Hi, I've been trying to access my dashboard for the past hour but keep getting a 403 Forbidden error. I haven't changed anything on my end. This is blocking my team's work. Please help urgently!",
              requester: {
                name: "Sarah Johnson",
                email: "sarah@bigclient.com",
                organization: "Big Client Inc",
              },
              priority: "high",
              created_at: "2024-11-28T14:22:00Z",
              tags: ["dashboard", "access", "error"],
            },
          },
        },
        {
          name: "Analyze & Categorize",
          type: "llm_call",
          model: agent.model,
          baseDuration: 800,
          baseCost: 0.022,
          input: {
            model: agent.model,
            system:
              "You are a support ticket classifier. Analyze tickets and determine: category, urgency, and routing.",
            messages: [
              {
                role: "user",
                content: `Classify this support ticket:

Subject: Cannot access dashboard - getting 403 error

Description: Hi, I've been trying to access my dashboard for the past hour but keep getting a 403 Forbidden error. I haven't changed anything on my end. This is blocking my team's work. Please help urgently!

Customer: Sarah Johnson (sarah@bigclient.com)
Organization: Big Client Inc
Priority: high

Determine:
1. Category (billing, technical, feature_request, bug, account)
2. Urgency (low, medium, high, critical)
3. Routing team (billing, engineering, product, customer_success)
4. Brief summary for the agent`,
              },
            ],
            temperature: 0.2,
            max_tokens: 300,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 198, completion_tokens: 142, total_tokens: 340 },
            response: {
              role: "assistant",
              content: `## Classification Results

**Category**: technical/bug
**Urgency**: critical
**Routing**: engineering

### Reasoning:
- 403 error indicates authentication/authorization issue
- Customer explicitly states this is blocking their team
- Enterprise customer (Big Client Inc) - high priority account
- Issue appeared suddenly without customer changes - likely our side

### Summary for Agent:
Enterprise customer experiencing 403 Forbidden on dashboard access. Blocking issue, no recent changes on their end. Likely permission/auth service issue. Check recent deployments and auth service status.`,
            },
          },
        },
        {
          name: "Check Urgency",
          type: "conditional",
          baseDuration: 5,
          baseCost: 0,
          input: {
            condition: "urgency === 'critical'",
            value: "critical",
          },
          output: {
            result: true,
            branch: "urgent_notification_path",
          },
        },
        {
          name: "Route to Team",
          type: "api_call",
          integration: "Zendesk",
          baseDuration: 100,
          baseCost: 0.001,
          input: {
            method: "PUT",
            endpoint: "/api/v2/tickets/12847",
            body: {
              ticket: {
                group_id: 360001234567,
                assignee_id: null,
                priority: "urgent",
                tags: ["dashboard", "access", "error", "403", "critical", "enterprise"],
                custom_fields: [
                  { id: 123, value: "technical" },
                  { id: 124, value: "critical" },
                  { id: 125, value: "engineering" },
                ],
              },
            },
          },
          output: {
            status: 200,
            data: {
              ticket: {
                id: 12847,
                group_id: 360001234567,
                priority: "urgent",
                updated_at: "2024-11-28T14:22:05Z",
              },
            },
          },
        },
        {
          name: "Send Slack Alert",
          type: "api_call",
          integration: "Slack",
          baseDuration: 80,
          baseCost: 0.0005,
          input: {
            method: "POST",
            endpoint: "/api/chat.postMessage",
            body: {
              channel: "#eng-support-urgent",
              blocks: [
                {
                  type: "header",
                  text: { type: "plain_text", text: "🚨 Critical Support Ticket" },
                },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "*Ticket #12847*: Cannot access dashboard - 403 error\n*Customer*: Big Client Inc (Enterprise)\n*Urgency*: Critical - Blocking Issue",
                  },
                },
              ],
            },
          },
          output: {
            status: 200,
            ok: true,
            channel: "C0123456789",
            ts: "1732803725.000100",
            message: { text: "🚨 Critical Support Ticket..." },
          },
        },
      ];

    case "agent-3": // Weekly Report Generator
      return [
        {
          name: "Schedule Trigger",
          type: "trigger",
          baseDuration: 10,
          baseCost: 0,
          input: {
            schedule: "0 8 * * MON",
            event: "cron",
            timezone: "America/Los_Angeles",
          },
          output: { triggered: true },
        },
        {
          name: "Fetch Sales Data",
          type: "api_call",
          integration: "Salesforce",
          baseDuration: 2500,
          baseCost: 0.005,
          input: {
            method: "GET",
            endpoint: "/services/data/v58.0/query",
            params: {
              q: "SELECT Id, Name, Amount, StageName, CloseDate, Account.Name FROM Opportunity WHERE CloseDate = LAST_WEEK AND IsWon = true",
            },
          },
          output: {
            status: 200,
            data: {
              totalSize: 23,
              done: true,
              records: [
                {
                  Id: "006xxx1",
                  Name: "Acme Corp - Enterprise",
                  Amount: 125000,
                  StageName: "Closed Won",
                  CloseDate: "2024-11-25",
                },
                {
                  Id: "006xxx2",
                  Name: "TechStart - Pro Plan",
                  Amount: 45000,
                  StageName: "Closed Won",
                  CloseDate: "2024-11-26",
                },
                {
                  Id: "006xxx3",
                  Name: "GlobalTech - Annual",
                  Amount: 89000,
                  StageName: "Closed Won",
                  CloseDate: "2024-11-27",
                },
              ],
              summary: {
                totalRevenue: 487500,
                dealCount: 23,
                avgDealSize: 21195,
              },
            },
          },
        },
        {
          name: "Generate Report",
          type: "llm_call",
          model: agent.model,
          baseDuration: 4500,
          baseCost: 0.045,
          input: {
            model: agent.model,
            system:
              "You are a sales analyst. Generate comprehensive weekly reports with insights and recommendations.",
            messages: [
              {
                role: "user",
                content: `Generate a weekly sales report for the week of Nov 18-24, 2024.

Data Summary:
- Total Revenue: $487,500
- Deals Closed: 23
- Average Deal Size: $21,195

Top Deals:
1. Acme Corp - Enterprise: $125,000
2. GlobalTech - Annual: $89,000  
3. TechStart - Pro Plan: $45,000

Previous Week Comparison:
- Revenue: $412,000 (+18.3%)
- Deals: 19 (+21%)
- Avg Deal Size: $21,684 (-2.3%)

Generate:
1. Executive Summary
2. Key Metrics Analysis
3. Top Performers
4. Trends & Insights
5. Recommendations for Next Week`,
              },
            ],
            temperature: 0.4,
            max_tokens: 1500,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 312, completion_tokens: 876, total_tokens: 1188 },
            response: {
              role: "assistant",
              content: `# Weekly Sales Report
## Week of November 18-24, 2024

### 📊 Executive Summary
Outstanding week with **$487,500** in closed revenue, representing an **18.3% increase** over last week. Deal volume up 21% with 23 closed opportunities. Strong enterprise momentum continues.

### 📈 Key Metrics

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Revenue | $487,500 | $412,000 | +18.3% |
| Deals Closed | 23 | 19 | +21% |
| Avg Deal Size | $21,195 | $21,684 | -2.3% |
| Win Rate | 34% | 31% | +3pp |

### 🏆 Top Performers
1. **Sarah Chen** - $156,000 (3 deals)
2. **Marcus Johnson** - $124,500 (4 deals)
3. **Emily Rodriguez** - $98,000 (5 deals)

### 💡 Trends & Insights
- Enterprise segment showing strong momentum (+32% MoM)
- Pro Plan conversions up after pricing update
- APAC region emerging as growth driver
- Average sales cycle shortened by 4 days

### 🎯 Recommendations
1. Double down on enterprise outreach - momentum is strong
2. Schedule team training on new Pro Plan positioning
3. Allocate more resources to APAC expansion
4. Review pipeline for Q4 close opportunities`,
            },
          },
        },
        {
          name: "Create Notion Page",
          type: "api_call",
          integration: "Notion",
          baseDuration: 350,
          baseCost: 0.001,
          input: {
            method: "POST",
            endpoint: "/v1/pages",
            body: {
              parent: { database_id: "abc123-reports-db" },
              properties: {
                Title: { title: [{ text: { content: "Weekly Sales Report - Nov 18-24" } }] },
                Date: { date: { start: "2024-11-25" } },
                Status: { select: { name: "Published" } },
              },
              children: [
                {
                  type: "heading_1",
                  heading_1: { text: [{ text: { content: "Weekly Sales Report" } }] },
                },
              ],
            },
          },
          output: {
            status: 200,
            data: {
              id: "page-xyz789",
              url: "https://notion.so/Weekly-Sales-Report-Nov-18-24-xyz789",
              created_time: "2024-11-25T08:01:00Z",
            },
          },
        },
        {
          name: "Send Email Summary",
          type: "api_call",
          integration: "Gmail",
          baseDuration: 200,
          baseCost: 0.001,
          input: {
            method: "POST",
            endpoint: "/gmail/v1/users/me/messages/send",
            body: {
              to: ["sales-leadership@company.com", "ceo@company.com"],
              subject: "📊 Weekly Sales Report - Nov 18-24 | $487.5K Revenue (+18.3%)",
              body: "Weekly sales report is ready. Key highlights: $487.5K revenue, 23 deals closed, 18.3% growth WoW.",
              attachments: ["Weekly_Sales_Report_Nov18-24.pdf"],
            },
          },
          output: {
            status: 200,
            data: {
              id: "msg-abc123",
              threadId: "thread-xyz",
              labelIds: ["SENT"],
            },
          },
        },
      ];

    case "agent-4": // Code Review Assistant
      return [
        {
          name: "GitHub Webhook",
          type: "trigger",
          baseDuration: 20,
          baseCost: 0,
          input: {
            source: "github",
            event: "pull_request.opened",
            payload: {
              action: "opened",
              number: 142,
              repository: "company/main-app",
            },
          },
          output: { triggered: true, prNumber: 142 },
        },
        {
          name: "Fetch PR Details",
          type: "api_call",
          integration: "GitHub",
          baseDuration: 280,
          baseCost: 0.001,
          input: {
            method: "GET",
            endpoint: "/repos/company/main-app/pulls/142",
          },
          output: {
            status: 200,
            data: {
              number: 142,
              title: "feat: Add user authentication middleware",
              user: { login: "dev-sarah" },
              base: { ref: "main" },
              head: { ref: "feature/auth-middleware" },
              additions: 234,
              deletions: 56,
              changed_files: 8,
            },
          },
        },
        {
          name: "Fetch Changed Files",
          type: "api_call",
          integration: "GitHub",
          baseDuration: 450,
          baseCost: 0.002,
          input: {
            method: "GET",
            endpoint: "/repos/company/main-app/pulls/142/files",
          },
          output: {
            status: 200,
            data: {
              files: [
                { filename: "src/middleware/auth.ts", additions: 89, deletions: 0, patch: "..." },
                { filename: "src/utils/jwt.ts", additions: 45, deletions: 12, patch: "..." },
                { filename: "src/types/user.ts", additions: 23, deletions: 8, patch: "..." },
                { filename: "tests/auth.test.ts", additions: 67, deletions: 34, patch: "..." },
              ],
            },
          },
        },
        {
          name: "Analyze Code Quality",
          type: "llm_call",
          model: agent.model,
          baseDuration: 3800,
          baseCost: 0.065,
          input: {
            model: agent.model,
            system:
              "You are a senior code reviewer. Analyze code for security, performance, and best practices.",
            messages: [
              {
                role: "user",
                content: `Review this PR: "feat: Add user authentication middleware"

Files changed:
- src/middleware/auth.ts (new file)
- src/utils/jwt.ts (modified)
- src/types/user.ts (modified)
- tests/auth.test.ts (modified)

Key code snippet from auth.ts:
\`\`\`typescript
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

Review for: security issues, best practices, potential bugs, suggestions.`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 456, completion_tokens: 534, total_tokens: 990 },
            response: {
              role: "assistant",
              content: `## Code Review: Authentication Middleware

### 🔴 Security Issues (2)

1. **JWT Secret Handling** (High)
   \`\`\`typescript
   // Current - unsafe
   jwt.verify(token, process.env.JWT_SECRET!);
   
   // Recommended
   const secret = process.env.JWT_SECRET;
   if (!secret) throw new Error('JWT_SECRET not configured');
   jwt.verify(token, secret);
   \`\`\`

2. **Error Information Leakage** (Medium)
   Generic error messages are good, but consider logging the actual error server-side for debugging.

### 🟡 Suggestions (3)

1. Add token expiration handling with refresh logic
2. Consider rate limiting on auth endpoints
3. Add request ID to error responses for tracing

### 🟢 Positives
- Clean separation of concerns
- Good TypeScript types
- Proper async/await usage
- Tests cover main scenarios

### Overall Score: 8.5/10
Approve with minor changes requested.`,
            },
          },
        },
        {
          name: "Check Test Coverage",
          type: "llm_call",
          model: agent.model,
          baseDuration: 2200,
          baseCost: 0.038,
          input: {
            model: agent.model,
            system: "Analyze test coverage and suggest missing test cases.",
            messages: [
              {
                role: "user",
                content:
                  "Analyze test coverage for the auth middleware. Current tests cover: valid token, invalid token, missing token. What's missing?",
              },
            ],
            temperature: 0.3,
            max_tokens: 400,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 89, completion_tokens: 156, total_tokens: 245 },
            response: {
              role: "assistant",
              content: `## Missing Test Cases

1. **Expired token** - Should return 401
2. **Malformed token** - Should handle gracefully
3. **Token with invalid signature** - Security test
4. **Missing JWT_SECRET env var** - Should fail safely
5. **Concurrent requests** - Race condition test
6. **Token refresh flow** - If implemented

Current coverage estimate: 65%
Recommended coverage: 85%+`,
            },
          },
        },
        {
          name: "Post Review Comment",
          type: "api_call",
          integration: "GitHub",
          baseDuration: 180,
          baseCost: 0.001,
          input: {
            method: "POST",
            endpoint: "/repos/company/main-app/pulls/142/reviews",
            body: {
              event: "COMMENT",
              body: "## 🤖 Automated Code Review\n\nOverall Score: 8.5/10\n\n...",
              comments: [
                {
                  path: "src/middleware/auth.ts",
                  line: 8,
                  body: "🔴 **Security**: Consider validating JWT_SECRET exists before using",
                },
              ],
            },
          },
          output: {
            status: 200,
            data: {
              id: 1234567,
              state: "COMMENTED",
              submitted_at: "2024-11-28T10:15:00Z",
            },
          },
        },
        {
          name: "Update Linear Issue",
          type: "api_call",
          integration: "Linear",
          baseDuration: 120,
          baseCost: 0.001,
          input: {
            method: "POST",
            endpoint: "/graphql",
            body: {
              query:
                'mutation { issueUpdate(id: "ENG-456", input: { stateId: "in-review" }) { success } }',
            },
          },
          output: {
            status: 200,
            data: { issueUpdate: { success: true } },
          },
        },
      ];

    case "agent-5": // Invoice Processing Agent
      return [
        {
          name: "Email Trigger",
          type: "trigger",
          baseDuration: 30,
          baseCost: 0,
          input: {
            source: "gmail",
            filter: "has:attachment filename:pdf subject:invoice",
            messageId: "msg-inv-123",
          },
          output: { triggered: true, attachments: 1 },
        },
        {
          name: "Download Attachment",
          type: "api_call",
          integration: "Gmail",
          baseDuration: 350,
          baseCost: 0.001,
          input: {
            method: "GET",
            endpoint: "/gmail/v1/users/me/messages/msg-inv-123/attachments/att-001",
          },
          output: {
            status: 200,
            data: {
              filename: "Invoice-2024-1847.pdf",
              mimeType: "application/pdf",
              size: 245678,
            },
          },
        },
        {
          name: "Extract Invoice Data",
          type: "llm_call",
          model: agent.model,
          baseDuration: 2800,
          baseCost: 0.032,
          input: {
            model: agent.model,
            system: "Extract structured data from invoice documents.",
            messages: [
              {
                role: "user",
                content:
                  "[PDF Content extracted via OCR]\n\nExtract: vendor, invoice number, date, due date, line items, subtotal, tax, total.",
              },
            ],
            temperature: 0.1,
            max_tokens: 600,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 234, completion_tokens: 189, total_tokens: 423 },
            response: {
              role: "assistant",
              content: JSON.stringify(
                {
                  vendor: { name: "CloudServices Inc", address: "123 Tech Blvd, SF, CA" },
                  invoiceNumber: "INV-2024-1847",
                  invoiceDate: "2024-11-20",
                  dueDate: "2024-12-20",
                  lineItems: [
                    {
                      description: "Cloud Hosting - November",
                      quantity: 1,
                      unitPrice: 850,
                      total: 850,
                    },
                    { description: "API Calls (1M)", quantity: 2, unitPrice: 150, total: 300 },
                    { description: "Support - Premium", quantity: 1, unitPrice: 200, total: 200 },
                  ],
                  subtotal: 1350,
                  tax: 121.5,
                  total: 1471.5,
                  currency: "USD",
                },
                null,
                2
              ),
            },
          },
        },
        {
          name: "Create QuickBooks Entry",
          type: "api_call",
          integration: "QuickBooks",
          baseDuration: 220,
          baseCost: 0.002,
          input: {
            method: "POST",
            endpoint: "/v3/company/123456/bill",
            body: {
              VendorRef: { value: "vendor-cloudservices" },
              TxnDate: "2024-11-20",
              DueDate: "2024-12-20",
              TotalAmt: 1471.5,
              Line: [
                { Amount: 850, Description: "Cloud Hosting - November" },
                { Amount: 300, Description: "API Calls (1M)" },
                { Amount: 200, Description: "Support - Premium" },
              ],
            },
          },
          output: {
            status: 200,
            data: {
              Bill: {
                Id: "bill-789",
                DocNumber: "INV-2024-1847",
                TotalAmt: 1471.5,
                Balance: 1471.5,
              },
            },
          },
        },
      ];

    case "agent-6": // Meeting Notes Summarizer
      return [
        {
          name: "Zoom Recording Ready",
          type: "trigger",
          baseDuration: 40,
          baseCost: 0,
          input: {
            source: "zoom",
            event: "recording.completed",
            meetingId: "mtg-987654",
          },
          output: { triggered: true, duration: "45 min" },
        },
        {
          name: "Download Recording",
          type: "api_call",
          integration: "Zoom",
          baseDuration: 1800,
          baseCost: 0.005,
          input: {
            method: "GET",
            endpoint: "/v2/meetings/mtg-987654/recordings",
          },
          output: {
            status: 200,
            data: {
              recording_files: [
                { file_type: "MP4", file_size: 125000000, download_url: "..." },
                { file_type: "M4A", file_size: 12000000, download_url: "..." },
              ],
            },
          },
        },
        {
          name: "Transcribe Audio",
          type: "llm_call",
          model: agent.model,
          baseDuration: 8500,
          baseCost: 0.045,
          input: {
            model: "whisper-1",
            file: "meeting-audio.m4a",
            language: "en",
            response_format: "verbose_json",
          },
          output: {
            model: "whisper-1",
            usage: { duration_seconds: 2700 },
            response: {
              text: "[Full transcript - 4,523 words]",
              segments: [
                {
                  start: 0,
                  end: 45,
                  text: "Alright, let's get started with our weekly product sync...",
                  speaker: "Sarah",
                },
                {
                  start: 45,
                  end: 120,
                  text: "Thanks Sarah. I wanted to discuss the Q4 roadmap priorities...",
                  speaker: "Mike",
                },
              ],
              speakers: ["Sarah", "Mike", "Alex", "Jordan"],
            },
          },
        },
        {
          name: "Generate Summary",
          type: "llm_call",
          model: agent.model,
          baseDuration: 2800,
          baseCost: 0.028,
          input: {
            model: agent.model,
            system:
              "Summarize meeting transcripts. Extract key points, decisions, and action items.",
            messages: [
              {
                role: "user",
                content:
                  "Summarize this 45-minute product sync meeting. Participants: Sarah (PM), Mike (Eng Lead), Alex (Design), Jordan (QA).\n\n[Transcript]...",
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 1245, completion_tokens: 456, total_tokens: 1701 },
            response: {
              role: "assistant",
              content: `# Meeting Summary: Weekly Product Sync
**Date**: November 28, 2024 | **Duration**: 45 min

## Key Discussion Points
1. Q4 roadmap finalization - focusing on enterprise features
2. Design system v2 rollout timeline
3. Performance optimization sprint results

## Decisions Made
- ✅ Prioritize SSO implementation for Q4
- ✅ Push analytics dashboard to Q1
- ✅ Approve design system migration plan

## Action Items
| Owner | Task | Due |
|-------|------|-----|
| Mike | Complete SSO technical spec | Dec 2 |
| Alex | Finalize design system components | Dec 5 |
| Jordan | Set up E2E test suite for SSO | Dec 8 |
| Sarah | Update roadmap in Notion | Nov 29 |

## Next Steps
- Follow-up meeting scheduled for Dec 5
- Stakeholder review on Dec 10`,
            },
          },
        },
        {
          name: "Create Notion Notes",
          type: "api_call",
          integration: "Notion",
          baseDuration: 280,
          baseCost: 0.001,
          input: {
            method: "POST",
            endpoint: "/v1/pages",
            body: {
              parent: { database_id: "meetings-db" },
              properties: {
                Title: { title: [{ text: { content: "Weekly Product Sync - Nov 28" } }] },
                Date: { date: { start: "2024-11-28" } },
                Attendees: {
                  multi_select: [
                    { name: "Sarah" },
                    { name: "Mike" },
                    { name: "Alex" },
                    { name: "Jordan" },
                  ],
                },
              },
            },
          },
          output: {
            status: 200,
            data: {
              id: "page-meeting-123",
              url: "https://notion.so/Weekly-Product-Sync-Nov-28",
            },
          },
        },
        {
          name: "Send Slack Summary",
          type: "api_call",
          integration: "Slack",
          baseDuration: 90,
          baseCost: 0.0005,
          input: {
            method: "POST",
            endpoint: "/api/chat.postMessage",
            body: {
              channel: "#product-team",
              text: "📝 Meeting notes ready: Weekly Product Sync",
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "*Meeting Notes Ready*\nWeekly Product Sync - Nov 28\n\n<https://notion.so/...|View in Notion>",
                  },
                },
              ],
            },
          },
          output: {
            status: 200,
            ok: true,
            ts: "1732803900.000200",
          },
        },
      ];

    case "agent-7": // Competitor Monitor
      return [
        {
          name: "Schedule Trigger",
          type: "trigger",
          baseDuration: 10,
          baseCost: 0,
          input: {
            schedule: "0 6 * * *",
            event: "cron",
            timezone: "UTC",
          },
          output: { triggered: true },
        },
        {
          name: "Crawl Competitor Sites",
          type: "api_call",
          integration: "Web Scraper",
          baseDuration: 5500,
          baseCost: 0.015,
          input: {
            sites: [
              "competitor1.com/pricing",
              "competitor2.com/features",
              "competitor3.com/pricing",
            ],
            selectors: {
              pricing: ".pricing-card",
              features: ".feature-list",
            },
          },
          output: {
            status: 200,
            data: {
              "competitor1.com": {
                pricing: { starter: 29, pro: 99, enterprise: "Contact" },
                lastUpdated: "2024-11-28",
              },
              "competitor2.com": {
                pricing: { basic: 19, team: 79, business: 199 },
                newFeature: "AI Assistant (Beta)",
              },
            },
          },
        },
        {
          name: "Analyze Changes",
          type: "llm_call",
          model: agent.model,
          baseDuration: 3200,
          baseCost: 0.055,
          input: {
            model: agent.model,
            system: "Analyze competitor data changes and provide strategic insights.",
            messages: [
              {
                role: "user",
                content:
                  "Compare today's competitor data with yesterday's. Identify pricing changes, new features, and strategic moves.",
              },
            ],
            temperature: 0.4,
            max_tokens: 800,
          },
          output: {
            model: agent.model,
            usage: { prompt_tokens: 567, completion_tokens: 345, total_tokens: 912 },
            response: {
              role: "assistant",
              content: `## Competitor Intelligence Report - Nov 28

### 🔴 Price Changes
- **Competitor2**: Team plan increased $79 → $89 (+12.6%)

### 🆕 New Features
- **Competitor2**: Launched "AI Assistant" in beta
  - Appears to be GPT-powered
  - Available on Team+ plans

### 📊 Strategic Insights
1. Competitor2's price increase suggests strong demand
2. AI feature launch indicates market shift
3. Recommend accelerating our AI roadmap

### ⚠️ Action Required
- Review our Team plan pricing competitiveness
- Prioritize AI feature development`,
            },
          },
        },
        {
          name: "Update Notion Database",
          type: "api_call",
          integration: "Notion",
          baseDuration: 320,
          baseCost: 0.002,
          input: {
            method: "PATCH",
            endpoint: "/v1/pages/competitor-db-page",
            body: {
              properties: {
                "Last Updated": { date: { start: "2024-11-28" } },
                "Price Changes": { checkbox: true },
                "New Features": { rich_text: [{ text: { content: "AI Assistant (Beta)" } }] },
              },
            },
          },
          output: {
            status: 200,
            data: { id: "competitor-db-page", last_edited_time: "2024-11-28T06:05:00Z" },
          },
        },
        {
          name: "Send Slack Alert",
          type: "api_call",
          integration: "Slack",
          baseDuration: 85,
          baseCost: 0.0005,
          input: {
            method: "POST",
            endpoint: "/api/chat.postMessage",
            body: {
              channel: "#competitive-intel",
              text: "🔔 Competitor Alert: Price change detected + New AI feature launched",
            },
          },
          output: {
            status: 200,
            ok: true,
            ts: "1732777500.000300",
          },
        },
      ];

    default:
      return [];
  }
}

// Generate trace steps from templates
function generateStepsFromTemplates(
  templates: StepTemplate[],
  seed: number,
  failed: boolean = false
): TraceStep[] {
  const failAtStep = failed ? Math.floor(seededRandom(seed) * (templates.length - 1)) + 1 : -1;
  let currentOffset = 0;

  return templates.map((template, idx) => {
    const stepSeed = seed + idx * 100;
    const isFailed = idx === failAtStep;
    const isSkipped = failAtStep !== -1 && idx > failAtStep;

    // Add some random variation to duration (±20%)
    const durationVariation = 0.8 + seededRandom(stepSeed) * 0.4;
    const duration = isSkipped ? 0 : Math.round(template.baseDuration * durationVariation);

    const step: TraceStep = {
      id: `step-${seed}-${idx + 1}`,
      name: template.name,
      type: template.type,
      status: isFailed ? "failed" : isSkipped ? "skipped" : "completed",
      startOffset: currentOffset,
      duration,
      cost: isSkipped ? 0 : template.baseCost,
      integration: template.integration,
      model: template.model,
      input: isSkipped ? undefined : template.input,
      output: isFailed || isSkipped ? undefined : template.output,
      error: isFailed ? getRandomError(template.type, template.integration, stepSeed) : undefined,
    };

    // Add token info for LLM calls
    if (template.type === "llm_call" && !isSkipped && template.output) {
      const outputData = template.output as {
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };
      if (outputData.usage) {
        step.tokens = {
          input: outputData.usage.prompt_tokens,
          output: outputData.usage.completion_tokens,
        };
      }
    }

    currentOffset += duration + Math.round(seededRandom(stepSeed + 10) * 50); // Small gap between steps

    return step;
  });
}

function getRandomError(type: TraceStepType, integration?: string, seed: number = 0): string {
  const apiErrors = [
    `${integration || "API"} rate limit exceeded (429)`,
    `${integration || "API"} authentication failed`,
    `${integration || "API"} timeout after 30s`,
    `${integration || "API"} returned invalid response`,
    `Connection to ${integration || "service"} refused`,
  ];

  const llmErrors = [
    "Context length exceeded maximum tokens",
    "Model timeout after 60s",
    "Invalid response format from model",
    "Content filter triggered",
  ];

  const errors = type === "llm_call" ? llmErrors : apiErrors;
  return errors[Math.floor(seededRandom(seed) * errors.length)];
}

// Generate execution traces
export function generateExecutionTraces(count: number = 25): ExecutionTrace[] {
  const traces: ExecutionTrace[] = [];
  const users = [
    { id: "user-1", name: "Sara Klein" },
    { id: "user-2", name: "Alex Chen" },
    { id: "user-3", name: "Jordan Smith" },
    { id: "user-4", name: "System" },
  ];
  const triggerTypes: ("manual" | "scheduled" | "webhook" | "api")[] = [
    "manual",
    "scheduled",
    "webhook",
    "api",
  ];

  for (let i = 0; i < count; i++) {
    const seed = i + 1000;
    const agentIndex = Math.floor(seededRandom(seed) * mockAgents.length);
    const agent = mockAgents[agentIndex];
    const userIndex = Math.floor(seededRandom(seed + 1) * users.length);
    const user = users[userIndex];
    const hoursAgo = Math.floor(seededRandom(seed + 2) * 168); // Last 7 days
    const failed = seededRandom(seed + 3) < 0.12; // 12% failure rate

    const templates = getAgentStepTemplates(agent.id);
    if (templates.length === 0) {
      continue;
    }

    const steps = generateStepsFromTemplates(templates, seed, failed);
    const totalDuration = steps.reduce((sum, s) => Math.max(sum, s.startOffset + s.duration), 0);
    const totalCost = steps.reduce((sum, s) => sum + s.cost, 0);
    const successfulSteps = steps.filter((s) => s.status === "completed").length;
    const failedSteps = steps.filter((s) => s.status === "failed").length;

    traces.push({
      id: `exec-${seed}`,
      agentId: agent.id,
      agentName: agent.name,
      status: failed ? "failed" : "completed",
      triggeredBy: user.name,
      triggerType: triggerTypes[Math.floor(seededRandom(seed + 4) * triggerTypes.length)],
      startedAt: getRelativeDate(hoursAgo),
      completedAt: getRelativeDate(hoursAgo - totalDuration / 3600000),
      duration: totalDuration,
      totalCost: Math.round(totalCost * 10000) / 10000,
      totalSteps: steps.length,
      successfulSteps,
      failedSteps,
      steps,
    });
  }

  // Sort by most recent first
  return traces.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// Generate activity events
export function generateActivityEvents(count: number = 50): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const users = [
    { id: "user-1", name: "Sara Klein" },
    { id: "user-2", name: "Alex Chen" },
    { id: "user-3", name: "Jordan Smith" },
    { id: "user-4", name: "System" },
  ];
  const eventTypes: ActivityEventType[] = [
    "execution_started",
    "execution_completed",
    "execution_failed",
    "tool_called",
    "agent_created",
    "agent_updated",
    "integration_connected",
    "error_occurred",
  ];

  for (let i = 0; i < count; i++) {
    const seed = i + 2000;
    const hoursAgo = Math.floor(seededRandom(seed) * 168);
    const userIndex = Math.floor(seededRandom(seed + 1) * users.length);
    const user = users[userIndex];
    const agentIndex = Math.floor(seededRandom(seed + 2) * mockAgents.length);
    const agent = mockAgents[agentIndex];
    const eventTypeIndex = Math.floor(seededRandom(seed + 3) * eventTypes.length);
    const eventType = eventTypes[eventTypeIndex];

    let details: Record<string, unknown> = {};

    switch (eventType) {
      case "execution_started":
        details = {
          triggerType: ["manual", "scheduled", "webhook"][Math.floor(seededRandom(seed + 4) * 3)],
          model: agent.model,
        };
        break;
      case "execution_completed":
        details = {
          duration: Math.floor(seededRandom(seed + 4) * 10000) + 500,
          cost: Math.round(seededRandom(seed + 5) * 100) / 1000,
          stepsCompleted: agent.instructions.length,
        };
        break;
      case "execution_failed":
        details = {
          error: ["API rate limit exceeded", "Model timeout", "Invalid input", "Permission denied"][
            Math.floor(seededRandom(seed + 4) * 4)
          ],
          stepFailed: Math.floor(seededRandom(seed + 5) * 5) + 1,
        };
        break;
      case "tool_called":
        const integration =
          agent.integrations[Math.floor(seededRandom(seed + 4) * agent.integrations.length)];
        details = {
          integration: integration?.name || "Unknown",
          tool: ["fetch", "create", "update", "query"][Math.floor(seededRandom(seed + 5) * 4)],
          latency: Math.floor(seededRandom(seed + 6) * 500) + 50,
        };
        break;
      case "agent_created":
      case "agent_updated":
        details = {
          version: agent.version,
          changes:
            eventType === "agent_updated"
              ? ["instructions", "model", "integrations"][Math.floor(seededRandom(seed + 5) * 3)]
              : undefined,
        };
        break;
      case "integration_connected":
        const connectedIntegration =
          agent.integrations[Math.floor(seededRandom(seed + 4) * agent.integrations.length)];
        details = {
          integration: connectedIntegration?.name || "Unknown",
          method: ["oauth", "api_key"][Math.floor(seededRandom(seed + 5) * 2)],
        };
        break;
      case "error_occurred":
        details = {
          errorType: ["rate_limit", "timeout", "validation", "auth"][
            Math.floor(seededRandom(seed + 4) * 4)
          ],
          severity: ["warning", "error", "critical"][Math.floor(seededRandom(seed + 5) * 3)],
        };
        break;
    }

    events.push({
      id: `event-${seed}`,
      type: eventType,
      timestamp: getRelativeDate(hoursAgo),
      agentId: agent.id,
      agentName: agent.name,
      executionId:
        eventType.includes("execution") || eventType === "tool_called" ? `exec-${seed}` : undefined,
      userId: user.id,
      userName: user.name,
      details,
      metadata:
        seededRandom(seed + 10) > 0.5
          ? {
              ip: `192.168.1.${Math.floor(seededRandom(seed + 11) * 255)}`,
              region: ["us-east-1", "eu-west-1", "ap-southeast-1"][
                Math.floor(seededRandom(seed + 12) * 3)
              ],
            }
          : undefined,
    });
  }

  // Sort by most recent first
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Pre-generated data
export const mockExecutionTraces = generateExecutionTraces(25);
export const mockActivityEvents = generateActivityEvents(60);

// Summary statistics
export function getActivitySummary(dateRange: "7d" | "14d" | "30d" = "7d") {
  const now = new Date();
  const daysAgo = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
  const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const filteredTraces = mockExecutionTraces.filter((t) => new Date(t.startedAt) >= cutoff);
  const filteredEvents = mockActivityEvents.filter((e) => new Date(e.timestamp) >= cutoff);

  const totalExecutions = filteredTraces.length;
  const successfulExecutions = filteredTraces.filter((t) => t.status === "completed").length;
  const failedExecutions = filteredTraces.filter((t) => t.status === "failed").length;
  const avgDuration =
    filteredTraces.length > 0
      ? Math.round(filteredTraces.reduce((sum, t) => sum + t.duration, 0) / filteredTraces.length)
      : 0;
  const totalCost =
    Math.round(filteredTraces.reduce((sum, t) => sum + t.totalCost, 0) * 1000) / 1000;

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate:
      totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 1000) / 10 : 0,
    avgDuration,
    totalCost,
    totalEvents: filteredEvents.length,
    errorEvents: filteredEvents.filter(
      (e) => e.type === "error_occurred" || e.type === "execution_failed"
    ).length,
  };
}

// Filter functions
export function filterExecutionTraces(
  traces: ExecutionTrace[],
  filters: {
    agentId?: string;
    status?: "completed" | "failed" | "running";
    dateRange?: "7d" | "14d" | "30d";
    search?: string;
  }
): ExecutionTrace[] {
  let filtered = [...traces];

  if (filters.agentId) {
    filtered = filtered.filter((t) => t.agentId === filters.agentId);
  }

  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.dateRange) {
    const now = new Date();
    const daysAgo = filters.dateRange === "7d" ? 7 : filters.dateRange === "14d" ? 14 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((t) => new Date(t.startedAt) >= cutoff);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.agentName.toLowerCase().includes(searchLower) ||
        t.triggeredBy.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

export function filterActivityEvents(
  events: ActivityEvent[],
  filters: {
    type?: ActivityEventType;
    agentId?: string;
    userId?: string;
    dateRange?: "7d" | "14d" | "30d";
    search?: string;
  }
): ActivityEvent[] {
  let filtered = [...events];

  if (filters.type) {
    filtered = filtered.filter((e) => e.type === filters.type);
  }

  if (filters.agentId) {
    filtered = filtered.filter((e) => e.agentId === filters.agentId);
  }

  if (filters.userId) {
    filtered = filtered.filter((e) => e.userId === filters.userId);
  }

  if (filters.dateRange) {
    const now = new Date();
    const daysAgo = filters.dateRange === "7d" ? 7 : filters.dateRange === "14d" ? 14 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((e) => new Date(e.timestamp) >= cutoff);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.agentName?.toLowerCase().includes(searchLower) ||
        e.userName.toLowerCase().includes(searchLower) ||
        e.type.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.details).toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
