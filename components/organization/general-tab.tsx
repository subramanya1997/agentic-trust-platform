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
import { Mail } from "@/lib/icons";

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
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-base">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
              <tbody className="bg-card divide-y divide-border">
                <tr className="bg-card">
                  <td className="px-4 py-3 w-2/5">
                    <span className="text-sm font-medium text-muted-foreground">Organization Name</span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue="Acme Corp"
                      className="w-full rounded-lg border border bg-accent px-3 py-2 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="px-4 py-3 w-2/5">
                    <span className="text-sm font-medium text-muted-foreground">Organization Slug</span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue="acme-corp"
                      className="w-full rounded-lg border border bg-accent px-3 py-2 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="px-4 py-3 w-2/5">
                    <span className="text-sm font-medium text-muted-foreground">Timezone</span>
                  </td>
                  <td className="px-4 py-3">
                    <Select defaultValue="pst">
                      <SelectTrigger className="w-full border bg-accent text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border bg-card">
                        <SelectItem value="pst" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem value="est" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="gmt" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="jst" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="px-4 py-3 w-2/5">
                    <span className="text-sm font-medium text-muted-foreground">Default LLM Model</span>
                  </td>
                  <td className="px-4 py-3">
                    <Select defaultValue="claude-sonnet">
                      <SelectTrigger className="w-full border bg-accent text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border bg-card">
                        <SelectItem value="claude-sonnet" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          Claude Sonnet 4.5
                        </SelectItem>
                        <SelectItem value="claude-opus" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          Claude Opus 4.5
                        </SelectItem>
                        <SelectItem value="gpt-5.1" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          GPT-5.1
                        </SelectItem>
                        <SelectItem value="gpt-5.1-mini" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          GPT-5.1 Mini
                        </SelectItem>
                        <SelectItem value="gemini-3-pro" className="text-muted-foreground focus:bg-accent focus:text-foreground">
                          Gemini 3 Pro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="px-4 py-3 w-2/5">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Require approval</span>
                      <p className="text-xs text-foreground0 mt-0.5">New agents must be approved</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
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
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-base">Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
              <tbody className="bg-card divide-y divide-border">
                {emailNotifications.map((item, index) => (
                  <tr key={index} className="bg-card">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                        <p className="text-xs text-foreground0 mt-0.5">{item.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.enabled ? "bg-amber-600" : "bg-muted"
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

        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-base">Slack Notifications</CardTitle>
            <CardDescription className="text-muted-foreground">Connect Slack to receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              Connect Slack
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
