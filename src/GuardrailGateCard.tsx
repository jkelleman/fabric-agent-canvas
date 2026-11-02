import { Play, ShieldCheck, X } from "lucide-react";

export interface GuardrailGateCardProps {
  /** e.g. "Destructive write: OVERWRITE on 1 partition set." */
  detail: string;
  title?: string;
  approveLabel?: string;
  onApprove: () => void;
  onReject?: () => void;
}

/** Pre-flight review card that stops a destructive action until a person approves it. */
export function GuardrailGateCard({
  detail,
  title = "Guardrail gate",
  approveLabel = "Approve & run",
  onApprove,
  onReject,
}: GuardrailGateCardProps) {
  return (
    <div role="region" aria-label={title} className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 font-mono text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-amber-300">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {title}
      </div>
      <p className="text-slate-400">{detail}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white transition hover:bg-blue-500"
        >
          <Play className="h-3.5 w-3.5" aria-hidden /> {approveLabel}
        </button>
        {onReject && (
          <button
            type="button"
            onClick={onReject}
            aria-label="Reject"
            className="rounded-md border border-slate-700 px-2 text-slate-300 transition hover:bg-slate-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
