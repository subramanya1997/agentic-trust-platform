// Type definitions for integrations and tools

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Tool {
  name: string;
  description: string;
  category: "read" | "write" | "action";
  parameters: Parameter[];
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "API" | "MCP";
  icons: {
    light: string;
    dark: string;
  };
  tools?: Tool[];
}

export interface IntegrationWithTools extends Integration {
  tools: Tool[];
}
