/**
 * @deprecated This file is deprecated. Please import from @/lib/data/integrations instead.
 * This file now re-exports from the data module for backward compatibility.
 */

// Re-export types from types module
export type { Parameter, Tool, Integration, IntegrationWithTools } from "@/lib/types/integrations";

// Re-export data and functions from data module
export {
  INTEGRATIONS,
  getIntegrationById,
  getIntegrationByName,
  getIntegrationIcon,
  getIntegrationIcons,
  getIntegrationsByType,
  getIntegrationsByCategory,
  getIntegrationCategories,
  getIntegrationsWithTools,
  getIntegrationWithToolsById,
} from "@/lib/data/integrations";
import { getIntegrationsWithTools, getIntegrationWithToolsById } from "@/lib/data/integrations";

// Re-export integrationsWithTools for backward compatibility
export const integrationsWithTools = getIntegrationsWithTools();

// Re-export helper function for backward compatibility (returns IntegrationWithTools)
export function getIntegrationTools(integrationId: string) {
  return getIntegrationWithToolsById(integrationId);
}
