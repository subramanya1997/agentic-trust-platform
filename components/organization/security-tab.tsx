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
import { Clock, ChevronRight } from "lucide-react";

const auditLogs = [
  { event: "Login from new device", user: "sara@company.com", time: "2 hours ago" },
  { event: "API key created", user: "taylor@company.com", time: "1 day ago" },
  { event: "Team member invited", user: "sara@company.com", time: "3 days ago" },
];

export function SecurityTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="p-0">
          <table className="min-w-full">
            <tbody className="divide-y divide-stone-800">
              <tr>
                <td className="px-6 py-4 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-stone-300">Two-Factor Authentication</p>
                    <p className="text-xs text-stone-500 mt-0.5">Require 2FA for all team members</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-stone-300">Session timeout</p>
                    <p className="text-xs text-stone-500 mt-0.5">Automatically log out after inactivity</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Select defaultValue="1h">
                    <SelectTrigger className="w-[130px] border-stone-700 bg-stone-800 text-stone-200" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-stone-700 bg-stone-900">
                      <SelectItem value="30m" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                        30 minutes
                      </SelectItem>
                      <SelectItem value="1h" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                        1 hour
                      </SelectItem>
                      <SelectItem value="4h" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                        4 hours
                      </SelectItem>
                      <SelectItem value="24h" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                        24 hours
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 w-1/2">
                  <div>
                    <p className="text-sm font-medium text-stone-300">Active sessions</p>
                    <p className="text-xs text-stone-500 mt-0.5">Sign out from all other sessions</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" className="border-red-800 text-red-400 hover:bg-red-950">
                    Sign Out All
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-stone-900 border-stone-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-stone-100 text-base">Audit Log</CardTitle>
          <CardDescription className="text-stone-400">View recent security events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full">
            <tbody className="divide-y divide-stone-800">
              {auditLogs.map((log, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-stone-200">{log.event}</p>
                      <p className="text-xs text-stone-500">{log.user}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-stone-500 flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {log.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-stone-800">
            <Button variant="outline" className="w-full border-stone-700 text-stone-300">
              View Full Audit Log
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

