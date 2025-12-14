// Type definitions for LLM models

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  speed: "Fast" | "Medium" | "Slow";
  cost: "$" | "$$" | "$$$";
}

export interface LLMProvider {
  name: string;
  models: LLMModel[];
}
