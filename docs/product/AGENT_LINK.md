# Agent Link

## Purpose
Define the first clean BYOA attachment model for Hashapp.

Hashapp should not collapse into either:
- a generic wallet app
- a generic chat app
- an agent-controlled wallet shell

The missing layer is **agent linkage**.

## Core product truth
Hashapp has three layers:
1. **Human wallet connection** — source of funds, approvals, delegated authority
2. **Agent identity linkage** — the human links an outside agent to Hashapp
3. **Agent action surface** — the linked agent can request payments, permissions, swap-to-pay, and later Venice-backed actions

## What “Link Agent” means
A linked agent should be represented by:
- agent name
- agent type (research / ops / trading / execution)
- avatar
- execution identity (session address / spender address / agent wallet)
- optional external endpoint or callback URL
- optional ENS / basename / ERC-8004 identity later
- disclosure policy
- permissions / budgets

## Product stance
### Not this
- “install agent into Hashapp”
- hand the outside agent a raw execution key
- make chat the default product model
- pretend this needs onchain registry / Solidity on day one

### Yes to this
- a simple **Link Agent** flow
- a structured request layer
- human-readable intent summaries
- bounded authority and readable proof

## Best v1 model
### Link Agent flow
1. Human connects wallet
2. Human taps **Link Agent**
3. Human enters or selects:
   - agent name
   - agent execution address
   - agent type
   - optional endpoint
4. Hashapp shows the linked agent on the Agent page
5. The linked agent can now issue structured requests into Hashapp

## Agent request surface
The first request surface should be structured, not chat-first.

Recommended request shape:
- `agentId`
- `intent`
- `payee`
- `amount`
- `token`
- `swapToPayAllowed`
- `reasonSummary`
- `privateReasoningUsed` (boolean)

## Why not chat first
A full chat UI too early turns Hashapp into:
- another AI chat shell
- a wallet with messages bolted on

Hashapp is stronger as:
- control plane
- permission layer
- proof layer

Chat or threaded messaging can come later if it improves oversight.

## Best v1 UI surfaces
### Agent page
- Add **Link Agent** / **Edit Link** state
- Show linked execution identity
- Show agent type and disclosure policy

### Activity
- Show requests as human-readable intent cards
- Example: “OpenClaw wants to settle cloud compute for research task #402”

### Receipt
- Show:
  - requested by
  - reason summary
  - whether private reasoning informed the action

## Relationship to Venice
Venice is not the linking model.
Venice is the private cognition layer a linked agent may use.

Hashapp remains the human-controlled disclosure and payment layer.

## Relationship to Uniswap
A linked agent may request:
- direct payment
- or **Swap to Pay** if token conversion is needed

That should appear as a structured request, not an unbounded trade surface.

## Recommended naming
- **Link Agent** — user-facing attachment action
- **Linked Agent** — state once attached
- **Request** / **Intent** — structured action from agent to human
- **Swap to Pay** — optional settlement path when token mismatch exists

## v1 success condition
A user can:
1. connect wallet
2. link an external agent
3. see that agent request a payment with a reason summary
4. approve / auto-approve under policy
5. get a clean receipt and proof
