import { CircleCheck, RefreshCw, CircleX } from "lucide-react";
import { STATE_LABELS, type AgentState } from "./types";

const ORDER: AgentState[] = ["planned", "awaiting_approval", "running_remote", "healing", "verified"];

export interface AgentStateIndicatorProps {
  state: AgentState;
  /** Which states to show in the rail. Defaults to the happy path. */
  steps?: AgentState[];
  className?: string;
}

/**
 * Horizontal rail showing where a task is in its lifecycle.
 * Active remote states spin; completed states show a check; `failed` replaces the active step.
 */
export function AgentStateIndicator({
  state,
  steps = ORDER.slice(1),
  className = "",
}: AgentStateIndicatorProps) {
  const failed = state === "failed";
  const current = failed ? -1 : steps.indexOf(state);

  return (
    <ol
      className={`grid gap-px bg-slate-800 font-mono text-xs ${className}`}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      aria-label={`Task state: ${STATE_LABELS[state]}`}
    >
      {steps.map((s, i) => {
        const status = failed ? "todo" : i < current ? "done" : i === current ? "active" : "todo";
        const spinning = status === "active" && (s === "running_remote" || s === "healing");
        return (
          <li
            key={s}
            aria-current={status === "active" ? "step" : undefined}
            className={`flex items-center gap-2 bg-slate-950 px-4 py-2.5 ${
              status === "active" ? "text-blue-300" : status === "done" ? "text-emerald-400" : "text-slate-600"
            }`}
          >
            {status === "done" ? (
              <CircleCheck className="h-3.5 w-3.5" aria-hidden />
            ) : spinning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-blue-400" : "bg-slate-700"}`} />
            )}
            {STATE_LABELS[s]}
          </li>
        );
      })}
      {failed && (
        <li className="col-span-full flex items-center gap-2 bg-rose-950/40 px-4 py-2.5 text-rose-300">
          <CircleX className="h-3.5 w-3.5" aria-hidden /> {STATE_LABELS.failed}
        </li>
      )}
    </ol>
  );
}
