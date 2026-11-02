/** The six autonomy states a long-running agent task moves through. */
export type AgentState =
  | "planned"
  | "awaiting_approval"
  | "running_remote"
  | "healing"
  | "verified"
  | "failed";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface LogLine {
  level: LogLevel;
  text: string;
}

export interface AstDiffLine {
  sign: "+" | "-";
  text: string;
}

export const STATE_LABELS: Record<AgentState, string> = {
  planned: "Planned",
  awaiting_approval: "Awaiting approval",
  running_remote: "Running remote",
  healing: "Self-healing",
  verified: "Verified",
  failed: "Failed",
};
