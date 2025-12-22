"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChevronRight, RefreshCw } from "@/lib/icons";
import { api } from "@/lib/api";
import { useOrganization } from "@/lib/context";

interface AuditEvent {
  id: string;
  action: string;
  user_email: string;
  occurred_at: string;
  target_type: string | null;
  target_name: string | null;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
}

function formatActionName(action: string): string {
  // Convert action string to readable format
  // e.g., "user.login" -> "User Login", "member.invited" -> "Member Invited"
  return action
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SecurityTab() {
  const { currentOrg, loading: orgLoading } = useOrganization();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    if (!currentOrg || orgLoading) return;

    setLoading(true);
    setError(null);
    try {
      const events = await api.audit.listEvents({ limit: 10 });
      setAuditLogs(events);
    } catch (err: any) {
      console.error("Failed to fetch audit logs:", err);
      setError(err.detail || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!currentOrg || syncing) return;

    setSyncing(true);
    try {
      await api.audit.syncEvents(100);
      // Refresh the list after sync
      await fetchAuditLogs();
    } catch (err: any) {
      console.error("Failed to sync audit logs:", err);
      // Silently fail for non-admins
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentOrg, orgLoading]);

  if (loading && !auditLogs.length) {
    return <SecurityTabSkeleton />;
  }
  return (
    <div className="max-w-3xl space-y-6">
      <Card className="bg-card border">
        <CardContent className="p-0">
          <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
            <tbody className="bg-card divide-border divide-y">
              <tr className="bg-card">
                <td className="w-1/2 px-4 py-3">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-foreground0 mt-0.5 text-xs">
                      Require 2FA for all team members
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600 transition-colors">
                    <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                  </button>
                </td>
              </tr>
              <tr className="bg-card">
                <td className="w-1/2 px-4 py-3">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Session timeout</p>
                    <p className="text-foreground0 mt-0.5 text-xs">
                      Automatically log out after inactivity
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Select defaultValue="1h">
                    <SelectTrigger className="bg-accent text-foreground w-[130px] border" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border">
                      <SelectItem
                        value="30m"
                        className="text-muted-foreground focus:bg-accent focus:text-foreground"
                      >
                        30 minutes
                      </SelectItem>
                      <SelectItem
                        value="1h"
                        className="text-muted-foreground focus:bg-accent focus:text-foreground"
                      >
                        1 hour
                      </SelectItem>
                      <SelectItem
                        value="4h"
                        className="text-muted-foreground focus:bg-accent focus:text-foreground"
                      >
                        4 hours
                      </SelectItem>
                      <SelectItem
                        value="24h"
                        className="text-muted-foreground focus:bg-accent focus:text-foreground"
                      >
                        24 hours
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr className="bg-card">
                <td className="w-1/2 px-4 py-3">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Active sessions</p>
                    <p className="text-foreground0 mt-0.5 text-xs">
                      Sign out from all other sessions
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-800 text-red-400 hover:bg-red-950"
                  >
                    Sign Out All
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-base">Audit Log</CardTitle>
              <CardDescription className="text-muted-foreground">
                View your recent security events
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="text-muted-foreground hover:text-foreground"
              title="Sync events from WorkOS"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="px-4 py-3 text-sm text-red-400 bg-red-950/20 border-b border-red-800">
              {error}
            </div>
          )}
          {auditLogs.length === 0 && !error ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No audit events found. Click the sync button to fetch events from WorkOS.
            </div>
          ) : (
            <>
              <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
                <tbody className="bg-card divide-border divide-y">
                  {auditLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="bg-card">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-foreground text-sm">
                            {formatActionName(log.action)}
                            {log.target_name && (
                              <span className="text-muted-foreground"> - {log.target_name}</span>
                            )}
                          </p>
                          <p className="text-foreground0 text-xs">{log.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-foreground0 flex items-center justify-end gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(log.occurred_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length > 5 && (
                <div className="px-6 py-4">
                  <Button
                    variant="outline"
                    className="text-muted-foreground w-full border"
                    onClick={() => window.location.href = "/activity"}
                  >
                    View Full Audit Log
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SecurityTabSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Card className="bg-card border">
        <CardContent className="p-0">
          <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
            <tbody className="bg-card divide-border divide-y">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="bg-card">
                  <td className="w-1/2 px-4 py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-6 w-11 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="p-0">
          <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
            <tbody className="bg-card divide-border divide-y">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="bg-card">
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
