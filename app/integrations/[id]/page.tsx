"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { getIntegrationIcon } from "@/lib/integration-icons";
import { getIntegrationTools, Tool, Parameter } from "@/lib/data/integration-tools";
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
} from "lucide-react";

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
  read: { bg: "bg-blue-950", text: "text-blue-400", border: "border-blue-800" },
  write: { bg: "bg-green-950", text: "text-green-400", border: "border-green-800" },
  action: { bg: "bg-amber-950", text: "text-amber-400", border: "border-amber-800" },
};

const categoryIcons = {
  read: BookOpen,
  write: Pencil,
  action: Zap,
};

export default function IntegrationDetailPage() {
  const params = useParams();
  const integrationId = params.id as string;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "read" | "write" | "action">("all");
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [editingParam, setEditingParam] = useState<{ tool: string; param: string } | null>(null);
  const [toolDescriptions, setToolDescriptions] = useState<Record<string, string>>({});
  const [paramDescriptions, setParamDescriptions] = useState<Record<string, string>>({});
  
  const integration = getIntegrationTools(integrationId);
  const connectionStatus = connectedIntegrations[integrationId];
  
  // Initialize descriptions from data
  useEffect(() => {
    if (integration) {
      const toolDescs: Record<string, string> = {};
      const paramDescs: Record<string, string> = {};
      
      integration.tools.forEach(tool => {
        toolDescs[tool.name] = tool.description;
        tool.parameters.forEach(param => {
          paramDescs[`${tool.name}.${param.name}`] = param.description;
        });
      });
      
      setToolDescriptions(toolDescs);
      setParamDescriptions(paramDescs);
    }
  }, [integration]);
  
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Link */}
          <Link 
            href="/integrations" 
            className="inline-flex items-center text-sm text-stone-400 hover:text-stone-200 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Link>

          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="h-16 w-16 rounded-xl bg-stone-800 flex items-center justify-center overflow-hidden shrink-0">
              <Image 
                src={getIntegrationIcon(integrationId)} 
                alt={integration.name} 
                width={40} 
                height={40}
                className="rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-stone-100">{integration.name}</h1>
                {connectionStatus?.connected && (
                  <Badge variant="outline" className="text-xs bg-green-950 text-green-400 border-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-stone-400 mt-1">{integration.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                  {integration.type}
                </Badge>
                <Badge variant="outline" className="text-xs bg-stone-800 text-stone-400 border-stone-700">
                  {integration.category}
                </Badge>
                <span className="text-sm text-stone-500">
                  {integration.tools.length} tools available
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {connectionStatus?.connected ? (
                <>
                  <Button variant="outline" size="sm" className="border-stone-700 text-stone-300">
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-900 py-2 pl-10 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
              {(["all", "read", "write", "action"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-stone-700 text-stone-100"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Table */}
          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-800">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider w-24">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider w-24">
                      Params
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
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
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                        No tools found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-stone-500">
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
      <tr 
        className="hover:bg-stone-800/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <button className="text-stone-500 hover:text-stone-300">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <code className="text-sm font-medium text-stone-100 font-mono">
              {tool.name}
            </code>
          </div>
        </td>
        <td className="px-4 py-3">
          {isEditingDescription ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="flex-1 rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
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
                className="h-7 w-7 p-0 text-stone-500 hover:text-stone-400"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span 
              className="text-sm text-stone-400 hover:text-stone-300 cursor-text group"
              onClick={(e) => { e.stopPropagation(); onEditDescription(); }}
            >
              {description}
              <Pencil className="inline h-3 w-3 ml-2 opacity-0 group-hover:opacity-50" />
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          <Badge 
            variant="outline" 
            className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {tool.category}
          </Badge>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm text-stone-400">
            {tool.parameters.length}
          </span>
        </td>
      </tr>

      {/* Expanded Parameters Row */}
      {expanded && tool.parameters.length > 0 && (
        <tr>
          <td colSpan={5} className="bg-stone-950/50 px-4 py-0">
            <div className="py-4 pl-12">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
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
                          <code className="font-mono text-stone-200">{param.name}</code>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs bg-stone-800 text-stone-500 border-stone-700">
                            {param.type}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {param.required ? (
                            <Badge variant="outline" className="text-xs bg-red-950 text-red-400 border-red-800">
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
                                className="flex-1 rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
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
                                className="h-7 w-7 p-0 text-stone-500 hover:text-stone-400"
                                onClick={onCancelParamEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="text-stone-500 hover:text-stone-400 cursor-text group"
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
          </td>
        </tr>
      )}
    </>
  );
}
