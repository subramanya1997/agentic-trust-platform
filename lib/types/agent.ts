/**
 * Type definitions for AI-generated agent configurations
 */

export interface GeneratedAgent {
  title: string;
  goal: string;
  integrations: string[];
  instructions: string[];
  triggers?: {
    api?: boolean;
    mcp?: boolean;
    webhook?: boolean;
    scheduled?: {
      enabled: boolean;
      cron?: string;
      description?: string;
    };
  };
  notes?: string;
}
