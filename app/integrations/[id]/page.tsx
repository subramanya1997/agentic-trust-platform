"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { IntegrationIcon } from "@/components/integration-icon";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIntegrationTools, Tool } from "@/lib/data/integration-tools";
import {
  ArrowLeft,
  Check,
  Search,
  BookOpen,
  Pencil,
  Zap,
  Settings,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from "@/lib/icons";

// Mock connected status
const connectedIntegrations: Record<string, { connected: boolean; usageCount: number }> = {
  salesforce: { connected: true, usageCount: 3 },
  slack: { connected: true, usageCount: 5 },
  clearbit: { connected: true, usageCount: 2 },
  github: { connected: true, usageCount: 2 },
  zendesk: { connected: true, usageCount: 1 },
  notion: { connected: true, usageCount: 4 },
  linear: { connected: true, usageCount: 2 },
  zoom: { connected: true, usageCount: 1 },
  gmail: { connected: false, usageCount: 0 },
  quickbooks: { connected: false, usageCount: 0 },
};

const categoryColors = {
  read: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
  },
  write: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500",
  },
  action: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500",
  },
};

const categoryIcons = {
  read: BookOpen,
  write: Pencil,
  action: Zap,
};

export default function IntegrationDetailPage() {
  const params = useParams();
  const integrationId = params.id as string;

  return <IntegrationContent key={integrationId} integrationId={integrationId} />;
}

