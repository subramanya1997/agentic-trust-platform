"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { INTEGRATIONS, getIntegrationByName } from "@/lib/data/integrations";
import type { ContentEditorProps } from "@/lib/types/agent-form";

const DEFAULT_CONTENT = `<p><strong>Goal</strong></p>
<p>Describe what this agent should accomplish...</p>
<br/>
<p><strong>Instructions</strong></p>
<p>1. When triggered, perform the main task</p>
<p>2. Process the data and extract relevant information</p>
<p>3. Take action based on the results</p>
<br/>
<p><strong>Notes</strong></p>
<p>Add any additional notes here</p>`;

/**
 * Transform @mentions in HTML content to styled elements with integration icons
 * Converts @GitHub to a styled span with the integration icon (dark mode)
 * - If followed by a tool name: shows "logo tool_name" (e.g., [GitHub logo] list_repos)
 * - If standalone: shows "logo IntegrationName" (e.g., [GitHub logo] GitHub)
 */
function transformMentionsToStyledHtml(html: string): string {
  // Match @mentions optionally followed by a tool name (word with underscore pattern)
  // e.g., @GitHub list_repos or @GitHub or @Slack send_message
  return html.replace(
    /@(\w+)(\s+(\w+))?(?![^<]*<\/span[^>]*data-mention)/g,
    (match, integrationName, _space, toolName) => {
      const integration = getIntegrationByName(integrationName);
      if (integration) {
        // Use dark mode icon
        const iconUrl = integration.icons.dark;
        // If there's a tool name, show logo + tool name; otherwise show logo + integration name
        const displayName = toolName || integration.name;
        return `<span data-mention="${integration.name}" contenteditable="false" class="mention-tag"><img src="${iconUrl}" alt="${integration.name}" class="mention-icon" /><span class="mention-name">${displayName}</span></span>`;
      }
      // Return original if not a known integration
      return match;
    }
  );
}

