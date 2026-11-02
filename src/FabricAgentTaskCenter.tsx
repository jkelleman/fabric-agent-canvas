"use client";

import { Clock, Gauge, RotateCcw, Terminal } from "lucide-react";
import { AgentStateIndicator } from "./AgentStateIndicator";
import { GuardrailGateCard } from "./GuardrailGateCard";
import { RecoveryTelemetryBanner } from "./RecoveryTelemetryBanner";
import { useAgentRun } from "./useAgentRun";
import type { AgentState, AstDiffLine, LogLine } from "./types";

export interface FabricAgentTaskCenterProps {
  taskName?: string;
  /** Log lines revealed as the task reaches each state. */
  logs?: Partial<Record<AgentState, LogLine[]>>;
  diff?: AstDiffLine[];
  driftError?: string;
  approvalDetail?: string;
  /** Demo mode auto-advances through the remote phases. */
  simulate?: boolean;
}

const DEFAULT_LOGS: Partial<Record<AgentState, LogLine[]>> = {
  awaiting_approval: [
    { level: "info", text: "$ osmos plan --target sales_lakehouse.orders_daily" },
    { level: "success", text: "✔ Pre-flight AST analysis passed" },
    { level: "success", text: "✔ Token budget within limit" },
    { level: "warning", text: "⚠ write_mode=OVERWRITE requires human approval" },
  ],
  running_remote: [
    { level: "info", text: "→ Execution plan handed off to Fabric Spark session" },
    { level: "info", text: "→ CLI detached · remote session persists" },
    { level: "info", text: "… Spark stage 3/7 · partition writes in progress" },
  ],
  healing: [
    { level: "error", text: "✖ AnalysisException: partition column type mismatch (date ≠ string)" },
    { level: "info", text: "→ Introspecting OneLake Delta log for orders_daily schema" },
    { level: "info", text: "→ AST patch: cast(order_date as date) applied in memory" },
  ],
  verified: [
    { level: "success", text: "✔ Retry succeeded · 7/7 stages complete" },
    { level: "success", text: "✔ Pre-commit assertions passed (row count, null ratio, partition set)" },
  ],
};

const DEFAULT_DIFF: AstDiffLine[] = [
  { sign: "-", text: '.withColumn("order_date", col("order_ts"))' },
  { sign: "+", text: '.withColumn("order_date", to_date(col("order_ts")))' },
];

const SEQUENCE: AgentState[] = ["awaiting_approval", "running_remote", "healing", "verified"];
const LEVEL_CLASS = { info: "text-slate-400", success: "text-emerald-400", warning: "text-amber-300", error: "text-rose-400" };

/** Full task-center canvas composed from the library primitives. */
export function FabricAgentTaskCenter({
  taskName = "orders_daily backfill",
  logs = DEFAULT_LOGS,
  diff = DEFAULT_DIFF,
  driftError = "AnalysisException: partition column type mismatch (date ≠ string)",
  approvalDetail = "Destructive write: OVERWRITE on 1 partition set.",
  simulate = true,
}: FabricAgentTaskCenterProps) {
  const run = useAgentRun({ requiresApproval: true, simulate });
  const index = SEQUENCE.indexOf(run.state);
  const cu = Math.max(0, Math.min(100, Math.round((index / 3) * 62 + (run.state === "healing" ? 9 : 0))));
  const visible = SEQUENCE.slice(0, index + 1).flatMap((s) => logs[s] ?? []);

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="flex items-center gap-2 text-slate-200">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="font-semibold">Fabric Agent Task Center</span>
          <span className="text-slate-500">· {taskName}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5" aria-hidden /> CLI: {run.state === "awaiting_approval" ? "attached" : "detached"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {run.elapsedLabel}
          </span>
        </div>
      </div>

      <AgentStateIndicator state={run.state} steps={SEQUENCE} />

      <div className="grid gap-px bg-slate-800 md:grid-cols-[1fr_240px]">
        <div className="min-h-[170px] space-y-1.5 bg-slate-950 p-4" aria-live="polite">
          {visible.map((l, i) => (
            <div key={i} className={LEVEL_CLASS[l.level]}>
              {l.text}
            </div>
          ))}
        </div>

        <div className="space-y-4 bg-slate-950 p-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" aria-hidden /> CU budget
              </span>
              <span className="text-slate-200">{cu}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800">
              <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${cu}%` }} />
            </div>
          </div>

          {run.state === "awaiting_approval" && (
            <GuardrailGateCard detail={approvalDetail} onApprove={run.approve} onReject={run.reject} />
          )}

          {(run.state === "healing" || run.state === "verified") && (
            <RecoveryTelemetryBanner error={driftError} diff={diff} resolved={run.state === "verified"} />
          )}

          {(run.state === "verified" || run.state === "failed") && (
            <button
              type="button"
              onClick={run.reset}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:bg-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay
            </button>
          )}

          <p className="text-[10px] leading-relaxed text-slate-500">
            Sync hint: resume from any terminal with <span className="text-slate-300">osmos attach</span>.
          </p>
        </div>
      </div>
    </figure>
  );
}
