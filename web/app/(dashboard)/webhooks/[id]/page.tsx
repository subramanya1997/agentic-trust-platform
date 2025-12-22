"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAgents } from "@/lib/data/mock-data";
import {
  getWebhookById,
  getWebhookDeliveries,
  type Webhook,
  type WebhookDelivery,
} from "@/lib/data/webhooks-data";
import {
  ArrowLeft,
  Copy,
  Check,
  Webhook as WebhookIcon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
} from "@/lib/icons";
import { formatRelativeTime } from "@/lib/utils";

export default function WebhookDetailPage() {
  const params = useParams();
  const webhookId = params.id as string;

  return <WebhookContent key={webhookId} webhookId={webhookId} />;
}

function WebhookContent({ webhookId }: { webhookId: string }) {
  const [webhook] = useState<Webhook | null>(() => getWebhookById(webhookId) || null);
  const [deliveries] = useState<WebhookDelivery[]>(() => getWebhookDeliveries(webhookId));
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  if (!webhook) {
    return (
      <div className="bg-background flex h-screen flex-col">
        <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center border-b px-4">
          <div className="text-muted-foreground">Loading...</div>
        </header>
      </div>
    );
  }

  const copyToClipboard = (text: string, type: "url" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "retrying":
        return <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />;
      default:
        return <Clock className="text-muted-foreground h-4 w-4" />;
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
          >
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
          >
            Failed
          </Badge>
        );
      case "retrying":
        return (
          <Badge
            variant="outline"
            className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            Retrying
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-accent text-muted-foreground border">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header - matching agents page style */}
      <header className="border-border bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/webhooks"
            className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Webhooks
          </Link>
          <span className="text-stone-600">/</span>
          <div className="flex items-center gap-2">
            <WebhookIcon className="h-4 w-4 text-purple-400" />
            <span className="text-foreground font-medium">{webhook.name}</span>
          </div>
          <Badge
            variant="outline"
            className={
              webhook.status === "active"
                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-accent text-muted-foreground border"
            }
          >
            {webhook.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground0 text-xs" suppressHydrationWarning>
            Last triggered{" "}
            {webhook.lastTriggered ? formatRelativeTime(webhook.lastTriggered) : "Never"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={() => copyToClipboard(webhook.url, "url")}
          >
            {copiedUrl ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            {webhook.status === "active" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-8 w-8 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-4xl px-8 py-10">
            {/* Webhook Info Section */}
            <div className="mb-8">
              <h1 className="text-foreground mb-2 text-3xl font-bold">{webhook.name}</h1>
              <p className="text-muted-foreground mb-4">{webhook.description}</p>

              {/* URL Display */}
              <div className="mb-6 flex items-center gap-2">
                <code className="text-muted-foreground bg-accent rounded-lg px-3 py-1.5 font-mono text-sm">
                  {webhook.url}
                </code>
                <button
                  onClick={() => copyToClipboard(webhook.url, "url")}
                  className="text-foreground0 hover:text-muted-foreground transition-colors"
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Stats Row - Simplified without large icons */}
              <div className="border-border grid gap-4 border-b pb-6 md:grid-cols-4">
                <div>
                  <p className="text-foreground0 text-xs tracking-wider uppercase">Deliveries</p>
                  <p className="text-foreground mt-1 text-2xl font-bold">
                    {webhook.totalDeliveries.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-foreground0 text-xs tracking-wider uppercase">Success Rate</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      webhook.successRate >= 98
                        ? "text-green-400"
                        : webhook.successRate >= 95
                          ? "text-amber-400"
                          : "text-red-400"
                    }`}
                  >
                    {webhook.successRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-foreground0 text-xs tracking-wider uppercase">Target Agent</p>
                  <Link
                    href={`/agents/${webhook.targetAgentId}`}
                    className="text-foreground mt-1 flex items-center gap-1 text-sm font-medium hover:text-amber-500"
                  >
                    {webhook.targetAgentName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  <p className="text-foreground0 text-xs tracking-wider uppercase">
                    Last Triggered
                  </p>
                  <p className="text-foreground mt-1 text-sm font-medium" suppressHydrationWarning>
                    {webhook.lastTriggered ? formatRelativeTime(webhook.lastTriggered) : "Never"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="configuration" className="space-y-6">
              <TabsList className="bg-accent border">
                <TabsTrigger value="configuration" className="data-[state=active]:bg-muted">
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-muted">
                  Security
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-muted">
                  Logs
                  {deliveries.length > 0 && (
                    <span className="ml-1.5 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
                      {deliveries.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Configuration Tab */}
              <TabsContent value="configuration">
                <Card className="bg-card border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Webhook Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-foreground">Name</Label>
                        <Input
                          defaultValue={webhook.name}
                          className="bg-accent text-foreground border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Description</Label>
                        <Input
                          defaultValue={webhook.description}
                          className="bg-accent text-foreground border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Endpoint URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={webhook.url}
                          readOnly
                          className="bg-accent text-muted-foreground border font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="border"
                          onClick={() => copyToClipboard(webhook.url, "url")}
                        >
                          {copiedUrl ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Target Agent</Label>
                      <Select defaultValue={webhook.targetAgentId}>
                        <SelectTrigger className="bg-accent text-foreground border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-accent border">
                          {mockAgents.map((agent) => (
                            <SelectItem
                              key={agent.id}
                              value={agent.id}
                              className="text-foreground focus:bg-muted"
                            >
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Custom Headers</Label>
                      <div className="space-y-2">
                        {Object.entries(webhook.headers || {}).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <Input
                              defaultValue={key}
                              placeholder="Header name"
                              className="bg-accent text-foreground flex-1 border"
                            />
                            <Input
                              defaultValue={value}
                              placeholder="Header value"
                              className="bg-accent text-foreground flex-1 border"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground border"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Header
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-foreground mb-4 text-sm font-medium">
                        Retry Configuration
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Max Retries</Label>
                          <Input
                            type="number"
                            defaultValue={webhook.retryConfig.maxRetries}
                            className="bg-accent text-foreground border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Retry Delay (ms)</Label>
                          <Input
                            type="number"
                            defaultValue={webhook.retryConfig.retryDelayMs}
                            className="bg-accent text-foreground border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Exponential Backoff</Label>
                          <Select
                            defaultValue={webhook.retryConfig.exponentialBackoff ? "true" : "false"}
                          >
                            <SelectTrigger className="bg-accent text-foreground border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-accent border">
                              <SelectItem value="true" className="text-foreground focus:bg-muted">
                                Enabled
                              </SelectItem>
                              <SelectItem value="false" className="text-foreground focus:bg-muted">
                                Disabled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-amber-600 text-white hover:bg-amber-500">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="bg-card border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-foreground">Authentication Type</Label>
                      <Select defaultValue={webhook.security.authType}>
                        <SelectTrigger className="bg-accent text-foreground border">
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

                    {webhook.security.authType === "hmac" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-foreground">HMAC Secret</Label>
                          <div className="flex gap-2">
                            <Input
                              type={showSecret ? "text" : "password"}
                              value={webhook.security.hmacSecret || ""}
                              readOnly
                              className="bg-accent text-muted-foreground border font-mono"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="border"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="border"
                              onClick={() =>
                                copyToClipboard(webhook.security.hmacSecret || "", "secret")
                              }
                            >
                              {copiedSecret ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-foreground0 text-xs">
                            Use this secret to verify webhook signatures in your source application.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">HMAC Algorithm</Label>
                          <Select defaultValue={webhook.security.hmacAlgorithm || "sha256"}>
                            <SelectTrigger className="bg-accent text-foreground w-48 border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-accent border">
                              <SelectItem value="sha256" className="text-foreground focus:bg-muted">
                                SHA-256
                              </SelectItem>
                              <SelectItem value="sha512" className="text-foreground focus:bg-muted">
                                SHA-512
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="pt-4">
                      <h3 className="text-foreground mb-4 text-sm font-medium">IP Allowlist</h3>
                      <div className="space-y-2">
                        {(webhook.security.ipAllowlist || []).map((ip, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              defaultValue={ip}
                              className="bg-accent text-foreground border font-mono"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground border"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add IP Address
                        </Button>
                      </div>
                      <p className="text-foreground0 mt-2 text-xs">
                        Leave empty to allow requests from any IP address.
                      </p>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-foreground mb-4 text-sm font-medium">Rate Limiting</h3>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Requests per minute</Label>
                        <Input
                          type="number"
                          defaultValue={webhook.security.rateLimitPerMinute || 100}
                          className="bg-accent text-foreground w-48 border"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-amber-600 text-white hover:bg-amber-500">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs">
                <Card className="bg-card border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-foreground">Delivery Logs</CardTitle>
                    <Button variant="outline" size="sm" className="text-muted-foreground border">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-stone-800">
                      {deliveries.length > 0 ? (
                        deliveries.map((delivery) => (
                          <div key={delivery.id}>
                            <div
                              className="hover:bg-accent/50 flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors"
                              onClick={() =>
                                setExpandedDelivery(
                                  expandedDelivery === delivery.id ? null : delivery.id
                                )
                              }
                            >
                              <button className="text-foreground0">
                                {expandedDelivery === delivery.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              {getDeliveryStatusIcon(delivery.status)}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-foreground text-sm"
                                    suppressHydrationWarning
                                  >
                                    {formatRelativeTime(delivery.timestamp)}
                                  </span>
                                  {getDeliveryStatusBadge(delivery.status)}
                                </div>
                                <p className="text-foreground0 mt-0.5 text-xs">
                                  {delivery.sourceIp} • {delivery.duration}ms
                                  {delivery.retryCount > 0 && ` • ${delivery.retryCount} retries`}
                                </p>
                              </div>
                              {delivery.responseStatus && (
                                <Badge
                                  variant="outline"
                                  className={
                                    delivery.responseStatus >= 200 && delivery.responseStatus < 300
                                      ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                                  }
                                >
                                  {delivery.responseStatus}
                                </Badge>
                              )}
                              {delivery.status === "failed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-muted-foreground border"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  Retry
                                </Button>
                              )}
                            </div>

                            {expandedDelivery === delivery.id && (
                              <div className="bg-background px-6 py-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs">
                                      Request Payload
                                    </Label>
                                    <pre className="text-muted-foreground bg-card max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs">
                                      {JSON.stringify(delivery.requestPayload, null, 2)}
                                    </pre>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs">
                                      Response
                                    </Label>
                                    {delivery.error ? (
                                      <div className="rounded-lg border border-red-800 bg-red-950/50 p-3">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
                                          <p className="text-xs text-red-300">{delivery.error}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <pre className="text-muted-foreground bg-card max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs">
                                        {delivery.responseBody || "No response body"}
                                      </pre>
                                    )}
                                  </div>
                                </div>
                                {delivery.executionId && (
                                  <div className="mt-4 pt-4">
                                    <Link
                                      href={`/activity?execution=${delivery.executionId}`}
                                      className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
                                    >
                                      View Execution Trace
                                      <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">No deliveries yet</p>
                          <p className="text-foreground0 mt-1 text-sm">
                            Deliveries will appear here when the webhook receives requests.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
