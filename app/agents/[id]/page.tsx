"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import Image from "next/image";
import { mockAgents } from "@/lib/data/mock-data";
import { formatCurrency, formatPercentage, formatRelativeTime } from "@/lib/utils";
import { getIntegrationIcon } from "@/lib/integration-icons";
import {
  ArrowLeft,
  Play,
  Settings,
  Copy,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
  Plus,
  Paperclip,
  Send,
  PanelRight,
  PanelRightClose,
  Zap,
} from "lucide-react";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-stone-400">Loading...</div>
        </main>
      </>
    );
  }

  const agent = mockAgents.find((a) => a.id === resolvedParams.id);

  if (!agent) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-stone-800 bg-stone-950 px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="flex items-center text-sm text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Agents
          </Link>
          <span className="text-stone-600">/</span>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-stone-100 font-medium">{agent.name}</span>
          </div>
          <Badge 
            variant="outline" 
            className={agent.status === "active" 
              ? "bg-green-950 text-green-400 border-green-800" 
              : "bg-stone-800 text-stone-400 border-stone-700"
            }
          >
            {agent.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500" suppressHydrationWarning>Last run {formatRelativeTime(agent.lastRun)}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-stone-200">
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-stone-400 hover:text-stone-200"
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          >
            {isBuilderOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Document View */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Agent Title + Run Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-stone-100">{agent.name}</h1>
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                <Play className="mr-2 h-4 w-4 fill-current" />
                Run agent
              </Button>
            </div>

            {/* Model & Schedule Row */}
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 text-sm text-stone-200 hover:border-stone-600 transition-colors">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {agent.model}
                <ChevronDown className="h-4 w-4 text-stone-400" />
              </button>
              <button className="text-sm text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors">
                <Plus className="h-4 w-4" />
                Add schedule/trigger
              </button>
            </div>

            {/* Connected Integrations Row */}
            <div className="flex items-center gap-2 flex-wrap mb-8 pb-6 border-b border-stone-800">
              {agent.integrations.map((integration, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="px-3 py-1.5 bg-stone-800 border-stone-700 text-stone-200 flex items-center gap-2"
                >
                  <Image 
                    src={getIntegrationIcon(integration.name)} 
                    alt={integration.name} 
                    width={16} 
                    height={16}
                    className="rounded"
                  />
                  {integration.name}
                  <span className="text-xs text-stone-500">({integration.type})</span>
                  {integration.connected ? (
                    <button className="ml-1 hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="ml-1 text-amber-500 flex items-center gap-0.5 text-xs">
                      Connect <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))}
              <button className="text-sm text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors">
                <Plus className="h-4 w-4" />
                Add integration
              </button>
            </div>

            {/* Goal Section */}
            <div className="mb-8">
              <h2 className="font-semibold text-stone-100 mb-3">Goal</h2>
              <p className="text-stone-300 leading-relaxed">{agent.goal}</p>
            </div>

            {/* Integrations List */}
            <div className="mb-8">
              <h2 className="font-semibold text-stone-100 mb-3">Integrations</h2>
              <ol className="space-y-2 text-stone-300 ml-2">
                {agent.integrations.map((integration, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-stone-500 w-4">{index + 1}.</span>
                    <Image 
                      src={getIntegrationIcon(integration.name)} 
                      alt={integration.name} 
                      width={20} 
                      height={20}
                      className="rounded"
                    />
                    <span className="font-medium">{integration.name}</span>
                    <span className="text-xs text-stone-500">({integration.type})</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="font-semibold text-stone-100 mb-3">Instructions</h2>
              <ol className="space-y-3 text-stone-300">
                {agent.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-stone-500 shrink-0">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8 pt-6 border-t border-stone-800">
              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400">Total Runs</p>
                      <p className="mt-1 text-2xl font-bold text-stone-50">
                        {agent.executionCount.toLocaleString()}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400">Success Rate</p>
                      <p className="mt-1 text-2xl font-bold text-green-400">
                        {formatPercentage(agent.successRate)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400">Avg Cost</p>
                      <p className="mt-1 text-2xl font-bold text-stone-50">
                        {formatCurrency(agent.avgCost)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400">Version</p>
                      <p className="mt-1 text-2xl font-bold text-stone-50">
                        {agent.version}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <div className="pt-6 border-t border-stone-800">
              <h2 className="font-semibold text-stone-100 mb-4">Activity</h2>
              <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                        <tr className="hover:bg-stone-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-green-950 flex items-center justify-center">
                                <Play className="h-3 w-3 text-green-400" />
                              </div>
                              <span className="text-sm text-stone-200">Agent Run</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-400">System</td>
                          <td className="px-4 py-3 text-sm text-stone-400">Completed successfully</td>
                          <td className="px-4 py-3 text-right text-sm text-stone-500" suppressHydrationWarning>{formatRelativeTime(agent.lastRun)}</td>
                        </tr>
                        <tr className="hover:bg-stone-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-blue-950 flex items-center justify-center">
                                <Settings className="h-3 w-3 text-blue-400" />
                              </div>
                              <span className="text-sm text-stone-200">Config Updated</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-400">{agent.createdBy}</td>
                          <td className="px-4 py-3 text-sm text-stone-400">Updated instructions</td>
                          <td className="px-4 py-3 text-right text-sm text-stone-500">2 days ago</td>
                        </tr>
                        <tr className="hover:bg-stone-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-purple-950 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-purple-400" />
                              </div>
                              <span className="text-sm text-stone-200">Integration Added</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-400">{agent.createdBy}</td>
                          <td className="px-4 py-3 text-sm text-stone-400">Connected {agent.integrations[0]?.name}</td>
                          <td className="px-4 py-3 text-right text-sm text-stone-500">1 week ago</td>
                        </tr>
                        <tr className="hover:bg-stone-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-orange-950 flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-orange-400" />
                              </div>
                              <span className="text-sm text-stone-200">Version Released</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-400">{agent.createdBy}</td>
                          <td className="px-4 py-3 text-sm text-stone-400">Released v{agent.version}</td>
                          <td className="px-4 py-3 text-right text-sm text-stone-500">2 weeks ago</td>
                        </tr>
                        <tr className="hover:bg-stone-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-amber-950 flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-amber-400" />
                              </div>
                              <span className="text-sm text-stone-200">Agent Created</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-400">{agent.createdBy}</td>
                          <td className="px-4 py-3 text-sm text-stone-400">Created {agent.name}</td>
                          <td className="px-4 py-3 text-right text-sm text-stone-500">
                            {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Panel - Agent Builder Chat (Collapsible) */}
        <div 
          className={`flex flex-col border-l border-stone-800 bg-stone-900 transition-all duration-300 ease-in-out ${
            isBuilderOpen ? 'w-[340px]' : 'w-0'
          } overflow-hidden`}
        >
          <div className="w-[340px] h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-5 border-b border-stone-800 shrink-0">
              <h2 className="font-semibold text-stone-100">Agent builder</h2>
              <p className="text-sm text-stone-400 mt-1">
                How can I improve {agent.name}?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-stone-800 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Add error handling
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Suggest optimizations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-stone-700 text-stone-300 hover:bg-stone-800">
                Add more integrations
              </Button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-950">
              <div className="bg-stone-900 rounded-lg p-3 border border-stone-800">
                <p className="text-sm text-stone-300">
                  I can help you improve this agent. Try:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-stone-400">
                  <li>- "Add retry logic for failed API calls"</li>
                  <li>- "What integrations would improve this?"</li>
                  <li>- "Add logging for debugging"</li>
                </ul>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-stone-800 bg-stone-900 shrink-0">
              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  rows={2}
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 pr-20 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button className="p-1.5 text-stone-400 hover:text-stone-300 rounded-lg transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg transition-colors"
                    onClick={() => setChatMessage("")}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
