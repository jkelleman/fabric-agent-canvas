"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentState } from "./types";

export interface UseAgentRunOptions {
  /** Start in awaiting_approval (destructive writes) or running_remote. */
  requiresApproval?: boolean;
  /** Demo mode: advance running_remote → healing → verified on timers. */
  simulate?: boolean;
  /** ms per simulated phase */
  phaseMs?: { running: number; healing: number };
}

/**
 * Minimal client-side state machine for an agent task, with an elapsed timer
 * that ticks only while the remote job is active.
 */
export function useAgentRun({
  requiresApproval = true,
  simulate = false,
  phaseMs = { running: 3500, healing: 4500 },
}: UseAgentRunOptions = {}) {
  const initial: AgentState = requiresApproval ? "awaiting_approval" : "running_remote";
  const [state, setState] = useState<AgentState>(initial);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state !== "running_remote" && state !== "healing") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (!simulate) return;
    if (state === "running_remote") {
      const t = setTimeout(() => setState("healing"), phaseMs.running);
      return () => clearTimeout(t);
    }
    if (state === "healing") {
      const t = setTimeout(() => setState("verified"), phaseMs.healing);
      return () => clearTimeout(t);
    }
  }, [state, simulate, phaseMs.running, phaseMs.healing]);

  const approve = useCallback(() => setState((s) => (s === "awaiting_approval" ? "running_remote" : s)), []);
  const reject = useCallback(() => setState((s) => (s === "awaiting_approval" ? "failed" : s)), []);
  const reset = useCallback(() => {
    setState(initial);
    setElapsed(0);
  }, [initial]);

  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return { state, setState, elapsed, elapsedLabel, approve, reject, reset };
}
