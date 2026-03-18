# Agent Link Task Prompt

Use this prompt when we return to building the BYOA attachment layer.

---

Build the first **Link Agent** flow for Hashapp.

## Read first
- `PRODUCT.md`
- `docs/product/AGENT_LINK.md`
- `partner-tracks/VENICE.md`
- `partner-tracks/UNISWAP.md`

## Product rule
Hashapp is not a generic chat app and not a generic wallet shell.
Do **not** build chat-first.
Do **not** build an onchain registry unless there is a clear need.
Do **not** describe this as handing raw session keys to outside agents.

The goal is a clean BYOA linkage layer between:
- human wallet and approvals
- linked external agent identity
- structured request / proof flow

## Scope
Build the smallest useful v1:

### 1. Empty state + Link Agent UI
If no agent is linked, render an honest empty state:
- headline: `No Agent Connected`
- subtext: `Connect an agent to request payments, use private reasoning, and act within your spending rules.`
- primary CTA: `Connect Agent`

Then add a lightweight **Link Agent** flow that captures:
- agent name
- agent type / role
- execution identity / address or ENS
- optional endpoint / callback
- disclosure policy summary

### 2. Agent detail surface
Update the Agent page so a linked agent feels real in the product.
Show:
- linked execution identity
- agent type
- disclosure policy
- whether private reasoning is enabled
- `Edit Agent`
- `Disconnect Agent`

### 3. Structured request model
Add a first-pass request model in demo state / UI:
- `agentId`
- `intent`
- `payee`
- `amount`
- `token`
- `swapToPayAllowed`
- `reasonSummary`
- `privateReasoningUsed`

### 4. Activity + Receipt integration
Show at least one linked-agent request in:
- Activity
- Receipt

This should read like:
- who asked
- what they wanted
- why
- whether swap-to-pay was allowed
- whether private reasoning informed the action

## UX direction
### Good
- structured request cards
- intent summaries
- clean identity linkage
- product still feels like Hashapp

### Bad
- generic chat UI as the main surface
- giant “agent console” detour
- overbuilt protocol/API theatre before the UX is real

## Deliverable
Return exactly:
1. files changed
2. new data fields added
3. screenshots of:
   - Link Agent state
   - Agent page linked state
   - Activity item
   - Receipt view
4. commit hash
5. branch
6. pushed or not

## Success condition
A judge should understand in 10 seconds:
- this is BYOA
- the human links an outside agent
- the agent requests a bounded action
- Hashapp mediates and proves it

---
