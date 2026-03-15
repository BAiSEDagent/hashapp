# DECISION LOG

Track meaningful product, UX, architecture, and scope decisions here.

---

## 2026-03-15 — Repo becomes the single source of truth

### Decision
Move from Replit-as-primary to repo-as-primary. Integrate the Replit truth-pass frontend under `app/`, integrate proof scripts under `proof/`, and drive all engineering from `integration/truth-pass-clean`.

### Why
The split-brain problem was creating confusion, risk of drift, and audit ambiguity. One repo with docs/app/proof in clearly separated directories gives every agent a single authoritative location to read from and write to.

### Alternatives considered
- keep Replit as primary and export manually each time
- keep three separate repos (docs, app, proof)

### Status
Active

### Notes
Branch roles documented in `BRANCH_GUIDE.md`. App status documented in `app/STATUS.md`. Proof artifacts documented in `proof/README.md`.

---

## 2026-03-15 — Replit role becomes scoped-only

### Decision
Replit is now a scoped execution surface only, not the driver. Narrow tasks only: UI pass → patch export → BAiSED applies to repo. No more full workspace dumps.

### Why
Full workspace dumps recreate split-brain and are harder to review/integrate than targeted patches.

### Alternatives considered
- Replit as primary with periodic syncs
- BAiSED exclusively, no Replit

### Status
Active

### Notes
Replit still has read access to the repo and can pull branches. It should return changed files as diffs, not exports.

---

## 2026-03-15 — Grant Permission wiring is the next real milestone

### Decision
Connect the app's Grant Permission button to the real `SpendPermissionManager.approve()` call via wagmi, then call `approvePending(id, realTxHash)` to surface a real Basescan link.

### Why
This is the single step that converts Hashapp from a polished prototype with external proof to a product where the UI and the proof are the same system.

### Alternatives considered
- skip to submission without connecting the UI
- build more UI features before wiring

### Status
Pending — next implementation task

### Notes
Hook points already exist: `approvePending(id, realTxHash?)` in DemoContext, wagmi + Base Sepolia already configured.
Contract: `0xf85210B21cC50302F477BA56686d2019dC9b67Ad`
Approval path: direct `approve()` call from the human wallet, not `approveWithSignature`.

---

## Template

### Date
YYYY-MM-DD

### Decision
What was decided

### Why
Why we chose it

### Alternatives considered
- option A
- option B

### Status
- Active / Revisit later / Rejected / Replaced

### Notes
Additional context

---

## 2026-03-13 — Hashapp name and product direction

### Decision
Use **Hashapp** as the working product name and define it as a consumer-grade spending app for AI agents.

### Why
It has more product energy than dry infrastructure names and supports the trust/receipt/proof narrative without sounding like generic middleware.

### Alternatives considered
- Scope
- Clerk
- Tab
- Allowance

### Status
Active

### Notes
Hashapp reads better as a product, while the repo `hashapp-design` remains the concept workspace.

---

## 2026-03-13 — Build broad, demo narrow

### Decision
Use agents to build broad product surface area, but keep the live demo centered on one tight story.

### Why
Implementation speed is abundant; clarity and emotional punch are scarce.

### Alternatives considered
- tiny build / tiny demo
- broad build / broad demo

### Status
Active

### Notes
This is now a core strategic principle for the project.

---

## 2026-03-13 — Research agent demo lane

### Decision
Use a **research agent** as the primary demo scenario, with Scout as the named example agent.

### Why
It is believable for the hackathon audience, fits agent tooling, and makes approvals/receipts legible.

### Alternatives considered
- travel assistant
- grocery assistant
- generic agent wallet demo

### Status
Active

### Notes
The activity feed is the hero of this demo.

---

## 2026-03-13 — Hybrid trust model

### Decision
Keep hard constraints near the wallet/session layer and dynamic trust logic offchain.

### Why
This gives real enforcement without turning the product into a slow or overcomplicated permissions console.

### Alternatives considered
- everything onchain
- everything offchain

### Status
Active

### Notes
Session keys and paymaster constraints are central to the product narrative.

---

## 2026-03-13 — Activity feed is the hero

### Decision
Center the product and demo on the activity feed rather than settings, rules, or architecture views.

### Why
Trust is made visible in the feed. That is the most emotionally legible surface.

### Alternatives considered
- rules-first demo
- money-first demo
- agent profile-first demo

### Status
Active

### Notes
Approvals are a feature. The feed is the product.

---

## 2026-03-13 — Money is non-custodial

### Decision
Hashapp should represent money as living in the user’s connected wallet / smart wallet, not inside Hashapp.

