"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Activity,
  ScrollText,
  RefreshCw,
  Search,
  Download,
} from "lucide-react";
import { ExecutionsTab, AuditLogTab } from "@/components/activity";
import { mockExecutionTraces } from "@/lib/data/activity-data";

type TabType = "executions" | "audit";
type DateRange = "7d" | "14d" | "30d";

const eventTypeOptions = [
  { value: "all", label: "All Events" },
  { value: "execution_started", label: "Execution Started" },
  { value: "execution_completed", label: "Execution Completed" },
  { value: "execution_failed", label: "Execution Failed" },
  { value: "tool_called", label: "Tool Called" },
  { value: "approval_requested", label: "Approval Requested" },
  { value: "approval_granted", label: "Approval Granted" },
  { value: "approval_denied", label: "Approval Denied" },
  { value: "error_occurred", label: "Error Occurred" },
  { value: "agent_created", label: "Agent Created" },
  { value: "agent_updated", label: "Agent Updated" },
  { value: "integration_connected", label: "Integration Connected" },
  { value: "integration_disconnected", label: "Integration Disconnected" },
];

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<TabType>("executions");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Shared filter state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Executions-specific filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  
  // Audit-specific filters
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const uniqueAgents = Array.from(
    new Set(mockExecutionTraces.map((t) => t.agentName))
  ).sort();

  const tabs = [
    { id: "executions" as const, label: "Executions", icon: Activity },
    { id: "audit" as const, label: "Audit Log", icon: ScrollText },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSearchQuery("");
  };

  return (
    <>
      <Header
        actionButton={
          <Button
            size="sm"
            variant="outline"
            className="border-stone-700 text-stone-300 hover:bg-stone-800"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-50">Activity</h1>
              <p className="mt-1 text-sm text-stone-400">
                Monitor agent executions, traces, and audit logs
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

          {/* Tab Navigation + Filters Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Search */}
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <Input
                  placeholder={activeTab === "executions" ? "Search executions..." : "Search events..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-stone-900 border-stone-700 text-stone-200 placeholder:text-stone-500"
                />
              </div>

              {/* Executions-specific filters */}
              {activeTab === "executions" && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] border-stone-700 bg-stone-900 text-stone-300">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border-stone-700 bg-stone-900">
                      <SelectItem value="all" className="text-stone-300 focus:bg-stone-800">
                        All Status
                      </SelectItem>
                      <SelectItem value="completed" className="text-stone-300 focus:bg-stone-800">
                        Completed
                      </SelectItem>
                      <SelectItem value="failed" className="text-stone-300 focus:bg-stone-800">
                        Failed
                      </SelectItem>
                      <SelectItem value="running" className="text-stone-300 focus:bg-stone-800">
                        Running
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-[180px] border-stone-700 bg-stone-900 text-stone-300">
                      <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent className="border-stone-700 bg-stone-900">
                      <SelectItem value="all" className="text-stone-300 focus:bg-stone-800">
                        All Agents
                      </SelectItem>
                      {uniqueAgents.map((agent) => (
                        <SelectItem
                          key={agent}
                          value={agent}
                          className="text-stone-300 focus:bg-stone-800"
                        >
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* Audit-specific filters */}
              {activeTab === "audit" && (
                <>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px] border-stone-700 bg-stone-900 text-stone-300">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent className="border-stone-700 bg-stone-900 max-h-[300px]">
                      {eventTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-stone-300 focus:bg-stone-800"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-700 text-stone-300 hover:bg-stone-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "executions" && (
            <ExecutionsTab 
              dateRange={dateRange} 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              agentFilter={agentFilter}
            />
          )}
          {activeTab === "audit" && (
            <AuditLogTab 
              dateRange={dateRange}
              searchQuery={searchQuery}
              typeFilter={typeFilter}
            />
          )}
        </div>
      </main>
    </>
  );
}

