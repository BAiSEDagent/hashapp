# Hashapp Track 1 Demo Script

## One-line thesis
Hashapp lets humans scope what agents can spend, lets agents act within delegated authority, and proves both allowed and blocked outcomes onchain.

## Demo flow

### 1. Connect and show authority
- Open Hashapp
- Connect MetaMask on Base Sepolia
- Show the active delegated authority for DataStream Pro
- Point out the expiry badge and that authority stays active until expiry or removal

### 2. Show the control plane
- Go to **Activity**
- Highlight **Delegation Control**
- Highlight **Delegated Spend Tests**
- Explain that Activity is the canonical control surface; Money is summary and Receipt is proof

### 3. Run allowed spend
- Press **Run allowed spend**
- Narrate: the agent is attempting a spend that is within delegated scope
- Show the approved result appear in Activity
- Open the receipt and show the Base Sepolia tx proof

### 4. Run blocked spend
- Go back to Activity
- Press **Run blocked spend**
- Narrate: the agent is attempting a spend that exceeds delegated scope
- Show the blocked result appear in Activity
- Open the blocked receipt and show the truthful rejection language

### 5. Close with product meaning
- Humans define authority
- Agents can act within that scope
- Out-of-scope attempts are stopped and recorded
- Every important outcome is legible in Activity and Receipt

## Language to use
- "delegated authority"
- "allowed spend"
- "blocked spend"
- "blocked by delegated spend limit"
- "proved on Base Sepolia"

## Language to avoid
- "AI magic"
- "autonomous black box"
- "just trust the app"
- any claim that blocked spends have successful onchain settlement proof if they were rejected
