# Venice

## Why it fits Hashapp
Venice fits Hashapp as an **optional private reasoning layer** behind spending decisions.

Hashapp’s core problem is not just letting agents spend. It is helping humans trust agent spending without exposing all of their context publicly.

Venice gives us a clean way to say:
- private cognition
- public consequence
- user-controlled privacy

## Product role
Venice is **not** the product.
Venice is a feature layer inside the product.

## Feature concept
### Private Review
A user-controlled feature toggle that lets Scout privately evaluate sensitive requests before acting.

When enabled, Venice can help reason about:
- new vendors
- recurring charges
- unusual amounts
- requests that do not match historical patterns
- sensitive purchase context

## User-facing behavior
### Off
Scout follows explicit rules only.

### On
Scout can use private reasoning for:
- new vendor evaluation
- recurring charge review
- unusual request escalation
- confidence-based ask / allow / block recommendations

## Best UI placement
Put **Private Review** inside:
- Rules screen
or
- Scout detail screen

## Suggested toggle copy
### Label
Private Review

### Description
Use private reasoning for new vendors, recurring charges, and unusual requests before Scout acts.

## Demo value
Venice creates a strong optional moment in the demo:
- Private Review off → rules only
- Private Review on → same request gets private evaluation and a more intelligent approval / escalation recommendation

## Track alignment
- Agents that keep secrets
- Agents that trust

## Rule
Do not let Venice take over the whole product story.
Hashapp remains the product; Venice is a trusted intelligence layer inside it.
