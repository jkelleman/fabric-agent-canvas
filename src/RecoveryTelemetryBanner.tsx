"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import type { AstDiffLine } from "./types";

export interface RecoveryTelemetryBannerProps {
  /** The runtime error that triggered recovery. */
  error: string;
  /** The in-memory patch the agent applied. */
  diff: AstDiffLine[];
  /** Whether the retry succeeded. */
  resolved?: boolean;
  defaultOpen?: boolean;
}

/** Surfaces a self-healing event and lets the reviewer inspect the AST diff. */
export function RecoveryTelemetryBanner({ error, diff, resolved = false, defaultOpen = false }: RecoveryTelemetryBannerProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`space-y-2 rounded-lg border p-3 font-mono text-xs ${resolved ? "border-emerald-500/30 bg-emerald-950/20" : "border-rose-500/30 bg-rose-950/20"}`}>
      <div className={`flex items-center gap-1.5 font-semibold ${resolved ? "text-emerald-300" : "text-rose-300"}`}>
        <Wrench className="h-3.5 w-3.5" aria-hidden />
        {resolved ? "Recovered automatically" : "Recovering"}
      </div>
      <p className="break-words text-slate-400">{error}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:bg-slate-900"
      >
        {open ? "Hide" : "Show"} AST diff
      </button>
      {open && (
        <pre className="overflow-x-auto rounded-md border border-slate-800 bg-slate-900 p-2 text-[10px] leading-relaxed">
          {diff.map((d, i) => (
            <div key={i} className={d.sign === "+" ? "text-emerald-400" : "text-rose-400"}>
              {d.sign} {d.text}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
