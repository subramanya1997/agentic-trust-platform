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
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function StepLog({ step, startedAt }: { step: TraceStep; startedAt: string }) {
  const [expanded, setExpanded] = useState(false);
  const timestamp = formatTimestamp(startedAt, step.startOffset);

  const statusColor =
    step.status === "completed"
      ? "text-green-500"
      : step.status === "failed"
        ? "text-red-500"
        : step.status === "running"
          ? "text-blue-500"
          : step.status === "skipped"
            ? "text-foreground0"
            : "text-amber-500";

  return (
    <div className="font-mono text-[11px] leading-relaxed">
      {/* Main log line */}
      <div
        className="hover:bg-accent/50 flex cursor-pointer gap-2 px-2 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="shrink-0 text-stone-600">{timestamp}</span>
        <span className={`shrink-0 ${statusColor}`}>[{step.status.toUpperCase()}]</span>
        <span className="text-foreground0 shrink-0">[{step.type}]</span>
        <span className="text-muted-foreground">{step.name}</span>
        {step.integration && <span className="text-cyan-600">integration={step.integration}</span>}
        {step.model && <span className="text-amber-600">model={step.model}</span>}
        <span className="ml-auto shrink-0 text-stone-600">
          duration={formatDuration(step.duration)}
        </span>
        {step.cost > 0 && (
          <span className="shrink-0 text-stone-600">cost=${step.cost.toFixed(4)}</span>
        )}
      </div>

      {/* Expanded input/output */}
      {expanded && (
        <div className="bg-background mb-2 ml-2 border border-l-2">
          {step.input && (
            <div className="px-3 py-1">
              <span className="text-foreground0">INPUT: </span>
              <pre className="text-muted-foreground mt-1 text-[10px] whitespace-pre-wrap">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}
          {step.output && (
            <div className="px-3 py-1">
              <span className="text-foreground0">OUTPUT: </span>
              <pre className="text-muted-foreground mt-1 text-[10px] whitespace-pre-wrap">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}
          {step.error && (
            <div className="px-3 py-1">
              <span className="text-red-500">ERROR: </span>
              <span className="text-red-400">{step.error}</span>
            </div>
          )}
          {step.tokens && (
            <div className="px-3 py-1">
              <span className="text-foreground0">TOKENS: </span>
              <span className="text-muted-foreground">
                input={step.tokens.input} output={step.tokens.output} total=
                {step.tokens.input + step.tokens.output}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TraceViewer({ trace }: TraceViewerProps) {
  return (
    <div className="bg-background overflow-hidden rounded border font-mono text-[11px]">
      {/* Header */}
      <div className="bg-card border-border text-foreground0 border-b px-2 py-1.5">
        execution_id={trace.id} agent=&quot;{trace.agentName}&quot; status={trace.status} trigger=
        {trace.triggerType} triggered_by=&quot;{trace.triggeredBy}&quot; duration=
        {formatDuration(trace.duration)} cost=${trace.totalCost.toFixed(4)} steps={trace.totalSteps}{" "}
        success={trace.successfulSteps} failed={trace.failedSteps}
      </div>

      {/* Log entries */}
      <div className="max-h-[500px] divide-y divide-stone-800/50 overflow-y-auto">
        {trace.steps.map((step) => (
          <StepLog key={step.id} step={step} startedAt={trace.startedAt} />
        ))}
      </div>
    </div>
  );
}
