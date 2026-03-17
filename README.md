# Hashapp

Hashapp is a BYOA money app for agents — a consumer-grade control, proof, and receipt layer for agentic spending.

## Purpose
This repo is for:
- product thinking
- architecture
- UX direction
- partner strategy
- scope decisions
- demo planning for Synthesis

This is **not** the build repo.

## Product Thesis
Hashapp lets humans link agents, set bounded authority, approve or auto-approve actions, and verify what those agents did through clear receipts and onchain proof.

## Product Positioning
Hashapp is not a generic wallet manager and not a generic swap app. It is the money app for AI agents — a consumer-grade interface for bounded authority, funding, approvals, monitoring, and proof.

## Core Problem
People can let agents spend money, but they still lack a simple, trustworthy interface to:
- set boundaries
- approve or deny purchases
- auto-approve safe ones
- inspect receipts afterward
- revoke access instantly

## Strategy
Build broad, demo narrow.

Use agents to build broad surface area quickly, but present a single crystal-clear story in the live demo.

## Current demo lane
Research agent.

## Product Shape
- Cash App-style UX
- mobile-first
- agent identity with avatars / ENS / Basenames
- trusted payees and services
- activity feed with readable receipts
- human control over autonomous spending

## Near-Term Goal
Design the strongest possible Synthesis submission and progressively connect the real app/proof work without losing product truth.

## Repo structure
- `/` — top-level product, proof, and execution docs
- `/docs/product` — product truth, policy, UX, flows, data model
- `/docs/proof` — what is actually proven and how the demo is framed
- `/docs/ops` — branch truth, execution notes, handoffs
- `/docs/strategy` — roadmap, backlog, partner strategy
- `/partner-tracks` — partner-specific framing and submission notes
- `/app` — integrated Replit app/workspace

This repo started docs-first. It now contains both the integrated app workspace under `app/` and a cleaner docs map so product, proof, and implementation can move together without making the top level feel like a scratchpad.

## Current branch guidance
Read `BRANCH_GUIDE.md` before assuming where active app work lives.
