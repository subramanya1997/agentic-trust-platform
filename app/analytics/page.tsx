"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAnalyticsData } from "@/lib/data/analytics-data";
import {
  DollarSign,
  Download,
  Calendar,
  Activity,
  Zap,
  BarChart3,
} from "@/lib/icons";
import {
  CostsTab,
  PerformanceTab,
  UsageTab,
  IntegrationsTab,
} from "@/components/analytics";

type TabType = "costs" | "performance" | "usage" | "integrations";
export type DateRange = "7d" | "14d" | "30d";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("costs");
  const [dateRange, setDateRange] = useState<DateRange>("7d");

  const costData = getAnalyticsData(dateRange);
  const totalCost = costData.reduce((sum, item) => sum + item.cost, 0);
  const totalExecutions = costData.reduce((sum, item) => sum + item.executions, 0);

  const tabs = [
    { id: "costs" as const, label: "Costs", icon: DollarSign },
    { id: "performance" as const, label: "Performance", icon: Activity },
    { id: "usage" as const, label: "Usage", icon: BarChart3 },
    { id: "integrations" as const, label: "Integrations", icon: Zap },
  ];

  return (
    <>
      <Header
        subtitle="Track performance, costs, and usage across your AI infrastructure"
        actionButton={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[140px] border bg-card text-muted-foreground h-8">
                <Calendar className="mr-2 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border bg-card">
                <SelectItem value="7d" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                  Last 7 days
                </SelectItem>
                <SelectItem value="14d" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                  Last 14 days
                </SelectItem>
                <SelectItem value="30d" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                  Last 30 days
                </SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium h-8">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="space-y-6 min-w-0">

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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

          {/* Tab Content */}
          {activeTab === "costs" && (
            <CostsTab
              costData={costData}
              totalCost={totalCost}
              totalExecutions={totalExecutions}
              dateRange={dateRange}
            />
          )}
          {activeTab === "performance" && <PerformanceTab dateRange={dateRange} />}
          {activeTab === "usage" && <UsageTab dateRange={dateRange} />}
          {activeTab === "integrations" && <IntegrationsTab dateRange={dateRange} />}
        </div>
      </main>
    </>
  );
}
