"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/header";
import { BillingTab, BillingTabSkeleton } from "@/components/organization/billing-tab";
import { GeneralTab, GeneralTabSkeleton } from "@/components/organization/general-tab";
import { SecurityTab, SecurityTabSkeleton } from "@/components/organization/security-tab";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useOrganization } from "@/lib/context";
import { Settings, Shield, CreditCard } from "@/lib/icons";

type TabType = "general" | "security" | "billing";

const tabs = [
  { id: "general" as const, label: "General", icon: Settings },
  { id: "security" as const, label: "Security", icon: Shield },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const { currentOrg, loading: orgLoading, refreshOrganizations } = useOrganization();
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for general tab
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  useEffect(() => {
    if (!currentOrg || orgLoading) return;

    const fetchOrgData = async () => {
      setLoading(true);
      try {
        const data = await api.organizations.getCurrent();
        setOrgData(data);
        setName(data.name || "");
        setLogoUrl(data.logo_url || "");
        setBillingEmail(data.billing_email || "");
      } catch (error) {
        console.error("Failed to fetch organization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [currentOrg, orgLoading]);

  const handleSave = async () => {
    if (!currentOrg) return;

    setSaving(true);
    try {
      await api.organizations.updateCurrent({
        name: name !== orgData.name ? name : undefined,
        logo_url: logoUrl !== orgData.logo_url ? logoUrl : undefined,
        billing_email: billingEmail !== orgData.billing_email ? billingEmail : undefined,
      });

      // Refresh organization data
      const updated = await api.organizations.getCurrent();
      setOrgData(updated);
      
      // Refresh the organization list in context
      await refreshOrganizations();
    } catch (error) {
      console.error("Failed to save organization:", error);
    } finally {
      setSaving(false);
    }
  };

  const getActionButton = () => {
    switch (activeTab) {
      case "general":
        return (
          <Button
            size="sm"
            className="bg-amber-600 text-white hover:bg-amber-500"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
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

  if (orgLoading || loading) {
    return (
      <>
        <Header subtitle="Manage your organization settings and preferences" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="min-w-0 space-y-6">
            {/* Tab Navigation Skeleton */}
            <div className="flex items-center justify-between">
              <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5"
                  >
                    <Skeleton className="h-3.5 w-3.5" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-32" />
            </div>

            {/* Tab Content Skeleton */}
            <div>
              {activeTab === "general" && <GeneralTabSkeleton />}
              {activeTab === "security" && <SecurityTabSkeleton />}
              {activeTab === "billing" && <BillingTabSkeleton />}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle="Manage your organization settings and preferences" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Tab Navigation */}
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
            {activeTab === "general" && (
              <GeneralTab
                name={name}
                logoUrl={logoUrl}
                billingEmail={billingEmail}
                onNameChange={setName}
                onLogoUrlChange={setLogoUrl}
                onBillingEmailChange={setBillingEmail}
              />
            )}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "billing" && <BillingTab />}
          </div>
        </div>
      </main>
    </>
  );
}