export function ContentEditor({
  content,
  onContentChange,
  onIntegrationAdd,
  connectedIntegrations = [],
  placeholder,
}: ContentEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const lastTransformedContentRef = useRef<string>("");
  const isInitializedRef = useRef(false);

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Get filtered integrations
  const filteredIntegrations = INTEGRATIONS.filter(
    (i) =>
      i.name.toLowerCase().includes(mentionFilter.toLowerCase()) &&
      !connectedIntegrations.includes(i.name)
  );

  // Set initial content on mount and update when content prop changes
  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const currentContent = content !== undefined ? content : placeholder ? "" : DEFAULT_CONTENT;
    const transformedHtml = transformMentionsToStyledHtml(currentContent);

    // Only update if the transformed content is different
    if (transformedHtml !== lastTransformedContentRef.current) {
      contentRef.current.innerHTML = transformedHtml;
      lastTransformedContentRef.current = transformedHtml;
      isInitializedRef.current = true;
    }
  }, [content, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addIntegration = useCallback(
    (name: string) => {
      if (onIntegrationAdd) {
        onIntegrationAdd(name);
      }
      setShowMentionDropdown(false);
      setMentionFilter("");
      setSelectedMentionIndex(0);

      // Replace the @mention text with a styled mention element
      if (contentRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const textNode = range.startContainer;
          if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent || "";
            const cursorPos = range.startOffset;
            const textBefore = text.substring(0, cursorPos);
            const lastAtIndex = textBefore.lastIndexOf("@");
            if (lastAtIndex !== -1) {
              const integration = getIntegrationByName(name);
              if (integration) {
                // Create the styled mention element (dark mode, no @ symbol)
                const iconUrl = integration.icons.dark;
                const mentionHtml = `<span data-mention="${integration.name}" contenteditable="false" class="mention-tag"><img src="${iconUrl}" alt="${integration.name}" class="mention-icon" /><span class="mention-name">${integration.name}</span></span>&nbsp;`;

                // Get text before and after the @mention
                const textBeforeAt = text.substring(0, lastAtIndex);
                const textAfterCursor = text.substring(cursorPos);

                // Create new nodes
                const beforeNode = document.createTextNode(textBeforeAt);
                const afterNode = document.createTextNode(textAfterCursor);

                // Create the mention element
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = mentionHtml;
                const mentionElement = tempDiv.firstChild;
                const spaceNode = tempDiv.lastChild;

                // Replace the text node with our new nodes
                const parent = textNode.parentNode;
                if (parent && mentionElement) {
                  parent.insertBefore(beforeNode, textNode);
                  parent.insertBefore(mentionElement, textNode);
                  if (spaceNode) {
                    parent.insertBefore(spaceNode, textNode);
                  }
                  parent.insertBefore(afterNode, textNode);
                  parent.removeChild(textNode);

                  // Move cursor after the mention
                  const newRange = document.createRange();
                  newRange.setStartAfter(spaceNode || mentionElement);
                  newRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                }
              }
            }
          }
        }
      }
    },
    [onIntegrationAdd]
  );

  // Handle input in contentEditable
  const handleInput = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowMentionDropdown(false);
      return;
    }

    const text = textNode.textContent || "";
    const cursorPos = range.startOffset;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if we're still typing the mention (no space after @)
      if (/^[a-zA-Z0-9]*$/.test(textAfterAt)) {
        setMentionFilter(textAfterAt);
        setSelectedMentionIndex(0);

        // Get cursor position for dropdown
        const rect = range.getBoundingClientRect();
        const containerRect = contentRef.current?.getBoundingClientRect();

        if (containerRect) {
          setMentionPosition({
            top: rect.top - containerRect.top - 10, // Position above cursor
            left: rect.left - containerRect.left,
          });
        }
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);

    // Notify parent of content change
    if (onContentChange && contentRef.current) {
      onContentChange(contentRef.current.innerHTML);
    }
  }, [onContentChange]);

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showMentionDropdown || filteredIntegrations.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedMentionIndex((prev) =>
            prev < filteredIntegrations.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredIntegrations[selectedMentionIndex]) {
            addIntegration(filteredIntegrations[selectedMentionIndex].name);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowMentionDropdown(false);
          break;
        case "Tab":
          e.preventDefault();
          if (filteredIntegrations[selectedMentionIndex]) {
            addIntegration(filteredIntegrations[selectedMentionIndex].name);
          }
          break;
      }
    },
    [showMentionDropdown, filteredIntegrations, selectedMentionIndex, addIntegration]
  );

  return (
    <div className="relative mb-8">
      {/* Styles for mention tags */}
      <style jsx global>{`
        .mention-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: hsl(var(--accent));
          border: 1px solid hsl(var(--border));
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 13px;
          font-weight: 500;
          color: hsl(var(--foreground));
          vertical-align: baseline;
          margin: 0 2px;
        }
        .mention-icon {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          display: inline-block;
          vertical-align: middle;
        }
        .mention-name {
          color: hsl(var(--foreground));
        }
      `}</style>

      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="text-muted-foreground empty:before:text-muted-foreground/50 min-h-[400px] w-full text-sm leading-relaxed empty:before:content-[attr(data-placeholder)] focus:outline-none"
        suppressContentEditableWarning
      />

      {/* @ Mention Dropdown - Positioned above cursor */}
      {showMentionDropdown && filteredIntegrations.length > 0 && (
        <div
          ref={mentionDropdownRef}
          className="bg-card absolute z-50 max-h-64 w-72 overflow-y-auto rounded-lg border shadow-xl"
          style={{
            bottom: `calc(100% - ${mentionPosition.top}px + 20px)`,
            left: mentionPosition.left,
          }}
        >
          <div className="p-2">
            <div className="text-foreground0 mb-1 px-2 py-1 text-xs font-semibold">
              Select Integration
            </div>
            {filteredIntegrations.map((integration, index) => (
              <button
                key={integration.id}
                onClick={() => addIntegration(integration.name)}
                className={`flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors ${
                  index === selectedMentionIndex ? "bg-muted" : "hover:bg-accent"
                }`}
              >
                <Image
                  src={integration.icons.dark}
                  alt={integration.name}
                  width={20}
                  height={20}
                  className="rounded"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">
                      @{integration.name.toLowerCase()}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-accent text-muted-foreground border text-xs"
                    >
                      {integration.type}
                    </Badge>
                  </div>
                  <p className="text-foreground0 truncate text-xs">{integration.description}</p>
                </div>
                {index === selectedMentionIndex && (
                  <span className="text-foreground0 text-xs">Enter</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
