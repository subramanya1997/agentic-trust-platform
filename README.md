# Nexus - AI Agent Infrastructure Platform (Mockup)

A fully functional mockup of the Nexus platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

✅ **Dashboard** - Overview of agents, executions, and key metrics with real-time stats
✅ **Agent Management** - View and manage all AI agents with status indicators
✅ **Agent Detail Pages** - Full workflow visualization with metrics and recent executions
✅ **Agent Builder** - Chat-based interface to create agents with structured instructions and AI assistant
✅ **Workflow Templates** - 6 pre-built templates for common use cases (Sales, Support, DevOps, Finance, Marketing)
✅ **Execution Monitoring** - Track agent executions in real-time with filterable table
✅ **Execution Details** - Detailed trace view with step-by-step debugging and error suggestions
✅ **Cost Analytics** - Comprehensive cost tracking with interactive charts (Line, Bar, Pie)
✅ **Integrations** - 12+ integrations with connection management (Salesforce, Slack, GitHub, etc.)
✅ **Gateway Policies** - Rate limits, cost limits, security, and authentication policies
✅ **Navigation & Layout** - Responsive sidebar navigation with professional design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
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
- `/agents/new` - Create new agent with chat-based builder (see AGENT_BUILDER.md)
- `/agents/examples/[id]` - View example agents (Feature Spec Generator, Lead Enrichment)
- `/agents/templates` - Browse 6 workflow templates by category
- `/executions` - Filterable table of all agent executions
- `/executions/[id]` - Detailed execution trace with debugging info
- `/analytics` - Cost analytics with charts and breakdowns
- `/integrations` - 12+ integrations with connection management
- `/policies` - Gateway policies for rate limits, costs, and security
- `/settings` - Settings page (placeholder)

## Agent Builder

The agent builder uses a **split-panel interface**:
- **Left Panel:** Configuration (Goal, Integrations, Instructions, Notes)
- **Right Panel:** AI chat assistant for testing and improvements

See [`AGENT_BUILDER.md`](./AGENT_BUILDER.md) for detailed documentation and examples.

## Mock Data

All data is mocked in `/lib/data/mock-data.ts`. This includes:
- 5 sample agents with various statuses
- 5 sample executions (completed, failed, running, waiting approval)
- Dashboard statistics
- Cost breakdown and trends

## Key Components

### Layout
- `components/layout/sidebar.tsx` - Main navigation sidebar
- `components/layout/header.tsx` - Top header with search and actions

### UI Components
- `components/ui/card.tsx` - Card component
- `components/ui/badge.tsx` - Status badges
- `components/ui/button.tsx` - Button component

### Dashboard
- `components/dashboard/stats-card.tsx` - Metric cards
- `components/dashboard/recent-executions.tsx` - Recent executions table
- `components/dashboard/active-agents.tsx` - Active agents list

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
nexus-mockup/
├── app/                      # Next.js App Router pages
│   ├── agents/              # Agent pages
│   ├── executions/          # Execution pages
│   ├── analytics/           # Analytics page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/              # React components
│   ├── dashboard/          # Dashboard-specific
│   ├── layout/             # Layout components
│   └── ui/                 # UI primitives
├── lib/                    # Utilities
│   ├── data/               # Mock data
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## Future Enhancements

- [ ] Add authentication
- [ ] Connect to real backend API
- [ ] Implement real-time updates with WebSockets
- [ ] Add more integrations
- [ ] Implement policy management
- [ ] Add settings page functionality
- [ ] Mobile responsiveness improvements
- [ ] Dark mode support

## Notes

This is a frontend mockup demonstrating the UI/UX of the Nexus platform. All data is mocked and no backend is required to run this application.
