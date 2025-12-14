"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockActivityEvents, filterActivityEvents } from "@/lib/data/activity-data";
import type { ActivityEventType } from "@/lib/types";

interface AuditLogTabProps {
  dateRange: "7d" | "14d" | "30d";
  searchQuery: string;
  typeFilter: string;
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().replace("T", " ").replace("Z", "");
}

function getEventLevel(type: ActivityEventType): string {
  if (type === "execution_failed" || type === "error_occurred") {
    return "ERROR";
  }
  if (type === "approval_denied") {
    return "WARN";
  }
  return "INFO";
}

function getLevelColor(level: string): string {
  if (level === "ERROR") {
    return "text-red-500";
  }
  if (level === "WARN") {
    return "text-amber-500";
  }
  return "text-blue-500";
}

function formatDetails(type: ActivityEventType, details: Record<string, unknown>): string {
  const parts: string[] = [];

  Object.entries(details).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        parts.push(`${key}="${value}"`);
      } else if (typeof value === "number") {
        parts.push(`${key}=${value}`);
      } else if (typeof value === "boolean") {
        parts.push(`${key}=${value}`);
      } else {
        parts.push(`${key}=${JSON.stringify(value)}`);
      }
    }
  });

  return parts.join(" ");
}

export function AuditLogTab({ dateRange, searchQuery, typeFilter }: AuditLogTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const itemsPerPage = 50;

  // Apply filters
  const filteredEvents = filterActivityEvents(mockActivityEvents, {
    type: typeFilter !== "all" ? (typeFilter as ActivityEventType) : undefined,
    dateRange,
    search: searchQuery || undefined,
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Log viewer */}
      <div className="bg-background overflow-hidden rounded border font-mono text-[11px]">
        {/* Header */}
        <div className="bg-card border-border text-foreground0 flex justify-between border-b px-2 py-1.5">
          <span>
            audit_log entries={filteredEvents.length} range={dateRange} filter={typeFilter}
          </span>
          <span>{paginatedEvents.length} shown</span>
        </div>

        {/* Log entries */}
        <div className="max-h-[600px] overflow-y-auto">
          {paginatedEvents.map((event) => {
            const level = getEventLevel(event.type);
            const levelColor = getLevelColor(level);
            const isExpanded = expandedEvents.has(event.id);

            return (
              <div key={event.id} className="border/50 border-b last:border-b-0">
                {/* Main log line */}
                <div
                  className="hover:bg-accent/50 flex cursor-pointer gap-2 px-2 py-1 leading-relaxed"
                  onClick={() => toggleEvent(event.id)}
                >
                  <span className="shrink-0 text-stone-600" suppressHydrationWarning>
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className={`shrink-0 ${levelColor}`}>[{level}]</span>
                  <span className="text-foreground0 shrink-0">[{event.type}]</span>
                  {event.agentName && (
                    <span className="text-cyan-600">agent=&quot;{event.agentName}&quot;</span>
                  )}
                  {event.executionId && (
                    <span className="text-muted-foreground">execution_id={event.executionId}</span>
                  )}
                  <span className="text-muted-foreground">user=&quot;{event.userName}&quot;</span>
                  {event.metadata?.region && (
                    <span className="text-foreground0">region={event.metadata.region}</span>
                  )}
                  {event.metadata?.ip && (
                    <span className="text-stone-600">ip={event.metadata.ip}</span>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="bg-background mb-1 ml-2 border border-l-2">
                    <div className="px-3 py-1">
                      <span className="text-foreground0">DETAILS: </span>
                      <span className="text-muted-foreground">
                        {formatDetails(event.type, event.details)}
                      </span>
                    </div>
                    <div className="px-3 py-1">
                      <span className="text-foreground0">RAW: </span>
                      <pre className="text-muted-foreground mt-1 text-[10px] whitespace-pre-wrap">
                        {JSON.stringify(
                          {
                            id: event.id,
                            type: event.type,
                            timestamp: event.timestamp,
                            agentId: event.agentId,
                            agentName: event.agentName,
                            executionId: event.executionId,
                            userId: event.userId,
                            userName: event.userName,
                            details: event.details,
                            metadata: event.metadata,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {filteredEvents.length === 0 && (
            <div className="text-foreground0 px-2 py-4 text-center">
              No audit log entries found for the selected filters.
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        {totalPages > 1 && (
          <div className="bg-card text-foreground0 flex items-center justify-between px-2 py-1.5">
            <span>
              showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEvents.length)}{" "}
              of {filteredEvents.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-6 px-2 text-[11px] disabled:opacity-50"
              >
                prev
              </Button>
              <span className="text-muted-foreground">
                page {currentPage}/{totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-6 px-2 text-[11px] disabled:opacity-50"
              >
                next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
