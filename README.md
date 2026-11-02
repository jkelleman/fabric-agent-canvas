# fabric-agent-canvas

[![CI](https://github.com/jkelleman/fabric-agent-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/jkelleman/fabric-agent-canvas/actions/workflows/ci.yml)

React 19 + TypeScript components for **human-in-the-loop agent interfaces**: the
moment a developer hands a long-running task from a local terminal to a cloud
lakehouse agent, and needs to see, approve, and audit what happens next.

**[See it live →](https://aiwithjen.com/work/project-osmos#canvas-mockup)** in the Project Osmos case study.

## Components

| Export | What it does |
| --- | --- |
| `<AgentStateIndicator>` | Lifecycle rail across six autonomy states: `planned`, `awaiting_approval`, `running_remote`, `healing`, `verified`, `failed`. Spins while remote work is active. |
| `<GuardrailGateCard>` | Pre-flight review card that holds a destructive action (e.g. `OVERWRITE`) until a person approves or rejects it. |
| `<RecoveryTelemetryBanner>` | Surfaces a self-healing event with an expandable in-memory AST diff drawer. |
| `<FabricAgentTaskCenter>` | The full canvas composed from the pieces above: decoupled-CLI indicator, elapsed timer, CU budget meter, live log, and sync hint. |
| `useAgentRun()` | Small client-side state machine with `approve`, `reject`, `reset`, and an elapsed timer that only ticks while the job runs. Optional `simulate` mode for demos. |

## Usage

```bash
npm install github:jkelleman/fabric-agent-canvas react lucide-react
```

```tsx
"use client";
import { FabricAgentTaskCenter } from "fabric-agent-canvas";

export default function Demo() {
  return <FabricAgentTaskCenter taskName="orders_daily backfill" simulate />;
}
```

Compose your own canvas from the primitives:

```tsx
import { AgentStateIndicator, GuardrailGateCard, useAgentRun } from "fabric-agent-canvas";

function DeployGate() {
  const run = useAgentRun({ requiresApproval: true });
  return (
    <>
      <AgentStateIndicator state={run.state} />
      {run.state === "awaiting_approval" && (
        <GuardrailGateCard detail="Drop partition event_date=2026-10-31" onApprove={run.approve} onReject={run.reject} />
      )}
    </>
  );
}
```

### Styling

Components use [Tailwind CSS](https://tailwindcss.com) utility classes with a
dark slate palette. Add the package to Tailwind's content sources so the classes
are generated, e.g. in Tailwind v4:

```css
@import "tailwindcss";
@source "../node_modules/fabric-agent-canvas/dist";
```

## Design principles

- **State is never opaque.** Users can always see which phase the agent is in and whether the terminal is still attached.
- **Destructive actions need a person.** The guardrail gate is a component, not an afterthought.
- **Recovery is inspectable.** Self-healing shows the exact patch it applied, not just "fixed".
- **Cost is visible.** Capacity Unit consumption is surfaced alongside progress.

## Development

```bash
npm install
npm run typecheck
npm run build      # emits ESM + type declarations to dist/
```

## License

MIT © 2026 Jen Kelleman
