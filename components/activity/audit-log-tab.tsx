"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  mockActivityEvents,
  filterActivityEvents,
} from "@/lib/data/activity-data";
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
  if (type === "execution_failed" || type === "error_occurred") return "ERROR";
  if (type === "approval_denied") return "WARN";
  return "INFO";
}

function getLevelColor(level: string): string {
  if (level === "ERROR") return "text-red-500";
  if (level === "WARN") return "text-amber-500";
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
    setExpandedEvents(prev => {
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
      <div className="bg-background rounded border border overflow-hidden font-mono text-[11px]">
        {/* Header */}
        <div className="px-2 py-1.5 bg-card border-b border-border text-foreground0 flex justify-between">
          <span>audit_log entries={filteredEvents.length} range={dateRange} filter={typeFilter}</span>
          <span>{paginatedEvents.length} shown</span>
        </div>
        
        {/* Log entries */}
        <div className="max-h-[600px] overflow-y-auto">
          {paginatedEvents.map((event) => {
            const level = getEventLevel(event.type);
            const levelColor = getLevelColor(level);
            const isExpanded = expandedEvents.has(event.id);
            
            return (
              <div key={event.id} className="border-b border/50 last:border-b-0">
                {/* Main log line */}
                <div 
                  className="flex gap-2 py-1 px-2 hover:bg-accent/50 cursor-pointer leading-relaxed"
                  onClick={() => toggleEvent(event.id)}
                >
                  <span className="text-stone-600 shrink-0" suppressHydrationWarning>
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
                  <div className="bg-background border-l-2 border ml-2 mb-1">
                    <div className="px-3 py-1">
                      <span className="text-foreground0">DETAILS: </span>
                      <span className="text-muted-foreground">{formatDetails(event.type, event.details)}</span>
                    </div>
                    <div className="px-3 py-1">
                      <span className="text-foreground0">RAW: </span>
                      <pre className="text-muted-foreground whitespace-pre-wrap mt-1 text-[10px]">
{JSON.stringify({
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
}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Empty state */}
          {filteredEvents.length === 0 && (
            <div className="px-2 py-4 text-foreground0 text-center">
              No audit log entries found for the selected filters.
            </div>
          )}
        </div>
        
        {/* Footer with pagination */}
        {totalPages > 1 && (
          <div className="px-2 py-1.5 bg-card text-foreground0 flex justify-between items-center">
            <span>
              showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50"
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
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50"
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
