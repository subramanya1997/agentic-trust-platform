// Tools available for each integration based on their API capabilities

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Tool {
  name: string;
  description: string;
  category: "read" | "write" | "action";
  parameters: Parameter[];
}

export interface IntegrationWithTools {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "API" | "MCP";
  tools: Tool[];
}

export const integrationsWithTools: IntegrationWithTools[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM and sales automation platform",
    category: "CRM",
    type: "API",
    tools: [
      { 
        name: "search_contacts", 
        description: "Search for contacts by name, email, or company", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query string", required: true },
          { name: "limit", type: "number", description: "Maximum number of results to return", required: false },
          { name: "fields", type: "string[]", description: "List of fields to include in response", required: false },
        ]
      },
      { 
        name: "get_contact", 
        description: "Get detailed contact information by ID", 
        category: "read",
        parameters: [
          { name: "contact_id", type: "string", description: "Salesforce Contact ID", required: true },
          { name: "fields", type: "string[]", description: "List of fields to retrieve", required: false },
        ]
      },
      { 
        name: "create_contact", 
        description: "Create a new contact record", 
        category: "write",
        parameters: [
          { name: "first_name", type: "string", description: "Contact's first name", required: true },
          { name: "last_name", type: "string", description: "Contact's last name", required: true },
          { name: "email", type: "string", description: "Contact's email address", required: false },
          { name: "phone", type: "string", description: "Contact's phone number", required: false },
          { name: "account_id", type: "string", description: "Associated Account ID", required: false },
        ]
      },
      { 
        name: "update_contact", 
        description: "Update an existing contact record", 
        category: "write",
        parameters: [
          { name: "contact_id", type: "string", description: "Salesforce Contact ID", required: true },
          { name: "fields", type: "object", description: "Fields to update with new values", required: true },
        ]
      },
      { 
        name: "search_leads", 
        description: "Search for leads with filters", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query string", required: false },
          { name: "status", type: "string", description: "Lead status filter", required: false },
          { name: "limit", type: "number", description: "Maximum results", required: false },
        ]
      },
      { 
        name: "create_lead", 
        description: "Create a new lead record", 
        category: "write",
        parameters: [
          { name: "first_name", type: "string", description: "Lead's first name", required: true },
          { name: "last_name", type: "string", description: "Lead's last name", required: true },
          { name: "company", type: "string", description: "Lead's company name", required: true },
          { name: "email", type: "string", description: "Lead's email address", required: false },
          { name: "source", type: "string", description: "Lead source", required: false },
        ]
      },
      { 
        name: "convert_lead", 
        description: "Convert a lead to contact and opportunity", 
        category: "action",
        parameters: [
          { name: "lead_id", type: "string", description: "Salesforce Lead ID", required: true },
          { name: "create_opportunity", type: "boolean", description: "Whether to create an opportunity", required: false },
          { name: "opportunity_name", type: "string", description: "Name for the new opportunity", required: false },
        ]
      },
      { 
        name: "run_soql_query", 
        description: "Run a custom SOQL query", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "SOQL query string", required: true },
        ]
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and collaboration",
    category: "Communication",
    type: "API",
    tools: [
      { 
        name: "send_message", 
        description: "Send a message to a channel or user", 
        category: "write",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID or name", required: true },
          { name: "text", type: "string", description: "Message text content", required: true },
          { name: "thread_ts", type: "string", description: "Thread timestamp to reply to", required: false },
          { name: "blocks", type: "object[]", description: "Rich message blocks", required: false },
        ]
      },
      { 
        name: "send_dm", 
        description: "Send a direct message to a user", 
        category: "write",
        parameters: [
          { name: "user_id", type: "string", description: "User ID to send message to", required: true },
          { name: "text", type: "string", description: "Message text content", required: true },
        ]
      },
      { 
        name: "list_channels", 
        description: "List all channels in the workspace", 
        category: "read",
        parameters: [
          { name: "exclude_archived", type: "boolean", description: "Exclude archived channels", required: false },
          { name: "types", type: "string", description: "Channel types (public, private)", required: false },
        ]
      },
      { 
        name: "get_channel_history", 
        description: "Get message history from a channel", 
        category: "read",
        parameters: [
          { name: "channel", type: "string", description: "Channel ID", required: true },
          { name: "limit", type: "number", description: "Number of messages to retrieve", required: false },
          { name: "oldest", type: "string", description: "Start of time range", required: false },
        ]
      },
      { 
        name: "search_messages", 
        description: "Search messages across channels", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "sort", type: "string", description: "Sort order (score, timestamp)", required: false },
        ]
      },
      { 
        name: "create_channel", 
        description: "Create a new Slack channel", 
        category: "write",
        parameters: [
          { name: "name", type: "string", description: "Channel name", required: true },
          { name: "is_private", type: "boolean", description: "Create as private channel", required: false },
        ]
      },
      { 
        name: "upload_file", 
        description: "Upload a file to a channel", 
        category: "write",
        parameters: [
          { name: "channel", type: "string", description: "Channel to upload to", required: true },
          { name: "file", type: "file", description: "File to upload", required: true },
          { name: "title", type: "string", description: "File title", required: false },
        ]
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code hosting and version control",
    category: "DevOps",
    type: "API",
    tools: [
      { 
        name: "list_repos", 
        description: "List repositories for a user or organization", 
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Username or organization", required: true },
          { name: "type", type: "string", description: "Repository type (all, public, private)", required: false },
        ]
      },
      { 
        name: "get_file_contents", 
        description: "Get the contents of a file", 
        category: "read",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "path", type: "string", description: "File path in repository", required: true },
          { name: "ref", type: "string", description: "Branch or commit SHA", required: false },
        ]
      },
      { 
        name: "create_file", 
        description: "Create a new file in a repository", 
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "path", type: "string", description: "File path", required: true },
          { name: "content", type: "string", description: "File content (base64 encoded)", required: true },
          { name: "message", type: "string", description: "Commit message", required: true },
          { name: "branch", type: "string", description: "Branch to commit to", required: false },
        ]
      },
      { 
        name: "create_pull_request", 
        description: "Create a new pull request", 
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Pull request title", required: true },
          { name: "head", type: "string", description: "Source branch", required: true },
          { name: "base", type: "string", description: "Target branch", required: true },
          { name: "body", type: "string", description: "Pull request description", required: false },
        ]
      },
      { 
        name: "merge_pull_request", 
        description: "Merge a pull request", 
        category: "action",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "pull_number", type: "number", description: "Pull request number", required: true },
          { name: "merge_method", type: "string", description: "Merge method (merge, squash, rebase)", required: false },
        ]
      },
      { 
        name: "create_issue", 
        description: "Create a new issue", 
        category: "write",
        parameters: [
          { name: "owner", type: "string", description: "Repository owner", required: true },
          { name: "repo", type: "string", description: "Repository name", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "body", type: "string", description: "Issue description", required: false },
          { name: "labels", type: "string[]", description: "Issue labels", required: false },
        ]
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Workspace for notes, docs, and wikis",
    category: "Productivity",
    type: "API",
    tools: [
      { 
        name: "search_pages", 
        description: "Search for pages by title or content", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Search query", required: true },
          { name: "filter", type: "object", description: "Filter by page or database", required: false },
        ]
      },
      { 
        name: "get_page", 
        description: "Get a page and its content", 
        category: "read",
        parameters: [
          { name: "page_id", type: "string", description: "Notion page ID", required: true },
        ]
      },
      { 
        name: "create_page", 
        description: "Create a new page", 
        category: "write",
        parameters: [
          { name: "parent_id", type: "string", description: "Parent page or database ID", required: true },
          { name: "title", type: "string", description: "Page title", required: true },
          { name: "content", type: "object[]", description: "Page content blocks", required: false },
        ]
      },
      { 
        name: "append_to_page", 
        description: "Append content to an existing page", 
        category: "write",
        parameters: [
          { name: "page_id", type: "string", description: "Notion page ID", required: true },
          { name: "blocks", type: "object[]", description: "Content blocks to append", required: true },
        ]
      },
      { 
        name: "query_database", 
        description: "Query a database with filters", 
        category: "read",
        parameters: [
          { name: "database_id", type: "string", description: "Database ID", required: true },
          { name: "filter", type: "object", description: "Filter conditions", required: false },
          { name: "sorts", type: "object[]", description: "Sort conditions", required: false },
        ]
      },
      { 
        name: "create_database_item", 
        description: "Create a new item in a database", 
        category: "write",
        parameters: [
          { name: "database_id", type: "string", description: "Database ID", required: true },
          { name: "properties", type: "object", description: "Item properties", required: true },
        ]
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking and project management",
    category: "DevOps",
    type: "API",
    tools: [
      { 
        name: "list_issues", 
        description: "List issues with filters", 
        category: "read",
        parameters: [
          { name: "team_id", type: "string", description: "Team ID", required: false },
          { name: "state", type: "string", description: "Issue state filter", required: false },
          { name: "assignee_id", type: "string", description: "Assignee ID", required: false },
        ]
      },
      { 
        name: "create_issue", 
        description: "Create a new issue", 
        category: "write",
        parameters: [
          { name: "team_id", type: "string", description: "Team ID", required: true },
          { name: "title", type: "string", description: "Issue title", required: true },
          { name: "description", type: "string", description: "Issue description", required: false },
          { name: "priority", type: "number", description: "Priority (0-4)", required: false },
          { name: "assignee_id", type: "string", description: "Assignee ID", required: false },
        ]
      },
      { 
        name: "update_issue", 
        description: "Update an issue", 
        category: "write",
        parameters: [
          { name: "issue_id", type: "string", description: "Issue ID", required: true },
          { name: "title", type: "string", description: "New title", required: false },
          { name: "description", type: "string", description: "New description", required: false },
          { name: "state_id", type: "string", description: "New state ID", required: false },
        ]
      },
      { 
        name: "assign_issue", 
        description: "Assign an issue to a user", 
        category: "action",
        parameters: [
          { name: "issue_id", type: "string", description: "Issue ID", required: true },
          { name: "assignee_id", type: "string", description: "User ID to assign", required: true },
        ]
      },
    ],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer service and support platform",
    category: "Support",
    type: "API",
    tools: [
      { 
        name: "list_tickets", 
        description: "List support tickets with filters", 
        category: "read",
        parameters: [
          { name: "status", type: "string", description: "Ticket status", required: false },
          { name: "assignee_id", type: "string", description: "Assignee ID", required: false },
        ]
      },
      { 
        name: "create_ticket", 
        description: "Create a new support ticket", 
        category: "write",
        parameters: [
          { name: "subject", type: "string", description: "Ticket subject", required: true },
          { name: "description", type: "string", description: "Ticket description", required: true },
          { name: "requester_email", type: "string", description: "Requester email", required: true },
          { name: "priority", type: "string", description: "Priority level", required: false },
        ]
      },
      { 
        name: "add_ticket_comment", 
        description: "Add a comment to a ticket", 
        category: "write",
        parameters: [
          { name: "ticket_id", type: "string", description: "Ticket ID", required: true },
          { name: "body", type: "string", description: "Comment text", required: true },
          { name: "public", type: "boolean", description: "Public or internal note", required: false },
        ]
      },
      { 
        name: "assign_ticket", 
        description: "Assign a ticket to an agent", 
        category: "action",
        parameters: [
          { name: "ticket_id", type: "string", description: "Ticket ID", required: true },
          { name: "assignee_id", type: "string", description: "Agent ID", required: true },
        ]
      },
    ],
  },
  {
    id: "clearbit",
    name: "Clearbit",
    description: "B2B data enrichment and lead generation",
    category: "Data",
    type: "API",
    tools: [
      { 
        name: "enrich_person", 
        description: "Get person data from an email address", 
        category: "read",
        parameters: [
          { name: "email", type: "string", description: "Email address", required: true },
        ]
      },
      { 
        name: "enrich_company", 
        description: "Get company data from a domain", 
        category: "read",
        parameters: [
          { name: "domain", type: "string", description: "Company domain", required: true },
        ]
      },
      { 
        name: "find_email", 
        description: "Find email address for a person at a company", 
        category: "read",
        parameters: [
          { name: "name", type: "string", description: "Person's full name", required: true },
          { name: "domain", type: "string", description: "Company domain", required: true },
        ]
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email service by Google",
    category: "Communication",
    type: "API",
    tools: [
      { 
        name: "send_email", 
        description: "Send an email", 
        category: "write",
        parameters: [
          { name: "to", type: "string", description: "Recipient email", required: true },
          { name: "subject", type: "string", description: "Email subject", required: true },
          { name: "body", type: "string", description: "Email body (HTML or plain text)", required: true },
          { name: "cc", type: "string", description: "CC recipients", required: false },
        ]
      },
      { 
        name: "search_emails", 
        description: "Search emails by query", 
        category: "read",
        parameters: [
          { name: "query", type: "string", description: "Gmail search query", required: true },
          { name: "max_results", type: "number", description: "Maximum results", required: false },
        ]
      },
      { 
        name: "reply_to_email", 
        description: "Reply to an email thread", 
        category: "write",
        parameters: [
          { name: "thread_id", type: "string", description: "Thread ID", required: true },
          { name: "body", type: "string", description: "Reply body", required: true },
        ]
      },
    ],
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing and meetings",
    category: "Communication",
    type: "API",
    tools: [
      { 
        name: "create_meeting", 
        description: "Schedule a new meeting", 
        category: "write",
        parameters: [
          { name: "topic", type: "string", description: "Meeting topic", required: true },
          { name: "start_time", type: "string", description: "Start time (ISO 8601)", required: true },
          { name: "duration", type: "number", description: "Duration in minutes", required: false },
          { name: "agenda", type: "string", description: "Meeting agenda", required: false },
        ]
      },
      { 
        name: "list_meetings", 
        description: "List scheduled meetings", 
        category: "read",
        parameters: [
          { name: "type", type: "string", description: "Meeting type (scheduled, live)", required: false },
        ]
      },
      { 
        name: "get_recording", 
        description: "Get recording download link", 
        category: "read",
        parameters: [
          { name: "meeting_id", type: "string", description: "Meeting ID", required: true },
        ]
      },
    ],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Accounting and financial management",
    category: "Finance",
    type: "MCP",
    tools: [
      { 
        name: "create_invoice", 
        description: "Create a new invoice", 
        category: "write",
        parameters: [
          { name: "customer_id", type: "string", description: "Customer ID", required: true },
          { name: "line_items", type: "object[]", description: "Invoice line items", required: true },
          { name: "due_date", type: "string", description: "Due date", required: false },
        ]
      },
      { 
        name: "list_invoices", 
        description: "List invoices with filters", 
        category: "read",
        parameters: [
          { name: "status", type: "string", description: "Invoice status", required: false },
          { name: "customer_id", type: "string", description: "Filter by customer", required: false },
        ]
      },
      { 
        name: "get_profit_loss", 
        description: "Get profit and loss report", 
        category: "read",
        parameters: [
          { name: "start_date", type: "string", description: "Report start date", required: true },
          { name: "end_date", type: "string", description: "Report end date", required: true },
        ]
      },
    ],
  },
];

export function getIntegrationTools(integrationId: string): IntegrationWithTools | undefined {
  return integrationsWithTools.find((i) => i.id === integrationId);
}
