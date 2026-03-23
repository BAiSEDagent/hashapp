---
name: hashapp
description: "Use Hashapp as a human-controlled money surface for agents. Covers agent authentication, gateway messaging, structured decision requests, approval/denial handling, bounded-authority expectations, and truth-safe product framing. USE WHEN: connecting an external agent to Hashapp, sending spend/payment requests, polling for replies, or integrating agent workflows with human approval and onchain proof. DON'T USE WHEN: generic wallet tooling, generic chat apps, or speculative trading workflows detached from Hashapp's approval/proof model."
---

# Hashapp

## Purpose
This skill tells an external agent how to use **Hashapp** correctly.

Hashapp is not a generic wallet API and not a chat shell.
It is a **human-controlled money surface for agents**.

Use this skill when an agent needs to:
- authenticate with Hashapp
- send a message or request into the human approval surface
- poll for replies
- request a structured decision
- operate inside bounded authority instead of raw wallet control

## Core Product Truth
Hashapp is a **BYOA money app for agents**.

It is:
- the control layer
- the bounded-authority layer
- the receipt / provenance layer
- the human approval surface for agentic money actions

It is not:
- a generic wallet manager
- a generic trading terminal
- a generic AI chat product

## Current Public Surface
Canonical product domain:
- `https://hashapp.finance/`

Canonical repo:
- `https://github.com/BAiSEDagent/hashapp`

Current live deployment may vary by environment. Do not claim an endpoint is live unless verified.

## Integration Model
An external agent integrates with Hashapp through a **gateway**.

The intended loop is:
1. agent authenticates
2. agent sends a message or structured request
3. human reviews in Hashapp
4. human replies, approves, or denies
5. agent polls for the result
6. the outcome is tied back to receipts / proof when applicable

## Authentication
Hashapp gateway calls are authenticated with an **agent API key**.

Treat the agent key as a secret:
- do not print it in logs
- do not paste it into public channels
- do not store it in public repo files
- do not expose it in screenshots or demos

## Core Endpoints
### 1. Send a message into Hashapp
`POST /api/gateway/message`

Use when the agent needs to send:
- a request summary
- a clarification prompt
- a payment/spend explanation
- a status update for the human

### 2. Poll for replies
`GET /api/gateway/messages`

Use when the agent needs to:
- retrieve human replies
- retrieve the latest approval/denial context
- stay synchronized with the human approval loop

### 3. Request a structured decision
`POST /api/gateway/reason`

Use when the agent needs a machine-readable recommendation before acting.

This endpoint is for structured reasoning output such as:
- decision
- vendor
- amount
- rationale

## Agent Behavior Rules
### 1. Ask, don’t assume
Hashapp is built around **bounded authority**.
An agent should request action clearly instead of assuming full wallet control.

### 2. Prefer structured requests over vague chat
Good requests contain:
- what is being requested
- vendor / payee
- amount
- token
- why it matters
- whether swap-to-pay is needed
- whether private reasoning was involved

### 3. Treat human reply as part of the transaction context
A human reply is part of the control and audit surface.

### 4. Expect denial paths
Hashapp is designed to reject out-of-policy actions.
An agent must handle:
- approval
- denial
- clarification request
- retry after changed conditions

### 5. Never overclaim execution
Do not say an action is complete unless it is actually complete.
Differentiate clearly between:
- recommendation
- approval
- execution
- receipt / proof

## Approval / Denial Semantics
When a human or policy denies a request, the agent should treat the denial as first-class state.

Good denial handling:
- store the denial reason
- stop execution
- ask for clarification only if useful
- do not silently retry the same request forever

Good approval handling:
- proceed only within the approved scope
- surface the resulting receipt / proof if execution occurs
- preserve any transaction or receipt identifiers

## Truth-Safe Framing
When using Hashapp in demos, copy, or agent explanations:

### Safe framing
- “Hashapp is a human-controlled money surface for agents.”
- “Hashapp lets agents operate under bounded authority.”
- “Hashapp provides readable approvals, denials, receipts, and onchain proof where applicable.”

### Unsafe framing
- “Hashapp gives agents full wallet autonomy.”
- “Everything is enforced onchain” unless verified for the exact path
- “All surfaces are live” unless verified in the current deployment
- “Uniswap execution is proven” unless that path is actually tested in the live environment

## MetaMask / Venice / Uniswap Role
### MetaMask
MetaMask delegation is a core proof and bounded-authority layer.
Frame it as delegated authority with onchain enforcement.

### Venice
Venice is a **private reasoning layer** inside the product.
Do not frame it as a standalone app mode.

### Uniswap
Frame Uniswap as **Swap to Pay**.
Do not frame Hashapp as a generic trading product.

## Success Condition
A correct Hashapp integration means:
- the agent authenticates successfully
- the agent can send a request into the human surface
- the human can reply / approve / deny
- the agent can poll and receive the result
- the resulting action stays legible and bounded
- proof / receipts are preserved when execution happens

## Rule
Hashapp should make agent money movement **safer, more legible, and more accountable**.
If an integration makes it look like a blind-autonomy wallet, it is using the product wrong.
