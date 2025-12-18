"use client";

import { useState, useRef, useEffect } from "react";
import { LLM_PROVIDERS } from "@/lib/data/models";
import { ChevronDown, Check } from "@/lib/icons";
import type { ModelSelectorProps } from "@/lib/types/agent-form";
import type { LLMModel } from "@/lib/types/models";

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectModel = (providerName: string, model: LLMModel) => {
    onModelChange({ provider: providerName, model });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-accent text-foreground hover:border-accent flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
      >
        {selectedModel.model.name}
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="bg-card absolute top-full left-0 z-50 mt-2 max-h-[400px] w-72 overflow-y-auto rounded-lg border shadow-xl">
          {LLM_PROVIDERS.map((provider) => (
            <div key={provider.name}>
              <div className="bg-accent border-border sticky top-0 flex items-center gap-2 border-b px-3 py-2">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {provider.name}
                </span>
              </div>
              {provider.models.map((model: LLMModel) => (
                <button
                  key={model.id}
                  onClick={() => selectModel(provider.name, model)}
                  className="hover:bg-accent flex w-full items-center justify-between px-3 py-2 text-left transition-colors"
                >
                  <div>
                    <span className="text-foreground text-sm font-medium">{model.name}</span>
                    <p className="text-muted-foreground text-xs">{model.description}</p>
                  </div>
                  {selectedModel.model.id === model.id && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
