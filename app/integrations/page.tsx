"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { AddIntegrationDialog } from "@/components/integrations/add-integration-dialog";
import { getIntegrationIcon } from "@/lib/integration-icons";
import { Search, Check } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  usageCount?: number;
}

const integrations: Integration[] = [
  { id: "salesforce", name: "Salesforce", description: "CRM platform", category: "CRM", connected: true, usageCount: 3 },
  { id: "slack", name: "Slack", description: "Team communication", category: "Communication", connected: true, usageCount: 5 },
  { id: "clearbit", name: "Clearbit", description: "Data enrichment", category: "Data", connected: true, usageCount: 2 },
  { id: "github", name: "GitHub", description: "Code repository", category: "DevOps", connected: true, usageCount: 2 },
  { id: "zendesk", name: "Zendesk", description: "Customer support", category: "Support", connected: true, usageCount: 1 },
  { id: "notion", name: "Notion", description: "Docs and wikis", category: "Productivity", connected: true, usageCount: 4 },
  { id: "linear", name: "Linear", description: "Issue tracking", category: "DevOps", connected: true, usageCount: 2 },
  { id: "zoom", name: "Zoom", description: "Video meetings", category: "Communication", connected: true, usageCount: 1 },
  { id: "gmail", name: "Gmail", description: "Email service", category: "Communication", connected: false },
  { id: "quickbooks", name: "QuickBooks", description: "Accounting", category: "Finance", connected: false },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredIntegrations = integrations.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedIntegrations = filteredIntegrations.filter((i) => i.connected);
  const availableIntegrations = filteredIntegrations.filter((i) => !i.connected);

  return (
    <>
      <Header 
        actionButton={<AddIntegrationDialog />}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Integrations</h1>
            <p className="mt-1 text-sm text-stone-400">
              {connectedIntegrations.length} connected, {availableIntegrations.length} available
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-900 py-2 pl-10 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Connected Integrations */}
          {connectedIntegrations.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-400 mb-3">Connected</h2>
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
              <h2 className="text-sm font-medium text-stone-400 mb-3">Available</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableIntegrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-400">No integrations found</p>
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
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        integration.connected 
          ? 'bg-stone-900/50 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50' 
          : 'bg-stone-900/30 border-stone-800/50 hover:border-stone-700 hover:bg-stone-800/30'
      }`}
    >
      <div className="h-9 w-9 rounded-lg bg-stone-800 flex items-center justify-center overflow-hidden shrink-0">
        <Image 
          src={getIntegrationIcon(integration.id)} 
          alt={integration.name} 
          width={24} 
          height={24}
          className="rounded"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-100 truncate">{integration.name}</span>
          {integration.connected && (
            <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-stone-500 truncate">{integration.description}</p>
      </div>
      {integration.connected ? (
        <Badge variant="outline" className="text-xs bg-stone-800/50 text-stone-400 border-stone-700 shrink-0">
          {integration.usageCount} agent{integration.usageCount !== 1 ? 's' : ''}
        </Badge>
      ) : (
        <span className="text-xs text-amber-500 shrink-0">
          Connect
        </span>
      )}
    </Link>
  );
}
