/**
 * Type definitions for Agent Form components
 * These types enable controlled components with props instead of internal state
 */

import type { LLMModel } from "@/lib/types/models";

// ============ Schedule Trigger Types ============
export interface ScheduleTrigger {
  id: string;
  name: string;
  cron: string;
  timezone: string;
  enabled: boolean;
}

// ============ Triggers State ============
export interface TriggersState {
  api: boolean;
  mcp: boolean;
  webhook: boolean;
  scheduled: ScheduleTrigger[];
}

// ============ Model Selection ============
export interface SelectedModel {
  provider: string;
  model: LLMModel;
}

// ============ Context File ============
export interface ContextFile {
  name: string;
  type: string;
}

// ============ Agent Form State ============
export interface AgentFormState {
  name: string;
  selectedModel: SelectedModel;
  triggers: TriggersState;
  integrations: string[];
  contexts: ContextFile[];
  content: string;
}

// ============ Agent Form Callbacks ============
export interface AgentFormCallbacks {
  onNameChange: (name: string) => void;
  onModelChange: (model: SelectedModel) => void;
  onTriggersChange: (triggers: TriggersState) => void;
  onIntegrationsChange: (integrations: string[]) => void;
  onContextsChange: (contexts: ContextFile[]) => void;
  onContentChange: (content: string) => void;
}

// ============ Trigger Component Props ============
export interface TriggerRowProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

// ============ Model Selector Props ============
export interface ModelSelectorProps {
  selectedModel: SelectedModel;
  onModelChange: (model: SelectedModel) => void;
}

// ============ Triggers Editor Props ============
export interface TriggersEditorProps {
  triggers: TriggersState;
  onTriggersChange: (triggers: TriggersState) => void;
}

// ============ Integrations Bar Props ============
export interface IntegrationsBarProps {
  integrations: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  showPlaceholder?: boolean;
}

// ============ Context Section Props ============
export interface ContextSectionProps {
  contexts: ContextFile[];
  onAdd: (files: ContextFile[]) => void;
  onRemove: (name: string) => void;
}

// ============ Content Editor Props ============
export interface ContentEditorProps {
  /** Controlled content value - when this changes, the editor updates */
  content?: string;
  /** Called when content changes via user input */
  onContentChange?: (content: string) => void;
  onIntegrationAdd?: (name: string) => void;
  connectedIntegrations?: string[];
  placeholder?: string;
}

// AgentHeaderProps is defined in the component file for better co-location
