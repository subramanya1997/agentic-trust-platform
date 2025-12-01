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
} from "lucide-react";
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
        actionButton={
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-50">Analytics</h1>
              <p className="mt-1 text-sm text-stone-400">
                Track performance, costs, and usage across your AI infrastructure
              </p>
            </div>
            
            {/* Date Range Picker */}
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[160px] border-stone-700 bg-stone-900 text-stone-300">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-stone-700 bg-stone-900">
                <SelectItem value="7d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 7 days
                </SelectItem>
                <SelectItem value="14d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 14 days
                </SelectItem>
                <SelectItem value="30d" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                  Last 30 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg w-fit border border-stone-800">
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
