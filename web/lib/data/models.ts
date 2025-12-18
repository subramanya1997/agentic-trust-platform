// Mock LLM model data (will be replaced by API calls)
import type { LLMModel, LLMProvider } from "@/lib/types/models";

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    name: "Anthropic",
    models: [
      {
        id: "opus-4.5",
        name: "Opus 4.5",
        description: "Most capable from Anthropic",
        speed: "Medium",
        cost: "$$$",
      },
      {
        id: "sonnet-4.5",
        name: "Sonnet 4.5",
        description: "Great balance of speed and capability",
        speed: "Fast",
        cost: "$$",
      },
    ],
  },
  {
    name: "OpenAI",
    models: [
      {
        id: "gpt-5.2",
        name: "GPT-5.2",
        description: "Flagship model from OpenAI",
        speed: "Fast",
        cost: "$$$",
      },
    ],
  },
  {
    name: "Google",
    models: [
      {
        id: "gemini-3-pro",
        name: "Gemini 3 Pro",
        description: "Advanced multimodal",
        speed: "Medium",
        cost: "$$$",
      },
      {
        id: "gemini-3-flash",
        name: "Gemini 3 Flash",
        description: "Fast multimodal",
        speed: "Fast",
        cost: "$$",
      },
    ],
  },
  {
    name: "xAI",
    models: [
      {
        id: "grok-4.1",
        name: "Grok 4.1",
        description: "Real-time knowledge",
        speed: "Fast",
        cost: "$$$",
      },
    ],
  },
];

// Helper functions

/**
 * Get all models from all providers as a flat array
 */
export function getAllModels(): LLMModel[] {
  return LLM_PROVIDERS.flatMap((provider) => provider.models);
}

/**
 * Get a model by its ID
 */
export function getModelById(id: string): LLMModel | undefined {
  return getAllModels().find((model) => model.id === id);
}

/**
 * Get a model by its name
 */
export function getModelByName(name: string): LLMModel | undefined {
  return getAllModels().find((model) => model.name === name);
}

/**
 * Get all model names as a simple array
 */
export function getModelNames(): string[] {
  return getAllModels().map((model) => model.name);
}

/**
 * Get provider by name
 */
export function getProviderByName(name: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find((provider) => provider.name === name);
}