function IntegrationContent({ integrationId }: { integrationId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "read" | "write" | "action">("all");
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [editingParam, setEditingParam] = useState<{ tool: string; param: string } | null>(null);

  const integration = getIntegrationTools(integrationId);
  const connectionStatus = connectedIntegrations[integrationId];

  const [toolDescriptions, setToolDescriptions] = useState<Record<string, string>>(() => {
    if (!integration) {
      return {};
    }
    const toolDescs: Record<string, string> = {};
    integration.tools.forEach((tool) => {
      toolDescs[tool.name] = tool.description;
    });
    return toolDescs;
  });

  const [paramDescriptions, setParamDescriptions] = useState<Record<string, string>>(() => {
    if (!integration) {
      return {};
    }
    const paramDescs: Record<string, string> = {};
    integration.tools.forEach((tool) => {
      tool.parameters.forEach((param) => {
        paramDescs[`${tool.name}.${param.name}`] = param.description;
      });
    });
    return paramDescs;
  });

  if (!integration) {
    notFound();
  }

  const filteredTools = integration.tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toolDescriptions[tool.name]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleTool = (toolName: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolName)) {
      newExpanded.delete(toolName);
    } else {
      newExpanded.add(toolName);
    }
    setExpandedTools(newExpanded);
  };

  const saveToolDescription = (toolName: string, description: string) => {
    setToolDescriptions((prev) => ({ ...prev, [toolName]: description }));
    setEditingTool(null);
  };

  const saveParamDescription = (toolName: string, paramName: string, description: string) => {
    setParamDescriptions((prev) => ({ ...prev, [`${toolName}.${paramName}`]: description }));
    setEditingParam(null);
  };

  return (
    <>
      <Header actionButton={null} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto max-w-6xl min-w-0 px-6 py-8">
          {/* Back Link */}
          <Link
            href="/integrations"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Link>

          {/* Header */}
          <div className="mb-8 flex items-start gap-6">
            <div className="bg-accent flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
              <IntegrationIcon
                integrationId={integrationId}
                alt={integration.name}
                width={40}
                height={40}
                className="rounded"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold">{integration.name}</h1>
                {connectionStatus?.connected && (
                  <Badge
                    variant="outline"
                    className="border-green-500 bg-green-500/10 text-xs text-green-600 dark:text-green-400"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{integration.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant="outline" className="bg-accent text-muted-foreground border text-xs">
                  {integration.type}
                </Badge>
                <Badge variant="outline" className="bg-accent text-muted-foreground border text-xs">
                  {integration.category}
                </Badge>
                <span className="text-foreground0 text-sm">
                  {integration.tools.length} tools available
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {connectionStatus?.connected ? (
                <>
                  <Button variant="outline" size="sm" className="text-muted-foreground border">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-800 text-red-400 hover:bg-red-950"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
                  Connect Integration
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="text-foreground0 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card text-foreground placeholder:text-foreground0 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="bg-accent flex items-center gap-1 rounded-lg p-1">
              {(["all", "read", "write", "action"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Table */}
          <Card className="bg-card border">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  { label: "", align: "left", className: "w-10" },
                  { label: "Tool", align: "left" },
                  { label: "Description", align: "left" },
                  { label: "Type", align: "center", className: "w-24" },
                  { label: "Params", align: "center", className: "w-24" },
                ]}
              >
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <ToolRow
                      key={tool.name}
                      tool={tool}
                      expanded={expandedTools.has(tool.name)}
                      onToggle={() => toggleTool(tool.name)}
                      description={toolDescriptions[tool.name] || tool.description}
                      isEditingDescription={editingTool === tool.name}
                      onEditDescription={() => setEditingTool(tool.name)}
                      onSaveDescription={(desc) => saveToolDescription(tool.name, desc)}
                      onCancelEdit={() => setEditingTool(null)}
                      paramDescriptions={paramDescriptions}
                      editingParam={editingParam}
                      onEditParam={(paramName) =>
                        setEditingParam({ tool: tool.name, param: paramName })
                      }
                      onSaveParamDescription={(paramName, desc) =>
                        saveParamDescription(tool.name, paramName, desc)
                      }
                      onCancelParamEdit={() => setEditingParam(null)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-foreground0 px-4 py-12 text-center">
                      No tools found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </DataTable>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="text-foreground0 mt-6 flex items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" /> Read
            </span>
            <span className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-green-400" /> Write
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Action
            </span>
          </div>
        </div>
      </main>
    </>
  );
}

function ToolRow({
  tool,
  expanded,
  onToggle,
  description,
  isEditingDescription,
  onEditDescription,
  onSaveDescription,
  onCancelEdit,
  paramDescriptions,
  editingParam,
  onEditParam,
  onSaveParamDescription,
  onCancelParamEdit,
}: {
  tool: Tool;
  expanded: boolean;
  onToggle: () => void;
  description: string;
  isEditingDescription: boolean;
  onEditDescription: () => void;
  onSaveDescription: (desc: string) => void;
  onCancelEdit: () => void;
  paramDescriptions: Record<string, string>;
  editingParam: { tool: string; param: string } | null;
  onEditParam: (paramName: string) => void;
  onSaveParamDescription: (paramName: string, desc: string) => void;
  onCancelParamEdit: () => void;
}) {
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedParamDescription, setEditedParamDescription] = useState("");

  const Icon = categoryIcons[tool.category];
  const colors = categoryColors[tool.category];

  useEffect(() => {
    setEditedDescription(description);
  }, [description]);

  useEffect(() => {
    if (editingParam && editingParam.tool === tool.name) {
      setEditedParamDescription(paramDescriptions[`${tool.name}.${editingParam.param}`] || "");
    }
  }, [editingParam, tool.name, paramDescriptions]);

  return (
    <>
      {/* Main Row */}
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="px-4 py-3">
          <button className="text-foreground0 hover:text-muted-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </TableCell>
        <TableCell className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
            >
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <code className="text-foreground font-mono text-sm font-medium">{tool.name}</code>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3">
          {isEditingDescription ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="bg-accent text-foreground flex-1 rounded border border-stone-600 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-green-500 hover:text-green-400"
                onClick={() => onSaveDescription(editedDescription)}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-foreground0 hover:text-muted-foreground h-7 w-7 p-0"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span
              className="text-muted-foreground hover:text-muted-foreground group cursor-text text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditDescription();
              }}
            >
              {description}
              <Pencil className="ml-2 inline h-3 w-3 opacity-0 group-hover:opacity-50" />
            </span>
          )}
        </TableCell>
        <TableCell className="px-4 py-3 text-center">
          <Badge
            variant="outline"
            className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {tool.category}
          </Badge>
        </TableCell>
        <TableCell className="px-4 py-3 text-center">
          <span className="text-muted-foreground text-sm">{tool.parameters.length}</span>
        </TableCell>
      </TableRow>

      {/* Expanded Parameters Row */}
      {expanded && tool.parameters.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} className="bg-card px-4 py-0">
            <div className="py-4 pl-12">
              <h4 className="text-foreground0 mb-3 text-xs font-semibold tracking-wider uppercase">
                Parameters
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="w-40 pb-2 text-xs font-medium tracking-wider text-stone-600 uppercase">
                      Name
                    </th>
                    <th className="w-24 pb-2 text-xs font-medium tracking-wider text-stone-600 uppercase">
                      Type
                    </th>
                    <th className="w-24 pb-2 text-xs font-medium tracking-wider text-stone-600 uppercase">
                      Required
                    </th>
                    <th className="pb-2 text-xs font-medium tracking-wider text-stone-600 uppercase">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                  {tool.parameters.map((param) => {
                    const isEditing =
                      editingParam?.tool === tool.name && editingParam?.param === param.name;
                    const paramDesc =
                      paramDescriptions[`${tool.name}.${param.name}`] || param.description;

                    return (
                      <tr key={param.name} className="text-sm">
                        <td className="py-2">
                          <code className="text-foreground font-mono">{param.name}</code>
                        </td>
                        <td className="py-2">
                          <Badge
                            variant="outline"
                            className="bg-accent text-foreground0 border text-xs"
                          >
                            {param.type}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {param.required ? (
                            <Badge
                              variant="outline"
                              className="border-red-500 bg-red-500/10 text-xs text-red-600 dark:text-red-400"
                            >
                              required
                            </Badge>
                          ) : (
                            <span className="text-xs text-stone-600">optional</span>
                          )}
                        </td>
                        <td className="py-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedParamDescription}
                                onChange={(e) => setEditedParamDescription(e.target.value)}
                                className="bg-accent text-foreground flex-1 rounded border border-stone-600 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-green-500 hover:text-green-400"
                                onClick={() =>
                                  onSaveParamDescription(param.name, editedParamDescription)
                                }
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-foreground0 hover:text-muted-foreground h-7 w-7 p-0"
                                onClick={onCancelParamEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="text-foreground0 hover:text-muted-foreground group cursor-text"
                              onClick={() => onEditParam(param.name)}
                            >
                              {paramDesc}
                              <Pencil className="ml-2 inline h-3 w-3 opacity-0 group-hover:opacity-50" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
