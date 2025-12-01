"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { GeneralTab } from "@/components/organization/general-tab";
import { SecurityTab } from "@/components/organization/security-tab";
import { BillingTab } from "@/components/organization/billing-tab";
import { Settings, Shield, CreditCard } from "lucide-react";

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
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
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
      <Header actionButton={null} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Organization</h1>
            <p className="mt-1 text-sm text-stone-400">Manage your organization settings and preferences</p>
          </div>

          {/* Tab Navigation - Team page style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-stone-800 text-stone-100"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
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
