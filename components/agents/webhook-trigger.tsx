"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Settings, Copy, Check, ExternalLink, Webhook } from "lucide-react";

interface WebhookTriggerProps {
  agentId: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  callCount?: number;
}

export function WebhookTrigger({ agentId, enabled, onEnabledChange, callCount = 1234 }: WebhookTriggerProps) {
  const [copied, setCopied] = useState(false);
  const webhookUrl = `https://api.agentictrust.com/webhooks/${agentId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        enabled 
          ? "bg-card border" 
          : "bg-card/50 border/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          enabled ? "bg-purple-950" : "bg-accent"
        }`}>
          <Webhook className={`h-4 w-4 ${enabled ? "text-purple-400" : "text-foreground0"}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${enabled ? "text-foreground" : "text-foreground0"}`}>
              Webhook
            </span>
            {enabled && (
              <Badge variant="success" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <p className={`text-xs mt-0.5 font-mono ${enabled ? "text-foreground0" : "text-stone-600"}`}>
            {enabled ? webhookUrl : "Trigger agent via HTTP webhook"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {enabled && (
          <>
            <span className="text-xs text-foreground0">{callCount.toLocaleString()} calls</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={copyUrl}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-purple-400" />
                    Webhook Configuration
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Configure the webhook endpoint for this agent.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={webhookUrl}
                        readOnly
                        className="bg-accent border text-muted-foreground font-mono text-sm"
                      />
                      <Button variant="outline" size="icon" className="border shrink-0" onClick={copyUrl}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Authentication</Label>
                    <Select defaultValue="hmac">
                      <SelectTrigger className="bg-accent border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="none" className="text-foreground focus:bg-muted">None</SelectItem>
                        <SelectItem value="hmac" className="text-foreground focus:bg-muted">HMAC Signature</SelectItem>
                        <SelectItem value="bearer" className="text-foreground focus:bg-muted">Bearer Token</SelectItem>
                        <SelectItem value="basic" className="text-foreground focus:bg-muted">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Secret Key</Label>
                    <Input
                      type="password"
                      defaultValue="whsec_xxxxxxxxxxxxx"
                      className="bg-accent border text-foreground font-mono text-sm"
                    />
                    <p className="text-xs text-foreground0">Used to verify webhook signatures</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Rate Limit</Label>
                    <Select defaultValue="100">
                      <SelectTrigger className="bg-accent border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-accent border">
                        <SelectItem value="10" className="text-foreground focus:bg-muted">10 requests/min</SelectItem>
                        <SelectItem value="50" className="text-foreground focus:bg-muted">50 requests/min</SelectItem>
                        <SelectItem value="100" className="text-foreground focus:bg-muted">100 requests/min</SelectItem>
                        <SelectItem value="500" className="text-foreground focus:bg-muted">500 requests/min</SelectItem>
                        <SelectItem value="unlimited" className="text-foreground focus:bg-muted">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center justify-between text-xs text-foreground0">
                      <span>{callCount.toLocaleString()} calls today • 98.5% success rate</span>
                      <Link href="/webhooks" className="text-amber-500 hover:text-amber-400 flex items-center gap-1">
                        View Logs
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  );
}