### Why
The app should manage permissions and allocations, not custody user funds.

### Alternatives considered
- custodial app balance
- app-held escrow as default product model

### Status
Active

### Notes
Preferred language: “Available for Scout”, “Allocated to Scout”, “Protected by your rules”.

---

## 2026-03-13 — Trusted Destinations merged into Activity

### Decision
Move trusted payee rail + search into Activity instead of keeping Trusted Destinations as a fully separate top-level history surface.

### Why
Cash App’s product grammar already merges contacts/search/history in Activity. Separate tabs created redundancy.

### Alternatives considered
- keep Trusted Destinations as separate top-level tab
- repurpose Trusted Destinations as a relationship management screen

### Status
Active

### Notes
Preferred top-level nav direction: Money, Activity, Scout, Rules.

---

## 2026-03-14 — Spend permissions become a first-class product object

### Decision
Treat spend permissions as an explicit product object rather than a hidden implementation detail.

### Why
This is the clearest way to strengthen Hashapp on Base’s “Agents that pay” track by making conditional spending and recurring permissions visible and legible.

### Alternatives considered
- keep recurring permissions implicit in rules only
- leave conditional payment as architecture story only

### Status
Active

### Notes
Best example: recurring DataStream Pro approval with vendor, amount, cadence, and revocable state.

---

## 2026-03-14 — ENS/Basenames support trust in Activity and search

### Decision
Use ENS/Basenames as a trust and readability layer for agents, trusted destinations, humans, and search results.

### Why
This improves the “Agents that trust” story and makes Activity/search/payees feel human-readable instead of crypto-native.

### Alternatives considered
- raw address display everywhere
- identity only in receipt/proof detail

### Status
Active

### Notes
Best surfaces: Activity trusted-destination rail, search, payee rows, Scout identity, receipt proof context.

---

## 2026-03-14 — Base-first product, MetaMask decision deferred to permission-plumbing evaluation

### Decision
Keep the product story Base-first while explicitly evaluating whether MetaMask’s Delegation Toolkit reduces enough plumbing work to justify using it for delegated permissions.

### Why
Base is still the strongest home chain and brand fit, but MetaMask may provide more packaged delegated-permission primitives.

### Alternatives considered
- Base all the way down
- MetaMask as full plumbing pivot
- Base-first product + MetaMask permission layer

### Status
Revisit soon

### Notes
Do not let the user-facing product become a confused multi-wallet showcase.

---

## 2026-03-14 — Default to fully Base-native permission plumbing unless a concrete blocker appears

### Decision
Default to a fully Base-native permission stack and only reopen MetaMask as the main plumbing path if a minimal Base session-key proof exposes a real blocker.

### Why
The strongest hackathon version is the most coherent one: Base-native product, Base-native trust story, Base-native permission plumbing.

### Alternatives considered
- immediate MetaMask pivot
- indefinite architecture debate
- mixed story without a forcing function

### Status
Active

### Notes
Next checkpoint: prove one thin Base-native scoped-session flow before revisiting the plumbing choice.

---

## 2026-03-14 — Onboarding becomes a first-class product problem

### Decision
Treat onboarding as a first-class product area instead of an afterthought.

### Why
Hashapp must teach trust, non-custody, scoped permissions, and revoke-ability clearly before the product feels safe.

### Alternatives considered
- no onboarding
- technical wallet-first setup flow
- rules-first onboarding

### Status
Active

### Notes
Onboarding should feel like a handshake, not a registration flow.

---

## 2026-03-14 — BYOA is the product truth; Scout is the starter/demo path

### Decision
Hashapp should support **Bring Your Own Agent (BYOA)** as the real product model, while using **Scout** as the default starter/demo path for first-run onboarding and fast activation.

### Why
This keeps the product honest and scalable without sacrificing clarity in the first-run experience.

### Alternatives considered
- Scout as the only product assumption
- BYOA only, with no starter path

### Status
Active

### Notes
Best onboarding shape now: Safety foundation → choose Scout or connect your own agent → set first boundary → review first request.

---

## 2026-03-14 — Base-native proof succeeded and materially upgraded Hashapp

### Decision
Treat the Base-native spend permission proof as a major product milestone and center Track 1 framing around it.

### Why
Hashapp now has real evidence that scoped spending permissions and onchain rejection of out-of-bounds behavior work on Base using existing audited primitives.

### Alternatives considered
- continue describing Track 1 purely at the UI/product layer
- rely on mock architecture claims without proof

### Status
Active

### Notes
Strong caveat remains: payee/destination restriction is still partially app-layer rather than fully contract-enforced.
