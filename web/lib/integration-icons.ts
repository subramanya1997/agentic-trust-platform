/**
 * @deprecated This file is deprecated. Please import from @/lib/data/integrations instead.
 * This file now re-exports from the data module for backward compatibility.
 */

// Re-export from data module
export { getIntegrationIcon, getIntegrationIcons } from "@/lib/data/integrations";

// Legacy integrationIcons object for backward compatibility
import { INTEGRATIONS } from "@/lib/data/integrations";

export const integrationIcons: Record<string, { light: string; dark: string }> =
  INTEGRATIONS.reduce(
    (acc, integration) => {
      acc[integration.id] = integration.icons;
      return acc;
    },
    {} as Record<string, { light: string; dark: string }>
  );
