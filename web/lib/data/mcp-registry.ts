/**
 * MCP Registry - Top 30 Model Context Protocol Servers
 * Curated for enterprise agentic workflows
 *
 * Categories:
 * - Developer Tools (GitHub, GitLab, Linear, Playwright)
 * - Databases (PostgreSQL, MongoDB, Supabase, Redis)
 * - Communication (Slack, Discord, Gmail, Teams)
 * - Productivity (Notion, Google Drive, Airtable, Todoist)
 * - CRM & Sales (Salesforce, HubSpot, Pipedrive)
 * - Finance (Stripe, PayPal, QuickBooks)
 * - AI & Search (Brave Search, Exa, Perplexity)
 * - Infrastructure (AWS, Docker, Cloudflare)
 * - Automation (Zapier, Make, Trigger.dev)
 * - Data Enrichment (Clearbit, Apollo)
 */

export interface MCPTool {
  name: string;
  description: string;
  category: "read" | "write" | "action";
  parameters: MCPToolParameter[];
}

export interface MCPToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
  default?: string | number | boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: MCPCategory;
  subcategory?: string;
  version: string;
  author: string;
  repository: string;
  documentation?: string;
  icon: string;
  transportTypes: ("stdio" | "http" | "sse")[];
  authTypes: ("none" | "api_key" | "oauth2" | "basic")[];
  tools: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
  featured?: boolean;
  verified?: boolean;
  downloads: number;
  stars: number;
  lastUpdated: string;
  tags: string[];
}

export interface MCPResource {
  name: string;
  description: string;
  uri: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: { name: string; description: string; required: boolean }[];
}

export type MCPCategory =
  | "Developer Tools"
  | "Databases"
  | "Communication"
  | "Productivity"
  | "CRM & Sales"
  | "Finance"
  | "AI & Search"
  | "Infrastructure"
  | "Automation"
  | "Data Enrichment"
  | "Analytics"
  | "Security";

// ============================================
// MCP SERVER REGISTRY
// ============================================

