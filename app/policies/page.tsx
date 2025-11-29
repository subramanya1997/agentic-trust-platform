"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Plus, Shield, Clock, DollarSign, AlertTriangle } from "lucide-react";

interface Policy {
  id: string;
  name: string;
  type: "rate_limit" | "authentication" | "cost_limit" | "security";
  scope: "organization" | "team" | "agent";
  status: "active" | "inactive";
  description: string;
  appliesTo: string;
  createdAt: string;
}

const policies: Policy[] = [
  {
    id: "policy-1",
    name: "OpenAI Rate Limit",
    type: "rate_limit",
    scope: "organization",
    status: "active",
    description: "Limit OpenAI API calls to 100 requests per minute",
    appliesTo: "OpenAI API",
    createdAt: "2025-11-01",
  },
  {
    id: "policy-2",
    name: "Daily Cost Limit",
    type: "cost_limit",
    scope: "organization",
    status: "active",
    description: "Alert when daily costs exceed $500",
    appliesTo: "All Services",
    createdAt: "2025-11-05",
  },
  {
    id: "policy-3",
    name: "Salesforce Authentication",
    type: "authentication",
    scope: "organization",
    status: "active",
    description: "Require OAuth 2.0 for all Salesforce API calls",
    appliesTo: "Salesforce API",
    createdAt: "2025-10-28",
  },
  {
    id: "policy-4",
    name: "PII Detection",
    type: "security",
    scope: "organization",
    status: "active",
    description: "Scan and redact personally identifiable information",
    appliesTo: "All Agents",
    createdAt: "2025-10-15",
  },
  {
    id: "policy-5",
    name: "Clearbit Rate Limit",
    type: "rate_limit",
    scope: "team",
    status: "active",
    description: "Limit Clearbit API calls to 50 requests per minute for Sales team",
    appliesTo: "Clearbit API (Sales Team)",
    createdAt: "2025-11-10",
  },
  {
    id: "policy-6",
    name: "Staging Environment Limit",
    type: "cost_limit",
    scope: "team",
    status: "inactive",
    description: "Block execution if staging costs exceed $100/day",
    appliesTo: "Staging Environment",
    createdAt: "2025-10-20",
  },
];

export default function PoliciesPage() {
  const activePolicies = policies.filter((p) => p.status === "active");
  const inactivePolicies = policies.filter((p) => p.status === "inactive");

  return (
    <>
      <Header 
        actionButton={
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Gateway Policies</h1>
            <p className="mt-1 text-sm text-stone-400">
              {activePolicies.length} active, {inactivePolicies.length} inactive
            </p>
          </div>

          {/* Policy Types Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-400">Rate Limits</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">
                      {policies.filter((p) => p.type === "rate_limit" && p.status === "active").length}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-400">Cost Limits</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">
                      {policies.filter((p) => p.type === "cost_limit" && p.status === "active").length}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-400">Security</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">
                      {policies.filter((p) => p.type === "security" && p.status === "active").length}
                    </p>
                  </div>
                  <Shield className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-400">Authentication</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">
                      {policies.filter((p) => p.type === "authentication" && p.status === "active").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Active Policies ({activePolicies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePolicies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inactive Policies */}
          {inactivePolicies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Inactive Policies ({inactivePolicies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inactivePolicies.map((policy) => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  const typeIcons = {
    rate_limit: Clock,
    cost_limit: DollarSign,
    security: Shield,
    authentication: AlertTriangle,
  };

  const typeColors = {
    rate_limit: "text-blue-500 bg-blue-950",
    cost_limit: "text-orange-500 bg-orange-950",
    security: "text-green-500 bg-green-950",
    authentication: "text-purple-500 bg-purple-950",
  };

  const Icon = typeIcons[policy.type];

  return (
    <div className="flex items-start gap-4 rounded-lg border border-stone-800 p-4 hover:border-stone-700 transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[policy.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-50">{policy.name}</h3>
              <Badge variant={policy.status === "active" ? "default" : "destructive"}>
                {policy.status}
              </Badge>
              <Badge variant="outline">{policy.scope}</Badge>
            </div>
            <p className="mt-1 text-sm text-stone-400">{policy.description}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-stone-500">
              <span>Applies to: {policy.appliesTo}</span>
              <span>Created: {new Date(policy.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            {policy.status === "active" ? (
              <Button variant="outline" size="sm">
                Disable
              </Button>
            ) : (
              <Button variant="default" size="sm">
                Enable
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
