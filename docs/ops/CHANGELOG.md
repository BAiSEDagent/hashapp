# CHANGELOG

## 2026-03-18 — canonical integration rescue

### Branch
- `audit/integrate-truth-pass-clean`

### Purpose
Create one clean integration branch on canonical `hashapp` that ports the real `frontend/truth-pass` product/server work without dragging along Replit repo noise, screenshot artifacts, pasted transcripts, or destructive doc deletions.

### Receipts
- `6acb4077` — `feat: port truth-pass hardening into canonical line`
- `7240e92b` — `fix: restore disconnect truth and agent naming`
- `26cd9cfd` — `fix: restore per-wallet identity and delegation errors`

### Included
- Venice integration layer
- wallet-gated app shell
- account sheet / wallet chip work
- disconnect returns to landing page
- per-wallet demo + agent restore
- explicit delegation error states
- agent-token naming alias (`AGENT_API_TOKEN` fallback to legacy `SCOUT_API_TOKEN`)

### Explicitly excluded
- `.agents/**`
- `attached_assets/**`
- pasted prompt files
- screenshot-only branch noise
- destructive deletions of canonical docs / proof / partner-track files

### Current branch truth
- Canonical working integration branch: `audit/integrate-truth-pass-clean`
- Replit workspace was moved onto this branch at commit `26cd9cfd`
- `main` remains untouched until verification is complete

### Next verification checkpoint
1. connected identity display
2. wallet disconnect → landing return
3. same-wallet reconnect restores agent state
4. Grant Delegation triggers wallet flow or explicit inline error

### Branch discipline note
The existence of multiple branches here is a temporary recovery artifact, not the desired steady state. After verification, merge the clean integration line intentionally and collapse branch sprawl.
