"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, ChevronRight } from "@/lib/icons";

const auditLogs = [
  { event: "Login from new device", user: "sara@company.com", time: "2 hours ago" },
  { event: "API key created", user: "taylor@company.com", time: "1 day ago" },
  { event: "Team member invited", user: "sara@company.com", time: "3 days ago" },
];

export function SecurityTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="bg-card border">
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
            <tbody className="bg-card divide-y divide-border">
              <tr className="bg-card">
                <td className="px-4 py-3 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-foreground0 mt-0.5">Require 2FA for all team members</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </td>
              </tr>
              <tr className="bg-card">
                <td className="px-4 py-3 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Session timeout</p>
                    <p className="text-xs text-foreground0 mt-0.5">Automatically log out after inactivity</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Select defaultValue="1h">
                    <SelectTrigger className="w-[130px] border bg-accent text-foreground" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
                      <SelectItem value="30m" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                        30 minutes
                      </SelectItem>
                      <SelectItem value="1h" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                        1 hour
                      </SelectItem>
                      <SelectItem value="4h" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                        4 hours
                      </SelectItem>
                      <SelectItem value="24h" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                        24 hours
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr className="bg-card">
                <td className="px-4 py-3 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active sessions</p>
                    <p className="text-xs text-foreground0 mt-0.5">Sign out from all other sessions</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="border-red-800 text-red-400 hover:bg-red-950">
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
          <CardTitle className="text-foreground text-base">Audit Log</CardTitle>
          <CardDescription className="text-muted-foreground">View recent security events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
            <tbody className="bg-card divide-y divide-border">
              {auditLogs.map((log, index) => (
                <tr key={index} className="bg-card">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-foreground">{log.event}</p>
                      <p className="text-xs text-foreground0">{log.user}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-foreground0 flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {log.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4">
            <Button variant="outline" className="w-full border text-muted-foreground">
              View Full Audit Log
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

