# POLICY MODEL

## Product goal
Hashapp should let humans control agent spending without forcing them to think in low-level wallet permissions all day.

The user-facing abstraction is a **policy preset**.
The enforcement abstraction is a **scoped session**.

## Core split
### Static policy
Static policy should live closer to the wallet / session / paymaster layer.

Examples:
- expiry window
- max spend ceiling
- allowed executor
- stable payee allowlist
- call target allowlist

### Dynamic policy
Dynamic policy should live in the app layer.

Examples:
- trusted status
- auto-approve behavior
- contextual checks
- receipt logic
- human-readable policy edits
- escalation rules

## Escalation model
Hashapp should use a three-tier escalation model.

### Tier 1 — Intra-session
Use silent execution when the request is already inside the active session boundary.

Examples:
- approved payee
- amount within cap
- valid expiry window
- no contextual mismatch

User experience:
- no prompt
- receipt appears after

### Tier 2 — Policy shift (low risk)
Use a quick prompt when the request is close to current scope but needs a lightweight update.

Examples:
- extend expiry by a few days
- widen a low-risk cap slightly
- approve a related payee under same vendor umbrella

User experience:
- lightweight confirmation
- app proposes updated scope
- agent continues under refreshed permissions

### Tier 3 — Out-of-bounds (high risk)
Use full re-auth when a hard boundary changes materially.

Triggers:
- major spend ceiling changes
- new payee or destination class
- new action / call target
- role changes
- major approval-mode change

User experience:
- explicit new permission set
- strong confirmation
- likely biometric or wallet-level signature in production

## Preset model
Users should not think in terms of rebuilding session keys.
They should think in terms of policy presets or personas.

Example personas:
- Manual only
- Trusted vendors only
- Intern
- Researcher
- Trading mode
- Ops mode
- High-risk / always confirm

Each preset maps to:
- one app-layer policy bundle
- one or more static session constraints
- one escalation strategy

## Human mental model
- I choose what kind of freedom this agent has.
- The app handles the details.
- If the request is normal, it flows.
- If it is slightly outside the norm, I get a quick prompt.
- If it is materially risky, I explicitly re-authorize.

## Fleet model
Hashapp should support one human controlling multiple agents.

Each agent has:
- its own preset
- its own session
- its own budget
- its own payee set
- its own activity stream

The human gets:
- per-agent control
- global exposure overview
- cross-agent activity
- unified revoke / pause controls
