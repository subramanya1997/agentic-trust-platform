"use client";

import Link from "next/link";
import { useState } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import { AddIntegrationDialog } from "@/components/integrations/add-integration-dialog";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Search, Check } from "@/lib/icons";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  usageCount?: number;
}

const integrations: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM platform",
    category: "CRM",
    connected: true,
    usageCount: 3,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication",
    category: "Communication",
    connected: true,
    usageCount: 5,
  },
  {
    id: "clearbit",
    name: "Clearbit",
    description: "Data enrichment",
    category: "Data",
    connected: true,
    usageCount: 2,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository",
    category: "DevOps",
    connected: true,
    usageCount: 2,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer support",
    category: "Support",
    connected: true,
    usageCount: 1,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Docs and wikis",
    category: "Productivity",
    connected: true,
    usageCount: 4,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking",
    category: "DevOps",
    connected: true,
    usageCount: 2,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video meetings",
    category: "Communication",
    connected: true,
    usageCount: 1,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email service",
    category: "Communication",
    connected: false,
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Accounting",
    category: "Finance",
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedIntegrations = filteredIntegrations.filter((i) => i.connected);
  const availableIntegrations = filteredIntegrations.filter((i) => !i.connected);

  return (
    <>
      <Header
        subtitle="Connect third-party services to extend agent capabilities"
        actionButton={<AddIntegrationDialog />}
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="text-foreground0 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card text-foreground placeholder:text-foreground0 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Connected Integrations */}
          {connectedIntegrations.length > 0 && (
            <div>
              <h2 className="text-muted-foreground mb-3 text-sm font-medium">Connected</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {connectedIntegrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          )}

          {/* Available Integrations */}
          {availableIntegrations.length > 0 && (
            <div>
              <h2 className="text-muted-foreground mb-3 text-sm font-medium">Available</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableIntegrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No integrations found</p>
              <button
                className="mt-4 text-sm text-amber-500 hover:text-amber-400"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <Link
      href={`/integrations/${integration.id}`}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        integration.connected
          ? "bg-card hover:bg-accent/50 border hover:border"
          : "bg-card hover:bg-accent/50 border hover:border"
      }`}
    >
      <div className="bg-accent flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <IntegrationIcon
          integrationId={integration.id}
          alt={integration.name}
          width={24}
          height={24}
          className="rounded"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate text-sm font-medium">{integration.name}</span>
          {integration.connected && <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />}
        </div>
        <p className="text-foreground0 truncate text-xs">{integration.description}</p>
      </div>
      {integration.connected ? (
        <Badge
          variant="outline"
          className="bg-accent/50 text-muted-foreground shrink-0 border text-xs"
        >
          {integration.usageCount} agent{integration.usageCount !== 1 ? "s" : ""}
        </Badge>
      ) : (
        <span className="shrink-0 text-xs text-amber-500">Connect</span>
      )}
    </Link>
  );
}
