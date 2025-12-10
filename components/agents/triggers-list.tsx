"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Webhook, Calendar, Clock, Shield } from "lucide-react";
import type { AgentTrigger } from "@/lib/types";
import { MCPTrigger } from "./mcp-trigger";
import { WebhookTrigger } from "./webhook-trigger";
import { ApiTrigger } from "./api-trigger";
import { ScheduledTrigger } from "./scheduled-trigger";

type TriggerType = "webhook" | "scheduled";

interface TriggersListProps {
  agentId: string;
  agentName: string;
  triggers: AgentTrigger[];
}

export function TriggersList({ agentId, agentName, triggers }: TriggersListProps) {
  const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
  const [selectedTriggerType, setSelectedTriggerType] = useState<TriggerType>("scheduled");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [apiEnabled, setApiEnabled] = useState(true);

  const scheduledTriggers = triggers.filter(t => t.type === "scheduled");

  const handleDialogClose = () => {
    setIsAddTriggerOpen(false);
    setSelectedTriggerType("scheduled");
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">Triggers</h2>
        <Dialog open={isAddTriggerOpen} onOpenChange={(open) => {
          if (!open) handleDialogClose();
          else setIsAddTriggerOpen(true);
        }}>
          <DialogTrigger asChild>
            <button className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors">
              <Plus className="h-4 w-4" />
              Add trigger
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Trigger</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Configure how this agent gets triggered.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Trigger Type Selector */}
              <div className="space-y-2">
                <Label className="text-foreground">Trigger Type</Label>
                <Select 
                  value={selectedTriggerType} 
                  onValueChange={(value) => setSelectedTriggerType(value as TriggerType)}
                >
                  <SelectTrigger className="bg-accent border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-accent border">
                    <SelectItem value="scheduled" className="text-foreground focus:bg-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        Scheduled
                      </div>
                    </SelectItem>
                    <SelectItem value="webhook" className="text-foreground focus:bg-muted">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-purple-400" />
                        Webhook
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Trigger Fields */}
              {selectedTriggerType === "scheduled" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Name</Label>
                    <Input
                      placeholder="e.g., Daily Report Generation"
                      className="bg-accent border text-foreground placeholder:text-foreground0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Schedule (Cron Expression)</Label>
                    <Input
                      placeholder="0 8 * * 1"
                      className="bg-accent border text-foreground placeholder:text-foreground0 font-mono"
                    />
                    <p className="text-xs text-foreground0">
                      Example: &quot;0 8 * * 1&quot; = Every Monday at 8 AM
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="bg-accent border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="utc" className="text-foreground focus:bg-muted">
                          UTC
                        </SelectItem>
                        <SelectItem value="america_new_york" className="text-foreground focus:bg-muted">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="america_los_angeles" className="text-foreground focus:bg-muted">
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
                  <div className="rounded-lg bg-blue-950/30 border border-blue-800/50 p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-200 font-medium">Next Run Preview</p>
                        <p className="text-xs text-blue-300/70 mt-0.5">
                          Monday, Dec 2, 2025 at 8:00 AM UTC
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Webhook Trigger Fields */}
              {selectedTriggerType === "webhook" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Name</Label>
                    <Input
                      placeholder="e.g., New Lead Created"
                      className="bg-accent border text-foreground placeholder:text-foreground0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Description</Label>
                    <Input
                      placeholder="Describe what triggers this webhook"
                      className="bg-accent border text-foreground placeholder:text-foreground0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Authentication</Label>
                    <Select defaultValue="hmac">
                      <SelectTrigger className="bg-accent border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="none" className="text-foreground focus:bg-muted">
                          None
                        </SelectItem>
                        <SelectItem value="hmac" className="text-foreground focus:bg-muted">
                          HMAC Signature
                        </SelectItem>
                        <SelectItem value="bearer" className="text-foreground focus:bg-muted">
                          Bearer Token
                        </SelectItem>
                        <SelectItem value="basic" className="text-foreground focus:bg-muted">
                          Basic Auth
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg bg-purple-950/30 border border-purple-800/50 p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-purple-200 font-medium">Webhook URL</p>
                        <p className="text-xs text-purple-300/70 mt-0.5 font-mono">
                          A unique URL will be generated after creation
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-500 text-white"
                onClick={handleDialogClose}
              >
                Add Trigger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <ApiTrigger
          agentId={agentId}
          enabled={apiEnabled}
          onEnabledChange={setApiEnabled}
        />
        
        <MCPTrigger
          agentId={agentId}
          agentName={agentName}
          enabled={mcpEnabled}
          onEnabledChange={setMcpEnabled}
        />
        
        <WebhookTrigger
          agentId={agentId}
          enabled={webhookEnabled}
          onEnabledChange={setWebhookEnabled}
        />

        {scheduledTriggers.map((trigger) => (
          <ScheduledTrigger key={trigger.id} trigger={trigger} />
        ))}
      </div>
    </div>
  );
}

