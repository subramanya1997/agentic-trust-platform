"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          <CardTitle className="text-foreground text-base">Audit Log</CardTitle>
          <CardDescription className="text-muted-foreground">
            View recent security events
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
            <tbody className="bg-card divide-border divide-y">
              {auditLogs.map((log, index) => (
                <tr key={index} className="bg-card">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground text-sm">{log.event}</p>
                      <p className="text-foreground0 text-xs">{log.user}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-foreground0 flex items-center justify-end gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {log.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4">
            <Button variant="outline" className="text-muted-foreground w-full border">
              View Full Audit Log
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
