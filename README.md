# Agentic Trust - AI Agent Infrastructure Platform (Mockup)

A fully functional mockup of the Agentic Trust platform built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

✅ **Dashboard** - Overview of agents, executions, and key metrics with real-time stats
✅ **Agent Management** - View and manage all AI agents with status indicators
✅ **Agent Detail Pages** - Full workflow visualization with metrics and recent executions
✅ **Agent Builder** - Chat-based interface to create agents with structured instructions and AI assistant
✅ **Workflow Templates** - 6 pre-built templates for common use cases (Sales, Support, DevOps, Finance, Marketing)
✅ **Activity Tracking** - Comprehensive audit logs and execution monitoring with trace viewer
✅ **Advanced Analytics** - Multi-tab analytics dashboard (Costs, Performance, Usage, Integrations)
✅ **Cost Analytics** - Detailed cost tracking with interactive charts and breakdowns
✅ **Performance Metrics** - Track response times, success rates, and throughput
✅ **Integrations** - 12+ integrations with connection management (Salesforce, Slack, GitHub, etc.)
✅ **Organization Management** - General settings, billing information, and security configuration
✅ **Team Management** - Member management, role assignment, permissions, and invitations
✅ **API Keys** - Secure API key generation and management
✅ **Navigation & Layout** - Responsive sidebar navigation with professional design

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Formatting:** date-fns

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

- `/` - Dashboard with stats, recent executions, and active agents
- `/agents` - Grid view of all agents with metrics
- `/agents/[id]` - Individual agent detail with workflow and execution history
- `/agents/new` - Create new agent with chat-based builder
- `/agents/examples/[id]` - View example agents (Feature Spec Generator, Lead Enrichment)
- `/activity` - Activity tracking with audit logs and execution monitoring
- `/analytics` - Multi-tab analytics dashboard (Costs, Performance, Usage, Integrations)
- `/integrations` - 12+ integrations with connection management
- `/integrations/[id]` - Individual integration detail and configuration
- `/organization` - Organization settings (General, Billing, Security)
- `/team` - Team management (Members, Roles, Permissions, Invitations)
- `/api-keys` - API key management and generation

## Agent Builder

The agent builder (`/agents/new`) features a comprehensive chat-based interface for creating AI agents:

- **Goal Definition:** Set clear objectives for your agent
- **Integration Selection:** Choose from 12+ integrations
- **Instructions:** Define agent behavior and guidelines
- **AI Assistant:** Test and refine your agent with the built-in chat
- **Real-time Preview:** See your agent configuration as you build

## Activity Tracking

The Activity page (`/activity`) provides comprehensive monitoring capabilities:

- **Executions Tab:** Monitor all agent executions with filtering by status, agent, and date range
- **Audit Log Tab:** Track all system events, user actions, and configuration changes
- **Trace Viewer:** Detailed step-by-step execution traces with performance metrics and error analysis

## Analytics Dashboard

The Analytics page (`/analytics`) offers multi-dimensional insights:

- **Costs Tab:** Track spending by agent, time period, and provider with interactive charts
- **Performance Tab:** Monitor response times, success rates, and throughput metrics
- **Usage Tab:** Analyze API calls, token consumption, and agent utilization
- **Integrations Tab:** View integration health, usage patterns, and connection status

## Mock Data

All data is mocked across multiple files in `/lib/data/`:

- **`mock-data.ts`** - Agents, integrations, dashboard statistics, team members
- **`activity-data.ts`** - Audit logs and execution history
- **`analytics-data.ts`** - Cost analytics, performance metrics, usage statistics
- **`integration-tools.ts`** - Available integration tools and configurations
- **`sample-agents.ts`** - Pre-built agent examples and templates
- **`workflows.ts`** - Workflow definitions and templates

## Key Components

### Layout

- `components/app-sidebar.tsx` - Main application sidebar with navigation
- `components/layout/header.tsx` - Top header with search and actions
- `components/nav-main.tsx` - Main navigation menu
- `components/nav-user.tsx` - User navigation and profile

### Dashboard

- `components/dashboard/stats-card.tsx` - Metric cards with trends
- `components/dashboard/recent-executions.tsx` - Recent executions table
- `components/dashboard/active-agents.tsx` - Active agents list

### Activity

- `components/activity/audit-log-tab.tsx` - Audit log viewer
- `components/activity/executions-tab.tsx` - Executions monitoring
- `components/activity/trace-viewer.tsx` - Detailed execution trace viewer

### Analytics

- `components/analytics/costs-tab.tsx` - Cost analytics and charts
- `components/analytics/performance-tab.tsx` - Performance metrics
- `components/analytics/usage-tab.tsx` - Usage statistics
- `components/analytics/integrations-tab.tsx` - Integration analytics

### Organization & Team

- `components/organization/general-tab.tsx` - Organization general settings
- `components/organization/billing-tab.tsx` - Billing management
- `components/organization/security-tab.tsx` - Security configuration
- `components/team/members-tab.tsx` - Team member management
- `components/team/roles-tab.tsx` - Role management
- `components/team/permissions-tab.tsx` - Permission configuration
- `components/team/invited-tab.tsx` - Invitation management

### UI Components

- `components/ui/*` - Shadcn/ui components (Card, Badge, Button, Table, Dialog, etc.)

## Design System

### Colors

- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Warning:** Yellow (#f59e0b)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)

### Typography

- **Font:** Inter (via next/font/google)
- **Headings:** Bold, various sizes
- **Body:** Regular, 14px base

## Project Structure

```
agentic-trust/
├── app/                      # Next.js App Router pages
│   ├── agents/              # Agent management pages
│   ├── activity/            # Activity tracking page
│   ├── analytics/           # Analytics dashboard
│   ├── api-keys/            # API key management
│   ├── integrations/        # Integration pages
│   ├── organization/        # Organization settings
│   ├── team/                # Team management
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/              # React components
│   ├── activity/           # Activity tracking components
│   ├── analytics/          # Analytics components
│   ├── agent-builder/      # Agent builder components
│   ├── dashboard/          # Dashboard components
│   ├── integrations/       # Integration components
│   ├── organization/       # Organization components
│   ├── team/               # Team management components
│   └── ui/                 # Shadcn/ui primitives
├── lib/                    # Utilities and types
│   ├── data/               # Mock data files
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
└── public/                 # Static assets
    └── integrations/       # Integration logos and icons
```

## Future Enhancements

- [ ] Add authentication and user management
- [ ] Connect to real backend API
- [ ] Implement real-time updates with WebSockets
- [ ] Add more integrations (Stripe, Intercom, HubSpot, etc.)
- [ ] Implement gateway policies and rate limiting
- [ ] Add workflow execution engine
- [ ] Mobile responsiveness improvements
- [ ] Dark mode support
- [ ] Advanced agent testing and debugging tools
- [ ] Export capabilities for analytics and reports
- [ ] Webhook management
- [ ] Advanced RBAC (Role-Based Access Control)

## Notes

This is a frontend mockup demonstrating the UI/UX of the Agentic Trust platform. All data is mocked and no backend is required to run this application.
