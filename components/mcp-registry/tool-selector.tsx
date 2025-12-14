"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { integrationsWithTools } from "@/lib/data/integration-tools";
import { mockAgents } from "@/lib/data/mock-data";
import { Search, ChevronDown, ChevronRight, Bot, CheckSquare, Square } from "@/lib/icons";
import { getIntegrationIcon } from "@/lib/integration-icons";
import type { SelectedTool, ToolParameter } from "@/lib/types";

interface ToolSelectorProps {
  selectedTools: SelectedTool[];
  onSelectionChange: (tools: SelectedTool[]) => void;
}

type CategoryFilter = "all" | "read" | "write" | "action";

interface ToolGroup {
  id: string;
  name: string;
  type: "integration" | "agent";
  tools: SelectedTool[];
}

export function ToolSelector({ selectedTools, onSelectionChange }: ToolSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["salesforce", "slack", "github"])
  );

  // Build tool groups from integrations and agents
  const toolGroups = useMemo(() => {
    const groups: ToolGroup[] = [];

    // Integration tools
    for (const integration of integrationsWithTools) {
      const tools: SelectedTool[] = integration.tools.map((tool) => ({
        sourceType: "integration" as const,
        sourceId: integration.id,
        sourceName: integration.name,
        toolName: tool.name,
        toolDescription: tool.description,
        category: tool.category,
        parameters: tool.parameters as ToolParameter[],
      }));

      groups.push({
        id: integration.id,
        name: integration.name,
        type: "integration",
        tools,
      });
    }

    // Agent tools (each active agent becomes a callable tool)
    const agentTools: SelectedTool[] = mockAgents
      .filter((agent) => agent.status === "active")
      .map((agent) => ({
        sourceType: "agent" as const,
        sourceId: agent.id,
        sourceName: agent.name,
        toolName: agent.name.toLowerCase().replace(/\s+/g, "_"),
        toolDescription: agent.description,
        category: "action" as const,
        parameters: [
          {
            name: "input",
            type: "string",
            description: "Input for the agent to process",
            required: true,
          },
        ],
      }));

    if (agentTools.length > 0) {
      groups.push({
        id: "agents",
        name: "Agents",
        type: "agent",
        tools: agentTools,
      });
    }

    return groups;
  }, []);

  // Filter tools based on search and category
  const filteredGroups = useMemo(() => {
    return toolGroups
      .map((group) => ({
        ...group,
        tools: group.tools.filter((tool) => {
          const matchesSearch =
            searchQuery === "" ||
            tool.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.toolDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.sourceName.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;

          return matchesSearch && matchesCategory;
        }),
      }))
      .filter((group) => group.tools.length > 0);
  }, [toolGroups, searchQuery, categoryFilter]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isToolSelected = (tool: SelectedTool) => {
    return selectedTools.some(
      (t) =>
        t.sourceId === tool.sourceId &&
        t.toolName === tool.toolName &&
        t.sourceType === tool.sourceType
    );
  };

  const toggleTool = (tool: SelectedTool) => {
    if (isToolSelected(tool)) {
      onSelectionChange(
        selectedTools.filter(
          (t) =>
            !(
              t.sourceId === tool.sourceId &&
              t.toolName === tool.toolName &&
              t.sourceType === tool.sourceType
            )
        )
      );
    } else {
      onSelectionChange([...selectedTools, tool]);
    }
  };

  const selectAllInGroup = (group: ToolGroup) => {
    const newSelection = [...selectedTools];
    for (const tool of group.tools) {
      if (!isToolSelected(tool)) {
        newSelection.push(tool);
      }
    }
    onSelectionChange(newSelection);
  };

  const deselectAllInGroup = (group: ToolGroup) => {
    onSelectionChange(
      selectedTools.filter(
        (t) =>
          !group.tools.some(
            (gt) =>
              gt.sourceId === t.sourceId &&
              gt.toolName === t.toolName &&
              gt.sourceType === t.sourceType
          )
      )
    );
  };

  const getGroupSelectionState = (group: ToolGroup) => {
    const selectedCount = group.tools.filter((t) => isToolSelected(t)).length;
    if (selectedCount === 0) {
      return "none";
    }
    if (selectedCount === group.tools.length) {
      return "all";
    }
    return "partial";
  };

  const totalTools = toolGroups.reduce((sum, g) => sum + g.tools.length, 0);
  const filteredToolsCount = filteredGroups.reduce((sum, g) => sum + g.tools.length, 0);

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          >
            {selectedTools.length} selected
          </Badge>
          <span className="text-foreground0 text-xs">of {totalTools} available tools</span>
        </div>
        {selectedTools.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-foreground0 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-accent text-foreground placeholder:text-foreground0 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1">
          {(["all", "read", "write", "action"] as const).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={
                categoryFilter === cat
                  ? "bg-amber-600 text-xs hover:bg-amber-500"
                  : "text-muted-foreground hover:text-foreground border text-xs"
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools List */}
      <div className="bg-card max-h-[500px] overflow-y-auto rounded-lg border">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="mx-auto mb-2 h-8 w-8 text-stone-600" />
            <p className="text-muted-foreground text-sm">No tools found</p>
            <p className="text-foreground0 mt-1 text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const selectionState = getGroupSelectionState(group);
            const isExpanded = expandedGroups.has(group.id);

            return (
              <div key={group.id} className="border-border border-b last:border-b-0">
                {/* Group Header */}
                <div className="bg-stone-850 hover:bg-accent/50 flex items-center justify-between px-4 py-3 transition-colors">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex flex-1 items-center gap-3"
                  >
                    {isExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                    <div className="bg-accent flex h-7 w-7 items-center justify-center rounded">
                      {group.type === "integration" ? (
                        <Image
                          src={getIntegrationIcon(group.id)}
                          alt={group.name}
                          width={16}
                          height={16}
                          className="rounded"
                        />
                      ) : (
                        <Bot className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-medium">{group.name}</span>
                    <Badge
                      variant="outline"
                      className="bg-accent text-muted-foreground border text-xs"
                    >
                      {group.tools.length} tools
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      if (selectionState === "all") {
                        deselectAllInGroup(group);
                      } else {
                        selectAllInGroup(group);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
                  >
                    {selectionState === "all" ? (
                      <>
                        <CheckSquare className="h-3.5 w-3.5" />
                        Deselect all
                      </>
                    ) : (
                      <>
                        <Square className="h-3.5 w-3.5" />
                        Select all
                      </>
                    )}
                  </button>
                </div>

                {/* Tools in Group */}
                {isExpanded && (
                  <div className="divide-y divide-stone-800/50">
                    {group.tools.map((tool) => {
                      const isSelected = isToolSelected(tool);
                      return (
                        <div
                          key={`${tool.sourceId}-${tool.toolName}`}
                          className={`flex cursor-pointer items-start gap-3 px-4 py-3 pl-12 transition-colors ${
                            isSelected
                              ? "bg-amber-950/20 hover:bg-amber-950/30"
                              : "hover:bg-accent/30"
                          }`}
                          onClick={() => toggleTool(tool)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTool(tool)}
                            className="mt-0.5 border-stone-600 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-foreground font-mono text-sm">
                                {tool.toolName}
                              </code>
                              <Badge
                                variant="outline"
                                className={`px-1.5 py-0 text-[10px] ${
                                  tool.category === "read"
                                    ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                                    : tool.category === "write"
                                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                      : "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {tool.category}
                              </Badge>
                            </div>
                            <p className="text-foreground0 mt-1 line-clamp-2 text-xs">
                              {tool.toolDescription}
                            </p>
                            {tool.parameters.length > 0 && (
                              <div className="mt-1.5 flex items-center gap-1">
                                <span className="text-[10px] text-stone-600">
                                  {tool.parameters.filter((p) => p.required).length} required,{" "}
                                  {tool.parameters.filter((p) => !p.required).length} optional
                                  params
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      {searchQuery || categoryFilter !== "all" ? (
        <p className="text-foreground0 text-center text-xs">
          Showing {filteredToolsCount} of {totalTools} tools
        </p>
      ) : null}
    </div>
  );
}
