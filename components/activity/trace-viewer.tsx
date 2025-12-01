"use client";

import { useState } from "react";
import type { ExecutionTrace, TraceStep } from "@/lib/types";

interface TraceViewerProps {
  trace: ExecutionTrace;
}

function formatTimestamp(isoString: string, offsetMs: number): string {
  const date = new Date(new Date(isoString).getTime() + offsetMs);
  return date.toISOString().replace("T", " ").replace("Z", "");
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function StepLog({ step, startedAt }: { step: TraceStep; startedAt: string }) {
  const [expanded, setExpanded] = useState(false);
  const timestamp = formatTimestamp(startedAt, step.startOffset);
  
  const statusColor = 
    step.status === "completed" ? "text-green-500" : 
    step.status === "failed" ? "text-red-500" : 
    step.status === "running" ? "text-blue-500" : 
    step.status === "skipped" ? "text-stone-500" : "text-amber-500";

  return (
    <div className="font-mono text-[11px] leading-relaxed">
      {/* Main log line */}
      <div 
        className="flex gap-2 py-1 px-2 hover:bg-stone-800/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-stone-600 shrink-0">{timestamp}</span>
        <span className={`shrink-0 ${statusColor}`}>[{step.status.toUpperCase()}]</span>
        <span className="text-stone-500 shrink-0">[{step.type}]</span>
        <span className="text-stone-300">{step.name}</span>
        {step.integration && <span className="text-cyan-600">integration={step.integration}</span>}
        {step.model && <span className="text-amber-600">model={step.model}</span>}
        <span className="text-stone-600 ml-auto shrink-0">duration={formatDuration(step.duration)}</span>
        {step.cost > 0 && <span className="text-stone-600 shrink-0">cost=${step.cost.toFixed(4)}</span>}
      </div>
      
      {/* Expanded input/output */}
      {expanded && (
        <div className="bg-stone-950 border-l-2 border-stone-700 ml-2 mb-2">
          {step.input && (
            <div className="px-3 py-1">
              <span className="text-stone-500">INPUT: </span>
              <pre className="text-stone-400 whitespace-pre-wrap mt-1 text-[10px]">{JSON.stringify(step.input, null, 2)}</pre>
            </div>
          )}
          {step.output && (
            <div className="px-3 py-1 border-t border-stone-800">
              <span className="text-stone-500">OUTPUT: </span>
              <pre className="text-stone-400 whitespace-pre-wrap mt-1 text-[10px]">{JSON.stringify(step.output, null, 2)}</pre>
            </div>
          )}
          {step.error && (
            <div className="px-3 py-1 border-t border-stone-800">
              <span className="text-red-500">ERROR: </span>
              <span className="text-red-400">{step.error}</span>
            </div>
          )}
          {step.tokens && (
            <div className="px-3 py-1 border-t border-stone-800">
              <span className="text-stone-500">TOKENS: </span>
              <span className="text-stone-400">input={step.tokens.input} output={step.tokens.output} total={step.tokens.input + step.tokens.output}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TraceViewer({ trace }: TraceViewerProps) {
  return (
    <div className="bg-stone-950 rounded border border-stone-800 overflow-hidden font-mono text-[11px]">
      {/* Header */}
      <div className="px-2 py-1.5 bg-stone-900 border-b border-stone-800 text-stone-500">
        execution_id={trace.id} agent="{trace.agentName}" status={trace.status} trigger={trace.triggerType} triggered_by="{trace.triggeredBy}" duration={formatDuration(trace.duration)} cost=${trace.totalCost.toFixed(4)} steps={trace.totalSteps} success={trace.successfulSteps} failed={trace.failedSteps}
      </div>
      
      {/* Log entries */}
      <div className="max-h-[500px] overflow-y-auto divide-y divide-stone-800/50">
        {trace.steps.map((step) => (
          <StepLog key={step.id} step={step} startedAt={trace.startedAt} />
        ))}
      </div>
    </div>
  );
}
