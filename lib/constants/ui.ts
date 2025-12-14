/** Default number of items per page for paginated lists */
export const ITEMS_PER_PAGE = 10;

/** Default date range preset */
export const DEFAULT_DATE_RANGE = "7d" as const;

/** Available date range presets */
export const DATE_RANGE_PRESETS = ["7d", "14d", "30d", "90d"] as const;

/** Chart color palette */
export const CHART_COLORS = {
  primary: "#f59e0b",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  info: "#3b82f6",
  muted: "#6b7280",
} as const;

/** Animation durations in milliseconds */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/** Sparkline default configuration */
export const SPARKLINE_DEFAULTS = {
  color: "#f59e0b",
  height: 40,
  strokeWidth: 1.5,
} as const;
