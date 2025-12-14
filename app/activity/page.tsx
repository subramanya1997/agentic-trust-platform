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
  Timer,
} from "@/lib/icons";
import { ExecutionsTab, AuditLogTab, TriggersTab } from "@/components/activity";
import { mockExecutionTraces, mockActivityEvents } from "@/lib/data/activity-data";
import { mockTriggers } from "@/lib/data/triggers-data";

type TabType = "executions" | "triggers" | "audit";
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
  
  // Triggers-specific filters
  const [triggerTypeFilter, setTriggerTypeFilter] = useState<string>("all");
  const [triggerStatusFilter, setTriggerStatusFilter] = useState<string>("all");
  
  // Audit-specific filters
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const uniqueAgents = Array.from(
    new Set(mockExecutionTraces.map((t) => t.agentName))
  ).sort();

  const tabs = [
    { id: "executions" as const, label: "Executions", icon: Activity },
    { id: "triggers" as const, label: "Triggers", icon: Timer },
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
        subtitle="Monitor agent executions, traces, and audit logs"
        actionButton={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border">
              <button
                onClick={() => setDateRange("7d")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === "7d"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-muted-foreground"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setDateRange("14d")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === "14d"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-muted-foreground"
                }`}
              >
                14D
              </button>
              <button
                onClick={() => setDateRange("30d")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === "30d"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-muted-foreground"
                }`}
              >
                30D
              </button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border text-muted-foreground hover:bg-accent h-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="space-y-6 min-w-0">

          {/* Tab Navigation + Filters Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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

            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Search */}
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground0" />
                <Input
                  placeholder={
                    activeTab === "executions" 
                      ? "Search executions..." 
                      : activeTab === "triggers"
                      ? "Search triggers..."
                      : "Search events..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border text-foreground placeholder:text-foreground0"
                />
              </div>

              {/* Executions-specific filters */}
              {activeTab === "executions" && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] border bg-card text-muted-foreground">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
                      <SelectItem value="all" className="text-muted-foreground focus:bg-accent">
                        All Status
                      </SelectItem>
                      <SelectItem value="completed" className="text-muted-foreground focus:bg-accent">
                        Completed
                      </SelectItem>
                      <SelectItem value="failed" className="text-muted-foreground focus:bg-accent">
                        Failed
                      </SelectItem>
                      <SelectItem value="running" className="text-muted-foreground focus:bg-accent">
                        Running
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-[180px] border bg-card text-muted-foreground">
                      <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
                      <SelectItem value="all" className="text-muted-foreground focus:bg-accent">
                        All Agents
                      </SelectItem>
                      {uniqueAgents.map((agent) => (
                        <SelectItem
                          key={agent}
                          value={agent}
                          className="text-muted-foreground focus:bg-accent"
                        >
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* Triggers-specific filters */}
              {activeTab === "triggers" && (
                <>
                  <Select value={triggerTypeFilter} onValueChange={setTriggerTypeFilter}>
                    <SelectTrigger className="w-[130px] border bg-card text-muted-foreground">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
                      <SelectItem value="all" className="text-muted-foreground focus:bg-accent">
                        All Types
                      </SelectItem>
                      <SelectItem value="webhook" className="text-muted-foreground focus:bg-accent">
                        Webhook
                      </SelectItem>
                      <SelectItem value="scheduled" className="text-muted-foreground focus:bg-accent">
                        Scheduled
                      </SelectItem>
                      <SelectItem value="api" className="text-muted-foreground focus:bg-accent">
                        API
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={triggerStatusFilter} onValueChange={setTriggerStatusFilter}>
                    <SelectTrigger className="w-[130px] border bg-card text-muted-foreground">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
                      <SelectItem value="all" className="text-muted-foreground focus:bg-accent">
                        All Status
                      </SelectItem>
                      <SelectItem value="active" className="text-muted-foreground focus:bg-accent">
                        Active
                      </SelectItem>
                      <SelectItem value="inactive" className="text-muted-foreground focus:bg-accent">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* Audit-specific filters */}
              {activeTab === "audit" && (
                <>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px] border bg-card text-muted-foreground">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent className="border bg-card max-h-[300px]">
                      {eventTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-muted-foreground focus:bg-accent"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border text-muted-foreground hover:bg-accent"
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
          {activeTab === "triggers" && (
            <TriggersTab 
              searchQuery={searchQuery}
              typeFilter={triggerTypeFilter}
              statusFilter={triggerStatusFilter}
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