export const MCP_SERVERS: MCPServer[] = [
  // ============================================
  // DEVELOPER TOOLS
  // ============================================
  {
    id: "github",
    name: "GitHub",
    description: "Repository management, issues, PRs, and GitHub Actions",
    longDescription:
      "Full GitHub integration for repository management, issue tracking, pull request workflows, code review, and GitHub Actions automation. Supports both personal and organization repositories.",
    category: "Developer Tools",
    subcategory: "Version Control",
    version: "2.1.0",
    author: "Anthropic",
    repository: "https://github.com/modelcontextprotocol/servers",
    documentation: "https://modelcontextprotocol.io/docs/servers/github",
    icon: "github",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    featured: true,
    verified: true,
    downloads: 125000,
    stars: 4200,
    lastUpdated: "2025-01-10",
    tags: ["git", "version-control", "issues", "pull-requests", "actions", "code-review"],
    tools: [
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "sort", type: "string", description: "Sort by (stars, forks, updated)", required: false, enum: ["stars", "forks", "updated", "help-wanted-issues"] },
          { name: "per_page", type: "number", description: "Results per page (max 100)", required: false, default: 30 },
        ],
      },
      {
        name: "get_file_contents",
        description: "Get contents of a file or directory from a repository",
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "path", type: "string", description: "File path", required: true },
          { name: "ref", type: "string", description: "Branch, tag, or commit SHA", required: false },
        ],
      },
      {
        name: "create_or_update_file",
        description: "Create or update a file in a repository",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "path", type: "string", description: "File path", required: true },
          { name: "content", type: "string", description: "File content", required: true },
          { name: "message", type: "string", description: "Commit message", required: true },
          { name: "branch", type: "string", description: "Branch name", required: false },
          { name: "sha", type: "string", description: "SHA of file being replaced", required: false },
        ],
      },
      {
        name: "create_issue",
        description: "Create a new issue in a repository",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "body", type: "string", description: "Issue body", required: false },
          { name: "labels", type: "string[]", description: "Labels to assign", required: false },
          { name: "assignees", type: "string[]", description: "Users to assign", required: false },
        ],
      },
      {
        name: "create_pull_request",
        description: "Create a new pull request",
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "PR title", required: true },
          { name: "head", type: "string", description: "Source branch", required: true },
          { name: "base", type: "string", description: "Target branch", required: true },
          { name: "body", type: "string", description: "PR description", required: false },
          { name: "draft", type: "boolean", description: "Create as draft", required: false },
        ],
      },
      {
        name: "list_commits",
        description: "List commits in a repository",
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "sha", type: "string", description: "Branch or commit SHA", required: false },
          { name: "per_page", type: "number", description: "Results per page", required: false },
        ],
      },
      {
        name: "get_pull_request_diff",
        description: "Get the diff of a pull request",
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "pull_number", type: "number", description: "PR number", required: true },
        ],
      },
      {
        name: "merge_pull_request",
        description: "Merge a pull request",
        category: "action",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "pull_number", type: "number", description: "PR number", required: true },
          { name: "merge_method", type: "string", description: "Merge method", required: false, enum: ["merge", "squash", "rebase"] },
        ],
      },
    ],
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "GitLab DevOps platform integration",
    category: "Developer Tools",
    subcategory: "Version Control",
    version: "1.5.0",
    author: "GitLab Community",
    repository: "https://github.com/theodo/mcp-gitlab",
    icon: "gitlab",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 45000,
    stars: 890,
    lastUpdated: "2025-01-05",
    tags: ["git", "devops", "ci-cd", "merge-requests"],
    tools: [
      {
        name: "list_projects",
        description: "List GitLab projects",
        category: "read",
        parameters: [
          { name: "search", type: "string", description: "Search query", required: false },
          { name: "visibility", type: "string", description: "Project visibility", required: false, enum: ["public", "private", "internal"] },
        ],
      },
      {
        name: "create_merge_request",
        description: "Create a new merge request",
        category: "write",
        parameters: [
          { name: "project_id", type: "string", description: "Project ID", required: true },
          { name: "source_branch", type: "string", description: "Source branch", required: true },
          { name: "target_branch", type: "string", description: "Target branch", required: true },
          { name: "title", type: "string", description: "MR title", required: true },
        ],
      },
      {
        name: "run_pipeline",
        description: "Trigger a CI/CD pipeline",
        category: "action",
        parameters: [
          { name: "project_id", type: "string", description: "Project ID", required: true },
          { name: "ref", type: "string", description: "Branch or tag", required: true },
          { name: "variables", type: "object", description: "Pipeline variables", required: false },
        ],
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking and project management for modern teams",
    longDescription:
      "Streamlined issue tracking with Linear's modern interface. Manage issues, projects, cycles, and team workflows with natural language commands.",
    category: "Developer Tools",
    subcategory: "Project Management",
    version: "1.8.0",
    author: "Linear",
    repository: "https://github.com/linear/linear-mcp",
    documentation: "https://linear.app/docs/mcp",
    icon: "linear",
    transportTypes: ["stdio", "http"],
    authTypes: ["api_key", "oauth2"],
    featured: true,
    verified: true,
    downloads: 89000,
    stars: 2100,
    lastUpdated: "2025-01-12",
    tags: ["issues", "project-management", "agile", "sprints"],
    tools: [
      {
        name: "list_issues",
        description: "List issues with optional filters",
        category: "read",
        parameters: [
          { name: "team", type: "string", description: "Team name or ID", required: false },
          { name: "state", type: "string", description: "Issue state", required: false },
          { name: "assignee", type: "string", description: "Assignee (use 'me' for current user)", required: false },
          { name: "limit", type: "number", description: "Max results", required: false, default: 50 },
        ],
      },
      {
        name: "create_issue",
        description: "Create a new issue",
        category: "write",
        parameters: [
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "team", type: "string", description: "Team name or ID", required: true },
          { name: "description", type: "string", description: "Issue description (Markdown)", required: false },
          { name: "priority", type: "number", description: "Priority (0-4)", required: false },
          { name: "labels", type: "string[]", description: "Label names", required: false },
          { name: "assignee", type: "string", description: "Assignee ID or email", required: false },
        ],
      },
      {
        name: "update_issue",
        description: "Update an existing issue",
        category: "write",
        parameters: [
          { name: "id", type: "string", description: "Issue ID (e.g., TEAM-123)", required: true },
          { name: "title", type: "string", description: "New title", required: false },
          { name: "state", type: "string", description: "New state", required: false },
          { name: "priority", type: "number", description: "New priority", required: false },
        ],
      },
      {
        name: "list_projects",
        description: "List projects in workspace",
        category: "read",
        parameters: [
          { name: "team", type: "string", description: "Team filter", required: false },
          { name: "state", type: "string", description: "Project state", required: false },
        ],
      },
      {
        name: "add_comment",
        description: "Add a comment to an issue",
        category: "write",
        parameters: [
          { name: "issue_id", type: "string", description: "Issue ID", required: true },
          { name: "body", type: "string", description: "Comment body (Markdown)", required: true },
        ],
      },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    description: "Atlassian Jira project and issue tracking",
    category: "Developer Tools",
    subcategory: "Project Management",
    version: "2.0.0",
    author: "Atlassian Community",
    repository: "https://github.com/atlassian/mcp-jira",
    icon: "jira",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    verified: true,
    downloads: 78000,
    stars: 1500,
    lastUpdated: "2025-01-08",
    tags: ["issues", "agile", "scrum", "kanban", "atlassian"],
    tools: [
      {
        name: "search_issues",
        description: "Search issues using JQL",
        category: "read",
        parameters: [
          { name: "jql", type: "string", description: "JQL query", required: true },
          { name: "max_results", type: "number", description: "Max results", required: false, default: 50 },
          { name: "fields", type: "string[]", description: "Fields to return", required: false },
        ],
      },
      {
        name: "create_issue",
        description: "Create a new Jira issue",
        category: "write",
        parameters: [
          { name: "project", type: "string", description: "Project key", required: true },
          { name: "issue_type", type: "string", description: "Issue type (Bug, Story, Task)", required: true },
          { name: "summary", type: "string", description: "Issue summary", required: true },
          { name: "description", type: "string", description: "Issue description", required: false },
          { name: "priority", type: "string", description: "Priority", required: false },
        ],
      },
      {
        name: "transition_issue",
        description: "Transition an issue to a new status",
        category: "action",
        parameters: [
          { name: "issue_key", type: "string", description: "Issue key (e.g., PROJ-123)", required: true },
          { name: "transition", type: "string", description: "Transition name or ID", required: true },
          { name: "comment", type: "string", description: "Transition comment", required: false },
        ],
      },
    ],
  },
  {
    id: "playwright",
    name: "Playwright",
    description: "Browser automation and testing",
    longDescription:
      "Automate browser interactions using Playwright. Navigate pages, interact with elements, take screenshots, and run end-to-end tests programmatically.",
    category: "Developer Tools",
    subcategory: "Testing",
    version: "1.6.0",
    author: "Microsoft",
    repository: "https://github.com/microsoft/playwright-mcp",
    icon: "playwright",
    transportTypes: ["stdio"],
    authTypes: ["none"],
    featured: true,
    verified: true,
    downloads: 95000,
    stars: 3200,
    lastUpdated: "2025-01-11",
    tags: ["browser", "testing", "automation", "e2e", "screenshots"],
    tools: [
      {
        name: "navigate",
        description: "Navigate to a URL",
        category: "action",
        parameters: [
          { name: "url", type: "string", description: "URL to navigate to", required: true },
          { name: "wait_until", type: "string", description: "Wait condition", required: false, enum: ["load", "domcontentloaded", "networkidle"] },
        ],
      },
      {
        name: "snapshot",
        description: "Capture accessibility snapshot of the page",
        category: "read",
        parameters: [],
      },
      {
        name: "screenshot",
        description: "Take a screenshot of the page",
        category: "read",
        parameters: [
          { name: "full_page", type: "boolean", description: "Capture full page", required: false },
          { name: "selector", type: "string", description: "Element selector", required: false },
        ],
      },
      {
        name: "click",
        description: "Click an element on the page",
        category: "action",
        parameters: [
          { name: "selector", type: "string", description: "Element selector", required: true },
          { name: "button", type: "string", description: "Mouse button", required: false, enum: ["left", "right", "middle"] },
        ],
      },
      {
        name: "type",
        description: "Type text into an input element",
        category: "action",
        parameters: [
          { name: "selector", type: "string", description: "Element selector", required: true },
          { name: "text", type: "string", description: "Text to type", required: true },
          { name: "delay", type: "number", description: "Delay between keystrokes (ms)", required: false },
        ],
      },
      {
        name: "evaluate",
        description: "Execute JavaScript in the page context",
        category: "action",
        parameters: [
          { name: "script", type: "string", description: "JavaScript to execute", required: true },
        ],
      },
    ],
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Error tracking and performance monitoring",
    category: "Developer Tools",
    subcategory: "Monitoring",
    version: "1.2.0",
    author: "Sentry",
    repository: "https://github.com/getsentry/sentry-mcp",
    icon: "sentry",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 34000,
    stars: 780,
    lastUpdated: "2025-01-06",
    tags: ["errors", "monitoring", "debugging", "apm"],
    tools: [
      {
        name: "list_issues",
        description: "List Sentry issues/errors",
        category: "read",
        parameters: [
          { name: "project", type: "string", description: "Project slug", required: true },
          { name: "query", type: "string", description: "Search query", required: false },
          { name: "status", type: "string", description: "Issue status", required: false, enum: ["unresolved", "resolved", "ignored"] },
        ],
      },
      {
        name: "get_issue_events",
        description: "Get events for a specific issue",
        category: "read",
        parameters: [
          { name: "issue_id", type: "string", description: "Issue ID", required: true },
          { name: "limit", type: "number", description: "Max events", required: false },
        ],
      },
      {
        name: "resolve_issue",
        description: "Resolve a Sentry issue",
        category: "action",
        parameters: [
          { name: "issue_id", type: "string", description: "Issue ID", required: true },
          { name: "status", type: "string", description: "New status", required: true, enum: ["resolved", "ignored", "unresolved"] },
        ],
      },
    ],
  },

  // ============================================
  // DATABASES
  // ============================================
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Query and manage PostgreSQL databases",
    longDescription:
      "Execute SQL queries, manage schemas, and interact with PostgreSQL databases. Supports read-only mode for safety and schema introspection.",
    category: "Databases",
    version: "1.4.0",
    author: "Anthropic",
    repository: "https://github.com/modelcontextprotocol/servers",
    icon: "postgres",
    transportTypes: ["stdio"],
    authTypes: ["basic"],
    featured: true,
    verified: true,
    downloads: 112000,
    stars: 3800,
    lastUpdated: "2025-01-10",
    tags: ["sql", "database", "queries", "schema"],
    tools: [
      {
        name: "query",
        description: "Execute a SQL query",
        category: "read",
        parameters: [
          { name: "sql", type: "string", description: "SQL query to execute", required: true },
        ],
      },
      {
        name: "execute",
        description: "Execute a SQL statement (INSERT, UPDATE, DELETE)",
        category: "write",
        parameters: [
          { name: "sql", type: "string", description: "SQL statement", required: true },
          { name: "params", type: "array", description: "Query parameters", required: false },
        ],
      },
      {
        name: "list_tables",
        description: "List all tables in the database",
        category: "read",
        parameters: [
          { name: "schema", type: "string", description: "Schema name", required: false, default: "public" },
        ],
      },
      {
        name: "describe_table",
        description: "Get table schema and columns",
        category: "read",
        parameters: [
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "schema", type: "string", description: "Schema name", required: false },
        ],
      },
    ],
    resources: [
      { name: "schema", description: "Database schema", uri: "postgres://schema" },
    ],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    description: "Document database operations and queries",
    category: "Databases",
    version: "1.3.0",
    author: "MongoDB Community",
    repository: "https://github.com/mongodb/mcp-mongodb",
    icon: "mongodb",
    transportTypes: ["stdio"],
    authTypes: ["basic", "api_key"],
    verified: true,
    downloads: 67000,
    stars: 1400,
    lastUpdated: "2025-01-07",
    tags: ["nosql", "document-db", "queries"],
    tools: [
      {
        name: "find",
        description: "Find documents in a collection",
        category: "read",
        parameters: [
          { name: "collection", type: "string", description: "Collection name", required: true },
          { name: "filter", type: "object", description: "Query filter", required: false },
          { name: "projection", type: "object", description: "Fields to return", required: false },
          { name: "limit", type: "number", description: "Max documents", required: false },
        ],
      },
      {
        name: "insert",
        description: "Insert documents",
        category: "write",
        parameters: [
          { name: "collection", type: "string", description: "Collection name", required: true },
          { name: "documents", type: "array", description: "Documents to insert", required: true },
        ],
      },
      {
        name: "update",
        description: "Update documents",
        category: "write",
        parameters: [
          { name: "collection", type: "string", description: "Collection name", required: true },
          { name: "filter", type: "object", description: "Query filter", required: true },
          { name: "update", type: "object", description: "Update operations", required: true },
        ],
      },
      {
        name: "aggregate",
        description: "Run aggregation pipeline",
        category: "read",
        parameters: [
          { name: "collection", type: "string", description: "Collection name", required: true },
          { name: "pipeline", type: "array", description: "Aggregation pipeline", required: true },
        ],
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Open source Firebase alternative with PostgreSQL",
    category: "Databases",
    version: "1.5.0",
    author: "Supabase",
    repository: "https://github.com/supabase/mcp-supabase",
    icon: "supabase",
    transportTypes: ["stdio", "http"],
    authTypes: ["api_key"],
    featured: true,
    verified: true,
    downloads: 78000,
    stars: 2200,
    lastUpdated: "2025-01-09",
    tags: ["postgres", "realtime", "auth", "storage", "baas"],
    tools: [
      {
        name: "query",
        description: "Execute a SQL query",
        category: "read",
        parameters: [
          { name: "sql", type: "string", description: "SQL query", required: true },
        ],
      },
      {
        name: "select",
        description: "Select data from a table",
        category: "read",
        parameters: [
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "columns", type: "string", description: "Columns to select", required: false, default: "*" },
          { name: "filter", type: "object", description: "Filter conditions", required: false },
        ],
      },
      {
        name: "insert",
        description: "Insert data into a table",
        category: "write",
        parameters: [
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "data", type: "object", description: "Data to insert", required: true },
        ],
      },
      {
        name: "storage_upload",
        description: "Upload a file to storage",
        category: "write",
        parameters: [
          { name: "bucket", type: "string", description: "Storage bucket", required: true },
          { name: "path", type: "string", description: "File path", required: true },
          { name: "file", type: "file", description: "File to upload", required: true },
        ],
      },
    ],
  },
  {
    id: "redis",
    name: "Redis",
    description: "In-memory data store operations",
    category: "Databases",
    version: "1.2.0",
    author: "Redis Community",
    repository: "https://github.com/redis/mcp-redis",
    icon: "redis",
    transportTypes: ["stdio"],
    authTypes: ["basic", "none"],
    verified: true,
    downloads: 45000,
    stars: 980,
    lastUpdated: "2025-01-04",
    tags: ["cache", "key-value", "pubsub", "streams"],
    tools: [
      {
        name: "get",
        description: "Get a value by key",
        category: "read",
        parameters: [
          { name: "key", type: "string", description: "Key name", required: true },
        ],
      },
      {
        name: "set",
        description: "Set a key-value pair",
        category: "write",
        parameters: [
          { name: "key", type: "string", description: "Key name", required: true },
          { name: "value", type: "string", description: "Value", required: true },
          { name: "ttl", type: "number", description: "TTL in seconds", required: false },
        ],
      },
      {
        name: "keys",
        description: "Find keys matching a pattern",
        category: "read",
        parameters: [
          { name: "pattern", type: "string", description: "Pattern to match", required: true },
        ],
      },
      {
        name: "publish",
        description: "Publish a message to a channel",
        category: "action",
        parameters: [
          { name: "channel", type: "string", description: "Channel name", required: true },
          { name: "message", type: "string", description: "Message", required: true },
        ],
      },
    ],
  },

  // ============================================
  // COMMUNICATION
  // ============================================
  {
    id: "slack",
    name: "Slack",
    description: "Team messaging and collaboration",
    longDescription:
      "Full Slack integration for sending messages, managing channels, searching conversations, and automating team workflows.",
    category: "Communication",
    version: "2.0.0",
    author: "Slack",
    repository: "https://github.com/slack/mcp-slack",
    icon: "slack",
    transportTypes: ["stdio", "http"],
    authTypes: ["oauth2"],
    featured: true,
    verified: true,
    downloads: 134000,
    stars: 4500,
    lastUpdated: "2025-01-12",
    tags: ["messaging", "teams", "channels", "notifications"],
    tools: [
      {
        name: "send_message",
        description: "Send a message to a channel or user",
        category: "write",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID or name", required: true },
          { name: "text", type: "string", description: "Message text", required: true },
          { name: "thread_ts", type: "string", description: "Reply to thread", required: false },
          { name: "blocks", type: "array", description: "Block Kit blocks", required: false },
        ],
      },
      {
        name: "list_channels",
        description: "List channels in the workspace",
        category: "read",
        parameters: [
          { name: "types", type: "string", description: "Channel types", required: false },
          { name: "exclude_archived", type: "boolean", description: "Exclude archived", required: false },
        ],
      },
      {
        name: "search_messages",
        description: "Search for messages",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "sort", type: "string", description: "Sort order", required: false, enum: ["score", "timestamp"] },
        ],
      },
      {
        name: "get_channel_history",
        description: "Get message history from a channel",
        category: "read",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID", required: true },
          { name: "limit", type: "number", description: "Max messages", required: false },
        ],
      },
      {
        name: "add_reaction",
        description: "Add an emoji reaction to a message",
        category: "action",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID", required: true },
          { name: "timestamp", type: "string", description: "Message timestamp", required: true },
          { name: "emoji", type: "string", description: "Emoji name", required: true },
        ],
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Community platform messaging",
    category: "Communication",
    version: "1.4.0",
    author: "Discord Community",
    repository: "https://github.com/discord/mcp-discord",
    icon: "discord",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 56000,
    stars: 1200,
    lastUpdated: "2025-01-05",
    tags: ["messaging", "communities", "voice", "bots"],
    tools: [
      {
        name: "send_message",
        description: "Send a message to a channel",
        category: "write",
        parameters: [
          { name: "channel_id", type: "string", description: "Channel ID", required: true },
          { name: "content", type: "string", description: "Message content", required: true },
          { name: "embed", type: "object", description: "Embed object", required: false },
        ],
      },
      {
        name: "list_channels",
        description: "List channels in a guild",
        category: "read",
        parameters: [
          { name: "guild_id", type: "string", description: "Guild ID", required: true },
        ],
      },
      {
        name: "get_messages",
        description: "Get messages from a channel",
        category: "read",
        parameters: [
          { name: "channel_id", type: "string", description: "Channel ID", required: true },
          { name: "limit", type: "number", description: "Max messages", required: false },
        ],
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email management with Gmail API",
    category: "Communication",
    version: "1.3.0",
    author: "Google",
    repository: "https://github.com/google/mcp-gmail",
    icon: "gmail",
    transportTypes: ["stdio"],
    authTypes: ["oauth2"],
    verified: true,
    downloads: 89000,
    stars: 2100,
    lastUpdated: "2025-01-08",
    tags: ["email", "google", "workspace"],
    tools: [
      {
        name: "send_email",
        description: "Send an email",
        category: "write",
        parameters: [
          { name: "to", type: "string", description: "Recipient email", required: true },
          { name: "subject", type: "string", description: "Email subject", required: true },
          { name: "body", type: "string", description: "Email body (HTML)", required: true },
          { name: "cc", type: "string", description: "CC recipients", required: false },
          { name: "attachments", type: "array", description: "File attachments", required: false },
        ],
      },
      {
        name: "search_emails",
        description: "Search for emails",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Gmail search query", required: true },
          { name: "max_results", type: "number", description: "Max results", required: false },
        ],
      },
      {
        name: "get_email",
        description: "Get a specific email",
        category: "read",
        parameters: [
          { name: "message_id", type: "string", description: "Message ID", required: true },
        ],
      },
      {
        name: "reply_to_email",
        description: "Reply to an email thread",
        category: "write",
        parameters: [
          { name: "thread_id", type: "string", description: "Thread ID", required: true },
          { name: "body", type: "string", description: "Reply body", required: true },
        ],
      },
    ],
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Microsoft Teams chat and collaboration",
    category: "Communication",
    version: "1.2.0",
    author: "Microsoft",
    repository: "https://github.com/microsoft/mcp-teams",
    icon: "teams",
    transportTypes: ["stdio"],
    authTypes: ["oauth2"],
    verified: true,
    downloads: 67000,
    stars: 1100,
    lastUpdated: "2025-01-06",
    tags: ["messaging", "microsoft", "365", "enterprise"],
    tools: [
      {
        name: "send_message",
        description: "Send a message to a channel or chat",
        category: "write",
        parameters: [
          { name: "channel_id", type: "string", description: "Channel or chat ID", required: true },
          { name: "content", type: "string", description: "Message content", required: true },
        ],
      },
      {
        name: "list_teams",
        description: "List teams the user is a member of",
        category: "read",
        parameters: [],
      },
      {
        name: "list_channels",
        description: "List channels in a team",
        category: "read",
        parameters: [
          { name: "team_id", type: "string", description: "Team ID", required: true },
        ],
      },
    ],
  },

  // ============================================
  // PRODUCTIVITY
  // ============================================
  {
    id: "notion",
    name: "Notion",
    description: "All-in-one workspace for notes, docs, and databases",
    longDescription:
      "Full Notion integration for managing pages, databases, and content. Create, update, and query your Notion workspace programmatically.",
    category: "Productivity",
    version: "1.6.0",
    author: "Notion",
    repository: "https://github.com/notion/mcp-notion",
    icon: "notion",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    featured: true,
    verified: true,
    downloads: 98000,
    stars: 2800,
    lastUpdated: "2025-01-11",
    tags: ["notes", "wiki", "databases", "docs"],
    tools: [
      {
        name: "search",
        description: "Search pages and databases",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "filter", type: "object", description: "Filter by page or database", required: false },
        ],
      },
      {
        name: "get_page",
        description: "Get a page and its content",
        category: "read",
        parameters: [
          { name: "page_id", type: "string", description: "Page ID", required: true },
        ],
      },
      {
        name: "create_page",
        description: "Create a new page",
        category: "write",
        parameters: [
          { name: "parent_id", type: "string", description: "Parent page or database ID", required: true },
          { name: "title", type: "string", description: "Page title", required: true },
          { name: "content", type: "array", description: "Page content blocks", required: false },
          { name: "properties", type: "object", description: "Database properties", required: false },
        ],
      },
      {
        name: "update_page",
        description: "Update a page's properties",
        category: "write",
        parameters: [
          { name: "page_id", type: "string", description: "Page ID", required: true },
          { name: "properties", type: "object", description: "Properties to update", required: true },
        ],
      },
      {
        name: "query_database",
        description: "Query a database with filters",
        category: "read",
        parameters: [
          { name: "database_id", type: "string", description: "Database ID", required: true },
          { name: "filter", type: "object", description: "Filter conditions", required: false },
          { name: "sorts", type: "array", description: "Sort conditions", required: false },
        ],
      },
      {
        name: "append_blocks",
        description: "Append blocks to a page",
        category: "write",
        parameters: [
          { name: "page_id", type: "string", description: "Page ID", required: true },
          { name: "blocks", type: "array", description: "Blocks to append", required: true },
        ],
      },
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Cloud file storage and management",
    category: "Productivity",
    version: "1.4.0",
    author: "Google",
    repository: "https://github.com/google/mcp-drive",
    icon: "gdrive",
    transportTypes: ["stdio"],
    authTypes: ["oauth2"],
    featured: true,
    verified: true,
    downloads: 87000,
    stars: 1900,
    lastUpdated: "2025-01-09",
    tags: ["files", "storage", "google", "workspace"],
    tools: [
      {
        name: "list_files",
        description: "List files and folders",
        category: "read",
        parameters: [
          { name: "folder_id", type: "string", description: "Folder ID (root by default)", required: false },
          { name: "query", type: "string", description: "Search query", required: false },
        ],
      },
      {
        name: "get_file",
        description: "Get file metadata and content",
        category: "read",
        parameters: [
          { name: "file_id", type: "string", description: "File ID", required: true },
        ],
      },
      {
        name: "create_file",
        description: "Create a new file",
        category: "write",
        parameters: [
          { name: "name", type: "string", description: "File name", required: true },
          { name: "content", type: "string", description: "File content", required: true },
          { name: "mime_type", type: "string", description: "MIME type", required: false },
          { name: "folder_id", type: "string", description: "Parent folder ID", required: false },
        ],
      },
      {
        name: "share_file",
        description: "Share a file with users",
        category: "action",
        parameters: [
          { name: "file_id", type: "string", description: "File ID", required: true },
          { name: "email", type: "string", description: "User email", required: true },
          { name: "role", type: "string", description: "Permission role", required: true, enum: ["reader", "writer", "commenter"] },
        ],
      },
    ],
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Spreadsheet-database hybrid for teams",
    category: "Productivity",
    version: "1.3.0",
    author: "Airtable",
    repository: "https://github.com/airtable/mcp-airtable",
    icon: "airtable",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    verified: true,
    downloads: 45000,
    stars: 890,
    lastUpdated: "2025-01-07",
    tags: ["spreadsheet", "database", "collaboration"],
    tools: [
      {
        name: "list_records",
        description: "List records from a table",
        category: "read",
        parameters: [
          { name: "base_id", type: "string", description: "Base ID", required: true },
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "filter", type: "string", description: "Filter formula", required: false },
          { name: "sort", type: "array", description: "Sort fields", required: false },
        ],
      },
      {
        name: "create_record",
        description: "Create a new record",
        category: "write",
        parameters: [
          { name: "base_id", type: "string", description: "Base ID", required: true },
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "fields", type: "object", description: "Record fields", required: true },
        ],
      },
      {
        name: "update_record",
        description: "Update an existing record",
        category: "write",
        parameters: [
          { name: "base_id", type: "string", description: "Base ID", required: true },
          { name: "table", type: "string", description: "Table name", required: true },
          { name: "record_id", type: "string", description: "Record ID", required: true },
          { name: "fields", type: "object", description: "Fields to update", required: true },
        ],
      },
    ],
  },
  {
    id: "todoist",
    name: "Todoist",
    description: "Task management and to-do lists",
    category: "Productivity",
    version: "1.2.0",
    author: "Todoist",
    repository: "https://github.com/todoist/mcp-todoist",
    icon: "todoist",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    verified: true,
    downloads: 34000,
    stars: 670,
    lastUpdated: "2025-01-05",
    tags: ["tasks", "todo", "productivity", "gtd"],
    tools: [
      {
        name: "list_tasks",
        description: "List tasks with filters",
        category: "read",
        parameters: [
          { name: "project_id", type: "string", description: "Project ID", required: false },
          { name: "filter", type: "string", description: "Filter query", required: false },
        ],
      },
      {
        name: "create_task",
        description: "Create a new task",
        category: "write",
        parameters: [
          { name: "content", type: "string", description: "Task content", required: true },
          { name: "project_id", type: "string", description: "Project ID", required: false },
          { name: "due_string", type: "string", description: "Due date (natural language)", required: false },
          { name: "priority", type: "number", description: "Priority (1-4)", required: false },
        ],
      },
      {
        name: "complete_task",
        description: "Mark a task as complete",
        category: "action",
        parameters: [
          { name: "task_id", type: "string", description: "Task ID", required: true },
        ],
      },
    ],
  },

  // ============================================
  // CRM & SALES
  // ============================================
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Enterprise CRM and sales platform",
    longDescription:
      "Comprehensive Salesforce integration for managing leads, contacts, opportunities, and accounts. Execute SOQL queries and automate sales workflows.",
    category: "CRM & Sales",
    version: "2.1.0",
    author: "Salesforce",
    repository: "https://github.com/salesforce/mcp-salesforce",
    icon: "salesforce",
    transportTypes: ["stdio", "http"],
    authTypes: ["oauth2"],
    featured: true,
    verified: true,
    downloads: 92000,
    stars: 2400,
    lastUpdated: "2025-01-10",
    tags: ["crm", "sales", "leads", "enterprise"],
    tools: [
      {
        name: "query",
        description: "Execute a SOQL query",
        category: "read",
        parameters: [
          { name: "soql", type: "string", description: "SOQL query", required: true },
        ],
      },
      {
        name: "get_record",
        description: "Get a record by ID",
        category: "read",
        parameters: [
          { name: "object", type: "string", description: "Object type (Account, Contact, etc.)", required: true },
          { name: "id", type: "string", description: "Record ID", required: true },
          { name: "fields", type: "string[]", description: "Fields to retrieve", required: false },
        ],
      },
      {
        name: "create_record",
        description: "Create a new record",
        category: "write",
        parameters: [
          { name: "object", type: "string", description: "Object type", required: true },
          { name: "fields", type: "object", description: "Record fields", required: true },
        ],
      },
      {
        name: "update_record",
        description: "Update an existing record",
        category: "write",
        parameters: [
          { name: "object", type: "string", description: "Object type", required: true },
          { name: "id", type: "string", description: "Record ID", required: true },
          { name: "fields", type: "object", description: "Fields to update", required: true },
        ],
      },
      {
        name: "search",
        description: "Full-text search across objects",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "objects", type: "string[]", description: "Objects to search", required: false },
        ],
      },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Inbound marketing and sales platform",
    category: "CRM & Sales",
    version: "1.5.0",
    author: "HubSpot",
    repository: "https://github.com/hubspot/mcp-hubspot",
    icon: "hubspot",
    transportTypes: ["stdio"],
    authTypes: ["api_key", "oauth2"],
    verified: true,
    downloads: 56000,
    stars: 1100,
    lastUpdated: "2025-01-08",
    tags: ["crm", "marketing", "sales", "automation"],
    tools: [
      {
        name: "search_contacts",
        description: "Search for contacts",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: false },
          { name: "filters", type: "array", description: "Filter conditions", required: false },
        ],
      },
      {
        name: "create_contact",
        description: "Create a new contact",
        category: "write",
        parameters: [
          { name: "email", type: "string", description: "Email address", required: true },
          { name: "firstname", type: "string", description: "First name", required: false },
          { name: "lastname", type: "string", description: "Last name", required: false },
          { name: "properties", type: "object", description: "Additional properties", required: false },
        ],
      },
      {
        name: "create_deal",
        description: "Create a new deal",
        category: "write",
        parameters: [
          { name: "dealname", type: "string", description: "Deal name", required: true },
          { name: "pipeline", type: "string", description: "Pipeline ID", required: true },
          { name: "dealstage", type: "string", description: "Deal stage", required: true },
          { name: "amount", type: "number", description: "Deal amount", required: false },
        ],
      },
    ],
  },

  // ============================================
  // FINANCE
  // ============================================
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and billing",
    category: "Finance",
    version: "1.4.0",
    author: "Stripe",
    repository: "https://github.com/stripe/mcp-stripe",
    icon: "stripe",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    featured: true,
    verified: true,
    downloads: 78000,
    stars: 1800,
    lastUpdated: "2025-01-09",
    tags: ["payments", "billing", "subscriptions", "invoices"],
    tools: [
      {
        name: "list_customers",
        description: "List Stripe customers",
        category: "read",
        parameters: [
          { name: "email", type: "string", description: "Filter by email", required: false },
          { name: "limit", type: "number", description: "Max results", required: false },
        ],
      },
      {
        name: "create_customer",
        description: "Create a new customer",
        category: "write",
        parameters: [
          { name: "email", type: "string", description: "Customer email", required: true },
          { name: "name", type: "string", description: "Customer name", required: false },
          { name: "metadata", type: "object", description: "Metadata", required: false },
        ],
      },
      {
        name: "create_invoice",
        description: "Create an invoice",
        category: "write",
        parameters: [
          { name: "customer", type: "string", description: "Customer ID", required: true },
          { name: "items", type: "array", description: "Invoice items", required: true },
          { name: "auto_advance", type: "boolean", description: "Auto-finalize", required: false },
        ],
      },
      {
        name: "list_subscriptions",
        description: "List subscriptions",
        category: "read",
        parameters: [
          { name: "customer", type: "string", description: "Customer ID", required: false },
          { name: "status", type: "string", description: "Subscription status", required: false },
        ],
      },
    ],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Accounting and bookkeeping",
    category: "Finance",
    version: "1.2.0",
    author: "Intuit",
    repository: "https://github.com/intuit/mcp-quickbooks",
    icon: "quickbooks",
    transportTypes: ["stdio"],
    authTypes: ["oauth2"],
    verified: true,
    downloads: 34000,
    stars: 560,
    lastUpdated: "2025-01-06",
    tags: ["accounting", "invoices", "expenses", "reports"],
    tools: [
      {
        name: "create_invoice",
        description: "Create a new invoice",
        category: "write",
        parameters: [
          { name: "customer_id", type: "string", description: "Customer ID", required: true },
          { name: "line_items", type: "array", description: "Invoice items", required: true },
          { name: "due_date", type: "string", description: "Due date", required: false },
        ],
      },
      {
        name: "list_invoices",
        description: "List invoices",
        category: "read",
        parameters: [
          { name: "customer_id", type: "string", description: "Filter by customer", required: false },
          { name: "status", type: "string", description: "Invoice status", required: false },
        ],
      },
      {
        name: "get_profit_loss",
        description: "Get profit and loss report",
        category: "read",
        parameters: [
          { name: "start_date", type: "string", description: "Start date", required: true },
          { name: "end_date", type: "string", description: "End date", required: true },
        ],
      },
    ],
  },

  // ============================================
  // AI & SEARCH
  // ============================================
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Privacy-focused web search",
    category: "AI & Search",
    version: "1.3.0",
    author: "Brave",
    repository: "https://github.com/anthropics/mcp-servers",
    icon: "brave",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    featured: true,
    verified: true,
    downloads: 145000,
    stars: 3900,
    lastUpdated: "2025-01-11",
    tags: ["search", "web", "privacy", "ai"],
    tools: [
      {
        name: "web_search",
        description: "Search the web",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "count", type: "number", description: "Number of results", required: false, default: 10 },
          { name: "freshness", type: "string", description: "Time filter", required: false, enum: ["day", "week", "month", "year"] },
        ],
      },
      {
        name: "local_search",
        description: "Search for local businesses",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "location", type: "string", description: "Location", required: false },
        ],
      },
    ],
  },
  {
    id: "exa",
    name: "Exa",
    description: "AI-native search engine",
    category: "AI & Search",
    version: "1.4.0",
    author: "Exa",
    repository: "https://github.com/exa-labs/mcp-exa",
    icon: "exa",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    featured: true,
    verified: true,
    downloads: 67000,
    stars: 1600,
    lastUpdated: "2025-01-10",
    tags: ["search", "ai", "embeddings", "semantic"],
    tools: [
      {
        name: "search",
        description: "Semantic search the web",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Natural language query", required: true },
          { name: "num_results", type: "number", description: "Number of results", required: false },
          { name: "type", type: "string", description: "Search type", required: false, enum: ["neural", "keyword", "auto"] },
        ],
      },
      {
        name: "find_similar",
        description: "Find similar pages to a URL",
        category: "read",
        parameters: [
          { name: "url", type: "string", description: "URL to find similar", required: true },
          { name: "num_results", type: "number", description: "Number of results", required: false },
        ],
      },
      {
        name: "get_contents",
        description: "Get full contents of URLs",
        category: "read",
        parameters: [
          { name: "urls", type: "string[]", description: "URLs to fetch", required: true },
        ],
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "AI-powered research and answers",
    category: "AI & Search",
    version: "1.2.0",
    author: "Perplexity",
    repository: "https://github.com/perplexity-ai/mcp-perplexity",
    icon: "perplexity",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 45000,
    stars: 980,
    lastUpdated: "2025-01-08",
    tags: ["search", "ai", "research", "answers"],
    tools: [
      {
        name: "ask",
        description: "Ask a question and get a researched answer",
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Question to ask", required: true },
          { name: "model", type: "string", description: "Model to use", required: false },
        ],
      },
    ],
  },

  // ============================================
  // INFRASTRUCTURE
  // ============================================
  {
    id: "aws",
    name: "AWS",
    description: "Amazon Web Services cloud operations",
    category: "Infrastructure",
    version: "1.5.0",
    author: "AWS",
    repository: "https://github.com/aws/mcp-aws",
    icon: "aws",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    featured: true,
    verified: true,
    downloads: 89000,
    stars: 2100,
    lastUpdated: "2025-01-10",
    tags: ["cloud", "ec2", "s3", "lambda", "devops"],
    tools: [
      {
        name: "list_s3_buckets",
        description: "List S3 buckets",
        category: "read",
        parameters: [],
      },
      {
        name: "s3_get_object",
        description: "Get an object from S3",
        category: "read",
        parameters: [
          { name: "bucket", type: "string", description: "Bucket name", required: true },
          { name: "key", type: "string", description: "Object key", required: true },
        ],
      },
      {
        name: "s3_put_object",
        description: "Upload an object to S3",
        category: "write",
        parameters: [
          { name: "bucket", type: "string", description: "Bucket name", required: true },
          { name: "key", type: "string", description: "Object key", required: true },
          { name: "body", type: "string", description: "Object content", required: true },
        ],
      },
      {
        name: "invoke_lambda",
        description: "Invoke a Lambda function",
        category: "action",
        parameters: [
          { name: "function_name", type: "string", description: "Function name", required: true },
          { name: "payload", type: "object", description: "Event payload", required: false },
        ],
      },
      {
        name: "list_ec2_instances",
        description: "List EC2 instances",
        category: "read",
        parameters: [
          { name: "filters", type: "array", description: "Instance filters", required: false },
        ],
      },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    description: "Container management and operations",
    category: "Infrastructure",
    version: "1.3.0",
    author: "Docker",
    repository: "https://github.com/docker/mcp-docker",
    icon: "docker",
    transportTypes: ["stdio"],
    authTypes: ["none"],
    verified: true,
    downloads: 56000,
    stars: 1200,
    lastUpdated: "2025-01-07",
    tags: ["containers", "devops", "deployment"],
    tools: [
      {
        name: "list_containers",
        description: "List running containers",
        category: "read",
        parameters: [
          { name: "all", type: "boolean", description: "Include stopped containers", required: false },
        ],
      },
      {
        name: "run_container",
        description: "Run a container",
        category: "action",
        parameters: [
          { name: "image", type: "string", description: "Image name", required: true },
          { name: "name", type: "string", description: "Container name", required: false },
          { name: "ports", type: "object", description: "Port mappings", required: false },
          { name: "env", type: "object", description: "Environment variables", required: false },
        ],
      },
      {
        name: "stop_container",
        description: "Stop a container",
        category: "action",
        parameters: [
          { name: "container", type: "string", description: "Container ID or name", required: true },
        ],
      },
      {
        name: "logs",
        description: "Get container logs",
        category: "read",
        parameters: [
          { name: "container", type: "string", description: "Container ID or name", required: true },
          { name: "tail", type: "number", description: "Number of lines", required: false },
        ],
      },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description: "CDN, DNS, and edge computing",
    category: "Infrastructure",
    version: "1.2.0",
    author: "Cloudflare",
    repository: "https://github.com/cloudflare/mcp-cloudflare",
    icon: "cloudflare",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 34000,
    stars: 780,
    lastUpdated: "2025-01-06",
    tags: ["cdn", "dns", "workers", "security"],
    tools: [
      {
        name: "list_zones",
        description: "List DNS zones",
        category: "read",
        parameters: [],
      },
      {
        name: "list_dns_records",
        description: "List DNS records for a zone",
        category: "read",
        parameters: [
          { name: "zone_id", type: "string", description: "Zone ID", required: true },
        ],
      },
      {
        name: "create_dns_record",
        description: "Create a DNS record",
        category: "write",
        parameters: [
          { name: "zone_id", type: "string", description: "Zone ID", required: true },
          { name: "type", type: "string", description: "Record type", required: true },
          { name: "name", type: "string", description: "Record name", required: true },
          { name: "content", type: "string", description: "Record content", required: true },
        ],
      },
      {
        name: "purge_cache",
        description: "Purge CDN cache",
        category: "action",
        parameters: [
          { name: "zone_id", type: "string", description: "Zone ID", required: true },
          { name: "urls", type: "string[]", description: "URLs to purge", required: false },
          { name: "purge_everything", type: "boolean", description: "Purge all", required: false },
        ],
      },
    ],
  },

  // ============================================
  // AUTOMATION
  // ============================================
  {
    id: "zapier",
    name: "Zapier",
    description: "Workflow automation and integrations",
    category: "Automation",
    version: "1.3.0",
    author: "Zapier",
    repository: "https://github.com/zapier/mcp-zapier",
    icon: "zapier",
    transportTypes: ["http"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 67000,
    stars: 1400,
    lastUpdated: "2025-01-09",
    tags: ["automation", "workflows", "integrations", "nocode"],
    tools: [
      {
        name: "list_zaps",
        description: "List your Zaps",
        category: "read",
        parameters: [],
      },
      {
        name: "run_zap",
        description: "Trigger a Zap",
        category: "action",
        parameters: [
          { name: "zap_id", type: "string", description: "Zap ID", required: true },
          { name: "data", type: "object", description: "Input data", required: false },
        ],
      },
      {
        name: "create_zap",
        description: "Create a new Zap",
        category: "write",
        parameters: [
          { name: "name", type: "string", description: "Zap name", required: true },
          { name: "trigger", type: "object", description: "Trigger configuration", required: true },
          { name: "actions", type: "array", description: "Actions configuration", required: true },
        ],
      },
    ],
  },
  {
    id: "trigger-dev",
    name: "Trigger.dev",
    description: "Background jobs and scheduled tasks",
    category: "Automation",
    version: "1.4.0",
    author: "Trigger.dev",
    repository: "https://github.com/triggerdotdev/mcp-trigger",
    icon: "trigger",
    transportTypes: ["stdio", "http"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 45000,
    stars: 890,
    lastUpdated: "2025-01-08",
    tags: ["jobs", "background", "scheduled", "serverless"],
    tools: [
      {
        name: "trigger_job",
        description: "Trigger a background job",
        category: "action",
        parameters: [
          { name: "job_id", type: "string", description: "Job identifier", required: true },
          { name: "payload", type: "object", description: "Job payload", required: false },
        ],
      },
      {
        name: "list_runs",
        description: "List job runs",
        category: "read",
        parameters: [
          { name: "job_id", type: "string", description: "Job filter", required: false },
          { name: "status", type: "string", description: "Status filter", required: false },
        ],
      },
      {
        name: "cancel_run",
        description: "Cancel a running job",
        category: "action",
        parameters: [
          { name: "run_id", type: "string", description: "Run ID", required: true },
        ],
      },
    ],
  },

  // ============================================
  // DATA ENRICHMENT
  // ============================================
  {
    id: "clearbit",
    name: "Clearbit",
    description: "B2B data enrichment and lead scoring",
    category: "Data Enrichment",
    version: "1.2.0",
    author: "Clearbit",
    repository: "https://github.com/clearbit/mcp-clearbit",
    icon: "clearbit",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 34000,
    stars: 560,
    lastUpdated: "2025-01-05",
    tags: ["enrichment", "b2b", "leads", "data"],
    tools: [
      {
        name: "enrich_person",
        description: "Enrich person data from email",
        category: "read",
        parameters: [
          { name: "email", type: "string", description: "Email address", required: true },
        ],
      },
      {
        name: "enrich_company",
        description: "Enrich company data from domain",
        category: "read",
        parameters: [
          { name: "domain", type: "string", description: "Company domain", required: true },
        ],
      },
      {
        name: "find_email",
        description: "Find email for a person at a company",
        category: "read",
        parameters: [
          { name: "name", type: "string", description: "Person name", required: true },
          { name: "domain", type: "string", description: "Company domain", required: true },
        ],
      },
    ],
  },
  {
    id: "apollo",
    name: "Apollo.io",
    description: "Sales intelligence and engagement",
    category: "Data Enrichment",
    version: "1.3.0",
    author: "Apollo",
    repository: "https://github.com/apolloio/mcp-apollo",
    icon: "apollo",
    transportTypes: ["stdio"],
    authTypes: ["api_key"],
    verified: true,
    downloads: 28000,
    stars: 420,
    lastUpdated: "2025-01-04",
    tags: ["sales", "leads", "enrichment", "outreach"],
    tools: [
      {
        name: "search_people",
        description: "Search for contacts",
        category: "read",
        parameters: [
          { name: "titles", type: "string[]", description: "Job titles", required: false },
          { name: "company_domains", type: "string[]", description: "Company domains", required: false },
          { name: "locations", type: "string[]", description: "Locations", required: false },
        ],
      },
      {
        name: "enrich_person",
        description: "Enrich a person's data",
        category: "read",
        parameters: [
          { name: "email", type: "string", description: "Email address", required: false },
          { name: "linkedin_url", type: "string", description: "LinkedIn URL", required: false },
        ],
      },
      {
        name: "create_sequence",
        description: "Create an email sequence",
        category: "write",
        parameters: [
          { name: "name", type: "string", description: "Sequence name", required: true },
          { name: "steps", type: "array", description: "Sequence steps", required: true },
        ],
      },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all MCP servers
 */
export function getAllMCPServers(): MCPServer[] {
  return MCP_SERVERS;
}

/**
 * Get featured MCP servers
 */
export function getFeaturedMCPServers(): MCPServer[] {
  return MCP_SERVERS.filter((server) => server.featured);
}

/**
 * Get verified MCP servers
 */
export function getVerifiedMCPServers(): MCPServer[] {
  return MCP_SERVERS.filter((server) => server.verified);
}

/**
 * Get MCP server by ID
 */
export function getMCPServerById(id: string): MCPServer | undefined {
  return MCP_SERVERS.find((server) => server.id === id);
}

/**
 * Get MCP servers by category
 */
export function getMCPServersByCategory(category: MCPCategory): MCPServer[] {
  return MCP_SERVERS.filter((server) => server.category === category);
}

/**
 * Get all unique categories
 */
export function getMCPCategories(): MCPCategory[] {
  return [...new Set(MCP_SERVERS.map((server) => server.category))];
}

/**
 * Get all unique tags
 */
export function getMCPTags(): string[] {
  const allTags = MCP_SERVERS.flatMap((server) => server.tags);
  return [...new Set(allTags)].sort();
}

/**
 * Search MCP servers by query
 */
export function searchMCPServers(query: string): MCPServer[] {
  const lowerQuery = query.toLowerCase();
  return MCP_SERVERS.filter(
    (server) =>
      server.name.toLowerCase().includes(lowerQuery) ||
      server.description.toLowerCase().includes(lowerQuery) ||
      server.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get most popular MCP servers (by downloads)
 */
export function getPopularMCPServers(limit: number = 10): MCPServer[] {
  return [...MCP_SERVERS].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
}

/**
 * Get recently updated MCP servers
 */
export function getRecentlyUpdatedMCPServers(limit: number = 10): MCPServer[] {
  return [...MCP_SERVERS]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit);
}

/**
 * Get total tool count across all servers
 */
export function getTotalToolCount(): number {
  return MCP_SERVERS.reduce((sum, server) => sum + server.tools.length, 0);
}

/**
 * Get MCP server stats
 */
export function getMCPRegistryStats() {
  return {
    totalServers: MCP_SERVERS.length,
    totalTools: getTotalToolCount(),
    totalDownloads: MCP_SERVERS.reduce((sum, server) => sum + server.downloads, 0),
    categories: getMCPCategories().length,
    featuredCount: getFeaturedMCPServers().length,
    verifiedCount: getVerifiedMCPServers().length,
  };
}



