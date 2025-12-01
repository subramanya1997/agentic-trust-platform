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
import { Mail } from "lucide-react";

const emailNotifications = [
  { label: "Agent failures", description: "Get notified when an agent execution fails", enabled: true },
  { label: "Cost alerts", description: "Get notified when spending exceeds thresholds", enabled: true },
  { label: "Weekly summary", description: "Receive a weekly summary of agent activity", enabled: false },
  { label: "New team member joins", description: "Get notified when someone joins the team", enabled: false },
];

export function GeneralTab() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - General Settings */}
      <div className="space-y-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-stone-100 text-base">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full">
              <tbody className="divide-y divide-stone-800">
                <tr>
                  <td className="px-6 py-4 w-2/5">
                    <span className="text-sm font-medium text-stone-300">Organization Name</span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      defaultValue="Acme Corp"
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 w-2/5">
                    <span className="text-sm font-medium text-stone-300">Organization Slug</span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      defaultValue="acme-corp"
                      className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 w-2/5">
                    <span className="text-sm font-medium text-stone-300">Timezone</span>
                  </td>
                  <td className="px-6 py-4">
                    <Select defaultValue="pst">
                      <SelectTrigger className="w-full border-stone-700 bg-stone-800 text-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-stone-700 bg-stone-900">
                        <SelectItem value="pst" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem value="est" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="gmt" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="jst" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 w-2/5">
                    <span className="text-sm font-medium text-stone-300">Default LLM Model</span>
                  </td>
                  <td className="px-6 py-4">
                    <Select defaultValue="claude-sonnet">
                      <SelectTrigger className="w-full border-stone-700 bg-stone-800 text-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-stone-700 bg-stone-900">
                        <SelectItem value="claude-sonnet" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          Claude Sonnet 4.5
                        </SelectItem>
                        <SelectItem value="claude-opus" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          Claude Opus 4.5
                        </SelectItem>
                        <SelectItem value="gpt-5.1" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          GPT-5.1
                        </SelectItem>
                        <SelectItem value="gpt-5.1-mini" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          GPT-5.1 Mini
                        </SelectItem>
                        <SelectItem value="gemini-3-pro" className="text-stone-300 focus:bg-stone-800 focus:text-stone-100">
                          Gemini 3 Pro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 w-2/5">
                    <div>
                      <span className="text-sm font-medium text-stone-300">Require approval</span>
                      <p className="text-xs text-stone-500 mt-0.5">New agents must be approved</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Notifications */}
      <div className="space-y-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-stone-100 text-base">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full">
              <tbody className="divide-y divide-stone-800">
                {emailNotifications.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-stone-300">{item.label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.enabled ? "bg-amber-600" : "bg-stone-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-stone-100 text-base">Slack Notifications</CardTitle>
            <CardDescription className="text-stone-400">Connect Slack to receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-stone-700 text-stone-300">
              <Mail className="h-4 w-4 mr-2" />
              Connect Slack
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
