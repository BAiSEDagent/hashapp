# Uniswap — Just-in-Time Settlement for Agents

## Why it fits Hashapp
Uniswap is not a generic add-on for Hashapp. It is the cleanest way to prove that an agent can convert value and settle a real payment onchain when the required payment asset does not already match the available asset.

## Product truth
Hashapp remains a BYOA money app:
- user wallet stays in control
- linked agents get bounded authority
- Hashapp is the control, proof, and receipt layer
- Uniswap is the conversion and settlement layer inside that flow

Do not frame this as a general-purpose swap terminal or a Scout-owned-wallet product.

## Winning thesis
**Any agent that pays needs to swap. Hashapp is that layer.**

More precise framing:
**Just-in-Time Settlement for Agents**

When a linked agent needs to pay in token B but approved value is available in token A, Hashapp can:
1. quote the route through Uniswap
2. convert just enough
3. settle the payment
4. show both proofs in the product

## Demo story
Best narrative for the track:
- an agent needs to pay in USDC
- available value is ETH or WETH
- Hashapp routes the conversion through Uniswap
- the swap lands onchain
- the payment lands onchain
- Activity and Receipt show swap proof plus payment proof

## UX rule
Do not let Uniswap become the homepage identity.

### Wrong direction
- giant generic swap widget as the hero surface
- DEX-like terminal UI that makes Hashapp look like a trading app

### Right direction
- `Scout Auto-Pay` or `Convert to Pay` as the primary surface
- swap framed as an infrastructure step inside the payment flow
- optional manual swap controls as a secondary surface only

## What judges should understand
Hashapp uses Uniswap as a cross-asset settlement layer for agentic payments.
That is stronger than “we added a swap box.”

## Requirements to satisfy the track
- real Uniswap API key from Developer Platform
- real swap transaction on testnet or mainnet
- open-source public GitHub repo with README
- no mocks / no fake routing
- clear architecture write-up for how the payment flow uses Uniswap

## Best implementation order
### Pass 1
- backend-only Scout-executed swap
- Base Sepolia
- CLASSIC route only
- one real tx hash

### Pass 2
- pair swap with payment in the same user-visible flow
- show both events in Activity / Receipt
- explain route, slippage, and settlement clearly

### Bonus depth if time allows
- Uniswap AI skills for routing/intent support
- stronger route transparency in Activity
- swap constraints in Rules
- better README / submission framing

## Rule
Do not include Uniswap just for logo value.
Make it visible in the live payment flow and subordinate it to the BYOA payment story.
