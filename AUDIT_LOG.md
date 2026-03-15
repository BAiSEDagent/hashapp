# AUDIT LOG

Track review findings, corrections, and implementation follow-ups here.

---

## 2026-03-15 — Working product audit (product agent)

### Source
- Replit product agent full codebase audit

### Findings
- app was polished prototype with zero real internals
- all tx hashes were fabricated
- Basescan links were dead
- "rules enforced onchain" claim was false
- Grant Permission was pure React state
- wallet connection was decorative string
- dead CTAs throughout
- page state reset on refresh

### Severity
- Critical: fake tx hashes / dead proof links
- Critical: false onchain enforcement claim
- High: no wallet connection
- High: dead CTAs in trust product
- Medium: no persistence

### Action taken
- truth-pass patch applied:
  - fake tx hashes removed
  - proof links conditioned on real tx hash
  - "rules enforced onchain" claim removed
  - wagmi wallet connection added (Base Sepolia)
  - dead CTAs removed
  - localStorage persistence added
  - `approvePending(id, realTxHash?)` hook designed for real tx integration

### Status
Partially fixed — core trust signals are now honest; Grant Permission still demo-only

### Notes
Integration gap documented in `app/STATUS.md`.

---

## 2026-03-15 — Repo integration audit

### Source
- BAiSED manual review of `frontend/truth-pass` branch vs local build

### Findings
- Replit export branch was full Replit workspace, not a clean standalone app
- pnpm-workspace.yaml had Darwin-hostile binary overrides
- Vite config hard-required `PORT` and `BASE_PATH` env vars
- app could not build locally outside Replit environment

### Severity
- High: app not runnable outside Replit

### Action taken
- Darwin binary exclusions removed from pnpm-workspace.yaml
- Vite config normalized with sensible defaults
- app extracted to `app/` under main repo
- typecheck, build, gitleaks, pnpm audit all validated clean

### Status
Fixed — `integration/truth-pass-clean` typechecks and builds on macOS ARM

### Notes
Commit `52ab78f`. Proof scripts added in `proof/` in commit `a4637049`.

---

## Template

### Date
YYYY-MM-DD

### Source
- Replit Agent 4 / Gemini / JesseXBT / Opus / manual review / etc.

### Findings
- issue 1
- issue 2
- issue 3

### Severity
- High / Medium / Low

### Action taken
- what was changed

### Status
- Fixed / Partially fixed / Deferred / Rejected

### Notes
- extra context

---

## 2026-03-13 — Replit audit corrections

### Source
- Replit Agent 4 audit pass
- manual validation against Synthesis + ethskills context

### Findings
- settlement/proof line appeared on blocked or declined items
- tx hash external link had no real destination
- receipts lacked clear USDC labeling
- recurring charge framing was weaker than Base spend-permission language
- inconsistent amount formatting for recurring spend example
- audit incorrectly claimed ERC-8004 was fictional

### Severity
- High: settlement line on blocked/declined items
- High: dead external link
- Medium: no USDC labeling
- Medium: weak spend-permission framing
- Low: inconsistent amount formatting
- High (false finding): ERC-8004 claim was wrong and had to be explicitly rejected

### Action taken
- settlement/proof context made conditional on approved states with tx hashes only
- basescan tx links added
- USDC language added to proof and rule context
- recurring charge rule reframed around spend permissions
- amount formatting made consistent
- ERC-8004 identity kept intact

### Status
Fixed

### Notes
This was a good example of mixed audit quality: several useful corrections plus one major hallucinated standards claim. We should keep logging both valid findings and invalid reviewer claims.

---

## 2026-03-14 — Navigation and money-model review

### Source
- manual product review
- comparison against Cash App reference patterns

### Findings
- separate Trusted Destinations tab overlapped too much with Activity
- app lacked a true Money tab, weakening the financial-product grammar
- money representation risked sounding custodial without clearer connected-wallet language

### Severity
- High: missing Money tab / unclear product grammar
- Medium: duplicate payee/history surfaces
- High: custody ambiguity risk

### Action taken
- moved trusted destinations/search into Activity
- adopted Money / Activity / Scout / Rules top-level nav direction
- clarified non-custodial language around connected wallet and Scout allocation

### Status
Partially fixed / in progress through Replit iterations

### Notes
This was a key product-shape correction rather than a visual polish pass.

---

## 2026-03-14 — Base-native spend permission proof

### Source
- Replit technical agent
- Base Sepolia proof run

### Findings
- Base-native SpendPermissionManager can enforce spend cap, expiry, and spender identity without custom Solidity
- in-bounds spend succeeds onchain
- over-limit, expired, and wrong-spender cases all reject onchain with named errors
- payee restriction remains partially app-layer rather than contract-enforced

### Severity
- High positive finding: Track 1 proof is real
- Medium caveat: destination/payee enforcement is not fully onchain yet

### Action taken
- recorded tx hashes, revert names, proof output, and human-readable summary
- elevated Spend Permissions to a stronger Track 1 submission artifact

### Status
Verified

### Notes
This proof materially upgrades Hashapp from a credible product prototype to a product with a real technical spine.
