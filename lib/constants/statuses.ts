import type { AgentStatus, ExecutionStatus } from "@/lib/types";

interface StatusConfig {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const AGENT_STATUS_CONFIG: Record<AgentStatus, StatusConfig> = {
  active: {
    label: "Active",
    color: "#22c55e",
    bgClass: "bg-green-500/10",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-500/20",
  },
  paused: {
    label: "Paused",
    color: "#6b7280",
    bgClass: "bg-gray-500/10",
    textClass: "text-gray-600 dark:text-gray-400",
    borderClass: "border-gray-500/20",
  },
  deprecated: {
    label: "Deprecated",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-500/20",
  },
};

export const EXECUTION_STATUS_CONFIG: Record<ExecutionStatus, StatusConfig> = {
  completed: {
    label: "Completed",
    color: "#22c55e",
    bgClass: "bg-green-500/10",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-500/20",
  },
  failed: {
    label: "Failed",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-500/20",
  },
  running: {
    label: "Running",
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/20",
  },
  waiting_approval: {
    label: "Awaiting Approval",
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500/20",
  },
};
