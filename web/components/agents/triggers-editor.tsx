"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Code, Zap, Webhook, Calendar, Clock } from "@/lib/icons";
import type { TriggersEditorProps, ScheduleTrigger } from "@/lib/types/agent-form";

export function TriggersEditor({ triggers, onTriggersChange }: TriggersEditorProps) {
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleCron, setNewScheduleCron] = useState("");
  const [newScheduleTimezone, setNewScheduleTimezone] = useState("utc");

  const updateApiEnabled = (enabled: boolean) => {
    onTriggersChange({ ...triggers, api: enabled });
  };

  const updateMcpEnabled = (enabled: boolean) => {
    onTriggersChange({ ...triggers, mcp: enabled });
  };

  const updateWebhookEnabled = (enabled: boolean) => {
    onTriggersChange({ ...triggers, webhook: enabled });
  };

  const addScheduledTrigger = () => {
    if (!newScheduleName || !newScheduleCron) {
      return;
    }

    const newTrigger: ScheduleTrigger = {
      id: `schedule-${Date.now()}`,
      name: newScheduleName,
      cron: newScheduleCron,
      timezone: newScheduleTimezone,
      enabled: true,
    };

    onTriggersChange({
      ...triggers,
      scheduled: [...triggers.scheduled, newTrigger],
    });

    setNewScheduleName("");
    setNewScheduleCron("");
    setNewScheduleTimezone("utc");
    setIsAddScheduleOpen(false);
  };

  const removeScheduledTrigger = (id: string) => {
    onTriggersChange({
      ...triggers,
      scheduled: triggers.scheduled.filter((t) => t.id !== id),
    });
  };

  const toggleScheduledTrigger = (id: string) => {
    onTriggersChange({
      ...triggers,
      scheduled: triggers.scheduled.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
    });
  };

  return (
    <div className="border-border mb-6 border-b pb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-foreground font-semibold">Triggers</h2>
        <button
          onClick={() => setIsAddScheduleOpen(true)}
          className="flex items-center gap-1 text-sm text-amber-500 transition-colors hover:text-amber-400"
        >
          <Plus className="h-4 w-4" />
          Add schedule
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Manual API Trigger */}
        <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-950">
              <Code className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">Manual API</p>
              <p className="text-foreground0 text-xs">Invoke via REST API</p>
            </div>
          </div>
          <Switch checked={triggers.api} onCheckedChange={updateApiEnabled} />
        </div>

        {/* MCP Server Trigger */}
        <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">MCP Server</p>
              <p className="text-foreground0 text-xs">Expose as MCP tool</p>
            </div>
          </div>
          <Switch checked={triggers.mcp} onCheckedChange={updateMcpEnabled} />
        </div>

        {/* Webhook Trigger */}
        <div className="bg-card/50 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950">
              <Webhook className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">Webhook</p>
              <p className="text-foreground0 text-xs">Trigger via HTTP webhook</p>
            </div>
          </div>
          <Switch checked={triggers.webhook} onCheckedChange={updateWebhookEnabled} />
        </div>

        {/* Scheduled Triggers */}
        {triggers.scheduled.map((trigger) => (
          <div
            key={trigger.id}
            className="bg-card/50 relative flex items-center justify-between rounded-lg border p-3"
          >
            {/* X button floating in top right corner */}
            <button
              onClick={() => removeScheduledTrigger(trigger.id)}
              className="bg-card border-border text-muted-foreground absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-colors hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{trigger.name}</p>
                <p className="text-foreground0 font-mono text-xs">{trigger.cron}</p>
              </div>
            </div>
            <Switch
              checked={trigger.enabled}
              onCheckedChange={() => toggleScheduledTrigger(trigger.id)}
            />
          </div>
        ))}
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent className="bg-card border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Scheduled Trigger</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure a cron-based schedule for this agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
                placeholder="e.g., Daily Report Generation"
                className="bg-accent text-foreground placeholder:text-foreground0 border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Schedule (Cron Expression)</Label>
              <Input
                value={newScheduleCron}
                onChange={(e) => setNewScheduleCron(e.target.value)}
                placeholder="0 8 * * 1"
                className="bg-accent text-foreground placeholder:text-foreground0 border font-mono"
              />
              <p className="text-foreground0 text-xs">
                Example: &quot;0 8 * * 1&quot; = Every Monday at 8 AM
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Timezone</Label>
              <Select value={newScheduleTimezone} onValueChange={setNewScheduleTimezone}>
                <SelectTrigger className="bg-accent text-foreground border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-accent border">
                  <SelectItem value="utc" className="text-foreground focus:bg-muted">
                    UTC
                  </SelectItem>
                  <SelectItem value="america_new_york" className="text-foreground focus:bg-muted">
                    America/New_York (EST)
                  </SelectItem>
                  <SelectItem
                    value="america_los_angeles"
                    className="text-foreground focus:bg-muted"
                  >
                    America/Los_Angeles (PST)
                  </SelectItem>
                  <SelectItem value="europe_london" className="text-foreground focus:bg-muted">
                    Europe/London (GMT)
                  </SelectItem>
                  <SelectItem value="asia_tokyo" className="text-foreground focus:bg-muted">
                    Asia/Tokyo (JST)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-blue-800/50 bg-blue-950/30 p-3">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="text-xs font-medium text-blue-200">Next Run Preview</p>
                  <p className="mt-0.5 text-xs text-blue-300/70">
                    Will be calculated after creation
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddScheduleOpen(false)}
              className="text-muted-foreground border"
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-600 text-white hover:bg-amber-500"
              onClick={addScheduledTrigger}
              disabled={!newScheduleName || !newScheduleCron}
            >
              Add Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
