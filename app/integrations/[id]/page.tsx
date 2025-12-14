"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { IntegrationIcon } from "@/components/integration-icon";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
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
  read: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500" },
  write: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-500" },
  action: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500" },
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
    if (!integration) return {};
    const toolDescs: Record<string, string> = {};
    integration.tools.forEach(tool => {
      toolDescs[tool.name] = tool.description;
    });
    return toolDescs;
  });

  const [paramDescriptions, setParamDescriptions] = useState<Record<string, string>>(() => {
    if (!integration) return {};
    const paramDescs: Record<string, string> = {};
    integration.tools.forEach(tool => {
      tool.parameters.forEach(param => {
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
    setToolDescriptions(prev => ({ ...prev, [toolName]: description }));
    setEditingTool(null);
  };

  const saveParamDescription = (toolName: string, paramName: string, description: string) => {
    setParamDescriptions(prev => ({ ...prev, [`${toolName}.${paramName}`]: description }));
    setEditingParam(null);
  };

  return (
    <>
      <Header actionButton={null} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-6 py-8 min-w-0">
          {/* Back Link */}
          <Link 
            href="/integrations" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Link>

          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center overflow-hidden shrink-0">
              <IntegrationIcon 
                integrationId={integrationId} 
                alt={integration.name} 
                width={40} 
                height={40}
                className="rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{integration.name}</h1>
                {connectionStatus?.connected && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500 text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{integration.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="text-xs bg-accent text-muted-foreground border">
                  {integration.type}
                </Badge>
                <Badge variant="outline" className="text-xs bg-accent text-muted-foreground border">
                  {integration.category}
                </Badge>
                <span className="text-sm text-foreground0">
                  {integration.tools.length} tools available
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {connectionStatus?.connected ? (
                <>
                  <Button variant="outline" size="sm" className="border text-muted-foreground">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-800 text-red-400 hover:bg-red-950">
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
                  Connect Integration
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground0" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground0 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
              {(["all", "read", "write", "action"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
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
                  { label: '', align: 'left', className: 'w-10' },
                  { label: 'Tool', align: 'left' },
                  { label: 'Description', align: 'left' },
                  { label: 'Type', align: 'center', className: 'w-24' },
                  { label: 'Params', align: 'center', className: 'w-24' },
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
                      onEditParam={(paramName) => setEditingParam({ tool: tool.name, param: paramName })}
                      onSaveParamDescription={(paramName, desc) => saveParamDescription(tool.name, paramName, desc)}
                      onCancelParamEdit={() => setEditingParam(null)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-12 text-center text-foreground0">
                      No tools found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </DataTable>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-foreground0">
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
      <TableRow 
        className="cursor-pointer"
        onClick={onToggle}
      >
        <TableCell className="px-4 py-3">
          <button className="text-foreground0 hover:text-muted-foreground">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </TableCell>
        <TableCell className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <code className="text-sm font-medium text-foreground font-mono">
              {tool.name}
            </code>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3">
          {isEditingDescription ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="flex-1 rounded border border-stone-600 bg-accent px-2 py-1 text-sm text-foreground focus:border-amber-500 focus:outline-none"
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
                className="h-7 w-7 p-0 text-foreground0 hover:text-muted-foreground"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span 
              className="text-sm text-muted-foreground hover:text-muted-foreground cursor-text group"
              onClick={(e) => { e.stopPropagation(); onEditDescription(); }}
            >
              {description}
              <Pencil className="inline h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
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
          <span className="text-sm text-muted-foreground">
            {tool.parameters.length}
          </span>
        </TableCell>
      </TableRow>

      {/* Expanded Parameters Row */}
      {expanded && tool.parameters.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} className="bg-card px-4 py-0">
            <div className="py-4 pl-12">
              <h4 className="text-xs font-semibold text-foreground0 uppercase tracking-wider mb-3">
                Parameters
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 text-xs font-medium text-stone-600 uppercase tracking-wider w-40">
                      Name
                    </th>
                    <th className="pb-2 text-xs font-medium text-stone-600 uppercase tracking-wider w-24">
                      Type
                    </th>
                    <th className="pb-2 text-xs font-medium text-stone-600 uppercase tracking-wider w-24">
                      Required
                    </th>
                    <th className="pb-2 text-xs font-medium text-stone-600 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                  {tool.parameters.map((param) => {
                    const isEditing = editingParam?.tool === tool.name && editingParam?.param === param.name;
                    const paramDesc = paramDescriptions[`${tool.name}.${param.name}`] || param.description;
                    
                    return (
                      <tr key={param.name} className="text-sm">
                        <td className="py-2">
                          <code className="font-mono text-foreground">{param.name}</code>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs bg-accent text-foreground0 border">
                            {param.type}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {param.required ? (
                            <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500 text-red-600 dark:text-red-400">
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
                                className="flex-1 rounded border border-stone-600 bg-accent px-2 py-1 text-sm text-foreground focus:border-amber-500 focus:outline-none"
                                autoFocus
                              />
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-green-500 hover:text-green-400"
                                onClick={() => onSaveParamDescription(param.name, editedParamDescription)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-foreground0 hover:text-muted-foreground"
                                onClick={onCancelParamEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="text-foreground0 hover:text-muted-foreground cursor-text group"
                              onClick={() => onEditParam(param.name)}
                            >
                              {paramDesc}
                              <Pencil className="inline h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
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
