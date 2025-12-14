"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BillingTab } from "@/components/organization/billing-tab";
import { GeneralTab } from "@/components/organization/general-tab";
import { SecurityTab } from "@/components/organization/security-tab";
import { Button } from "@/components/ui/button";
import { Settings, Shield, CreditCard } from "@/lib/icons";

type TabType = "general" | "security" | "billing";

const tabs = [
  { id: "general" as const, label: "General", icon: Settings },
  { id: "security" as const, label: "Security", icon: Shield },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Determine action button based on active tab
  const getActionButton = () => {
    switch (activeTab) {
      case "general":
        return (
          <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
            Save Changes
          </Button>
        );
      case "security":
        return null;
      case "billing":
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Header subtitle="Manage your organization settings and preferences" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Tab Navigation - Team page style */}
          <div className="flex items-center justify-between">
            <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
            {getActionButton()}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "general" && <GeneralTab />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "billing" && <BillingTab />}
          </div>
        </div>
      </main>
    </>
  );
}
