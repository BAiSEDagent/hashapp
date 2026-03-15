# REPLIT AGENT BRIEF — Identity + Truth Pass

## Goal
Make Hashapp demo-credible **today** by improving truth labeling on the Money page and adding a first-class linked agent identity model with profile photo upload.

This is not a redesign sprint.
This is a **truth + identity product pass**.

---

## Product intent
Hashapp should feel like:
- a human control layer for AI agent spending on Base
- with visible agent identity
- visible spend authority
- visible proof of what is real vs demo vs pending

Right now the product is close, but the Money page mixes:
- real onchain balance logic
- demo permission rows
- demo spend totals

That creates ambiguity.

We need to fix that today.

---

## Scope

### 1. Truth labeling system
Add clear provenance badges everywhere on the Money and Agent pages.

Allowed badge states:
- `Onchain`
- `Demo`
- `Pending`

### Requirements
- Every money/permission/receipt block must show one of these states
- Real onchain data must never be visually confused with demo data
- Demo aggregates must not visually outrank real balance state
- If wallet is disconnected, the page must explicitly explain what is real vs simulated

---

### 2. Linked agent identity
Introduce a single canonical linked agent model for the current demo.

## Agent model
Use a simple app-level agent object like:

```ts
export type LinkedAgent = {
  agentId: string
  name: string
  avatarUrl?: string
  status: 'active' | 'paused' | 'pending' | 'revoked'
  spenderAddress?: `0x${string}`
  permissionCount: number
  monthlyCapUsd?: number
  description?: string
}
```

### Requirements
- Show the linked agent identity clearly on the Agent page
- Show the agent name + avatar on the Money page where permissions are listed
- Show the spender address as implementation detail, not primary identity
- If no avatar exists, show initials fallback

---

### 3. Agent profile photo upload
Add a simple v1 profile image upload flow for the agent.

### v1 constraints
- one uploaded avatar per agent
- image file only
- square crop not required if too much work; center-cover display is acceptable
- local app persistence is fine for now (localStorage or current app demo state)
- no backend required in this pass
- no NFT / ENS / farcaster avatar integration in this pass

### Requirements
- user can upload or replace the agent avatar
- uploaded image appears on:
  - Agent page
  - Money permission rows
  - any existing visible agent summary component
- fallback to initials when no image is set

---

## Files likely involved
You do not have to use exactly these files if the structure differs, but prefer minimal changes.

- `artifacts/hashapp/src/pages/Money.tsx`
- `artifacts/hashapp/src/pages/Agent.tsx`
- `artifacts/hashapp/src/context/DemoContext.tsx`
- `artifacts/hashapp/src/components/*` (if a shared badge/card/avatar component is useful)

If a small shared component helps, add:
- `artifacts/hashapp/src/components/TruthBadge.tsx`
- `artifacts/hashapp/src/components/AgentAvatar.tsx`

---

## Product rules

### Money page
- Primary card = real spendable state
- If wallet disconnected, say that clearly
- Demo-only totals must be marked `Demo`
- Permission rows must show provenance badge
- Real permission rows should link to explorer / tx proof if already available
- If proof is not yet wired, mark as `Pending`, not `Onchain`

### Agent page
- Show a single canonical linked agent card
- Show:
  - avatar
  - name
  - status
  - spender address
  - permission count
  - current budget/cap summary
- Include profile photo upload control on this page

### Design direction
- dark, premium, simple
- feels like consumer finance for agents
- not a crypto dashboard
- no raw hex dominating the screen
- readable, calm hierarchy

---

## Explicitly do NOT do
- no backend image service
- no auth system work
- no contract changes
- no redesign of app navigation
- no massive refactor
- no fake explorer links
- no placeholder proof language that overclaims reality

---

## Acceptance criteria

### Truth pass
- [ ] Every money/permission block has `Onchain`, `Demo`, or `Pending`
- [ ] Wallet-disconnected state clearly explains what is real vs simulated
- [ ] Real balance card remains visually primary
- [ ] Demo spend totals no longer feel like canonical truth

### Linked agent
- [ ] Agent page shows one linked agent clearly
- [ ] Agent name and avatar appear on relevant money/permission UI
- [ ] Spender address is visible but secondary

### PFP upload
- [ ] User can upload agent avatar
- [ ] Avatar persists for demo usage
- [ ] Avatar appears on Agent page and Money page
- [ ] Initials fallback works if no avatar uploaded

### Engineering
- [ ] TypeScript clean
- [ ] App runs
- [ ] Minimal file churn

---

## Deliverable format
When done, return:
1. commit hash
2. files changed
3. what is now real vs demo vs pending
4. confirmation that avatar upload works
5. screenshot or route list to verify manually

---

## Priority order
1. Truth labeling
2. Linked agent identity
3. PFP upload

Ship all three in one pass if possible.
