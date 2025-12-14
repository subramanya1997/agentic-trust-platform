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
import { Mail } from "@/lib/icons";

const emailNotifications = [
  {
    label: "Agent failures",
    description: "Get notified when an agent execution fails",
    enabled: true,
  },
  {
    label: "Cost alerts",
    description: "Get notified when spending exceeds thresholds",
    enabled: true,
  },
  {
    label: "Weekly summary",
    description: "Receive a weekly summary of agent activity",
    enabled: false,
  },
  {
    label: "New team member joins",
    description: "Get notified when someone joins the team",
    enabled: false,
  },
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
            <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
              <tbody className="bg-card divide-border divide-y">
                <tr className="bg-card">
                  <td className="w-2/5 px-4 py-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Organization Name
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue="Acme Corp"
                      className="bg-accent text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="w-2/5 px-4 py-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Organization Slug
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      defaultValue="acme-corp"
                      className="bg-accent text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="w-2/5 px-4 py-3">
                    <span className="text-muted-foreground text-sm font-medium">Timezone</span>
                  </td>
                  <td className="px-4 py-3">
                    <Select defaultValue="pst">
                      <SelectTrigger className="bg-accent text-foreground w-full border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border">
                        <SelectItem
                          value="pst"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem
                          value="est"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem
                          value="gmt"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem
                          value="jst"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="w-2/5 px-4 py-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Default LLM Model
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Select defaultValue="claude-sonnet">
                      <SelectTrigger className="bg-accent text-foreground w-full border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border">
                        <SelectItem
                          value="claude-sonnet"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          Claude Sonnet 4.5
                        </SelectItem>
                        <SelectItem
                          value="claude-opus"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          Claude Opus 4.5
                        </SelectItem>
                        <SelectItem
                          value="gpt-5.1"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          GPT-5.1
                        </SelectItem>
                        <SelectItem
                          value="gpt-5.1-mini"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          GPT-5.1 Mini
                        </SelectItem>
                        <SelectItem
                          value="gemini-3-pro"
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          Gemini 3 Pro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
                <tr className="bg-card">
                  <td className="w-2/5 px-4 py-3">
                    <div>
                      <span className="text-muted-foreground text-sm font-medium">
                        Require approval
                      </span>
                      <p className="text-foreground0 mt-0.5 text-xs">New agents must be approved</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-600 transition-colors">
                      <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
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
            <table className="divide-border min-w-full divide-y overflow-hidden rounded-lg">
              <tbody className="bg-card divide-border divide-y">
                {emailNotifications.map((item, index) => (
                  <tr key={index} className="bg-card">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{item.label}</p>
                        <p className="text-foreground0 mt-0.5 text-xs">{item.description}</p>
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
            <CardDescription className="text-muted-foreground">
              Connect Slack to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="text-muted-foreground border">
              <Mail className="mr-2 h-4 w-4" />
              Connect Slack
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
