# DATA MODEL

## Principles
- human-readable first
- enforcement-aware
- one human can manage multiple agents
- every spend should map to both an intent and a receipt

## Core entities

### Human
Represents the owner/controller of one or more agents.

Fields:
- id
- walletAddress
- displayName
- basenameOrEns
- avatarUrl
- globalExposureLimit
- createdAt

### Agent
Represents a named, user-facing agent identity.

Fields:
- id
- humanId
- name
- avatarUrl
- basenameOrEns
- walletAddress
- role
- status (`active`, `paused`, `revoked`)
- currentPresetId
- budgetId
- sessionId
- createdAt

### Budget
Represents the spend boundary for one agent.

Fields:
- id
- agentId
- assetSymbol
- assetAddress
- totalAllocated
- availableAmount
- dailyLimit
- perTxLimit
- expiresAt

### PolicyPreset
Represents a user-facing rule bundle.

Fields:
- id
- humanId
- name
- description
- category (`manual`, `research`, `ops`, `trading`, etc.)
- escalationMode
- rules[]
- createdAt

### PolicyRule
Represents a plain-language rule with machine-usable enforcement hints.

Fields:
- id
- presetId
- label
- type (`maxSpend`, `dailyLimit`, `vendorAllowlist`, `approvalThreshold`, `expiry`, etc.)
- value
- enforcementLayer (`session`, `paymaster`, `app`)
- riskLevel (`low`, `medium`, `high`)

### Session
Represents the active scoped execution boundary for an agent.

Fields:
- id
- agentId
- executorAddress
- maxSpend
- approvedTargets[]
- approvedPayees[]
- expiresAt
- status (`active`, `expired`, `revoked`, `rotated`)
- createdAt

### Payee
Represents a trusted or known destination.

Fields:
- id
- humanId
- name
- type (`service`, `agent`, `merchant`, `protocol`)
- address
- basenameOrEns
- avatarUrl
- verified
- riskLabel
- notes

### PurchaseRequest
Represents an agent-initiated spend intent before execution.

Fields:
- id
- agentId
- payeeId
- amount
- assetSymbol
- reason
- requestedAction
- requestState (`pending`, `autoApproved`, `approved`, `denied`, `blocked`, `expired`)
- matchedRuleIds[]
- escalationType (`intraSession`, `policyShift`, `outOfBounds`)
- createdAt

### Receipt
Represents the human-readable result of a spend or blocked spend.

Fields:
- id
- purchaseRequestId
- agentId
- payeeId
- amount
- assetSymbol
- humanReadableSummary
- status (`approved`, `autoApproved`, `blocked`, `denied`, `failed`, `completed`)
- reason
- matchedRuleLabels[]
- txHash
- proofUrl
- createdAt

## Relationships
- One **Human** has many **Agents**
- One **Agent** has one active **Budget**
- One **Agent** has one active **Session**
- One **Agent** uses one active **PolicyPreset**
- One **PolicyPreset** has many **PolicyRules**
- One **Human** has many **Payees**
- One **Agent** creates many **PurchaseRequests**
- One **PurchaseRequest** resolves into one **Receipt**

## UX-critical derived states
These do not need to be first-class onchain objects but must be easy to compute in app:
- budget remaining
- trusted payee status
- matched vs violated rule summary
- pending approval count
- total fleet exposure
- session health

## Onchain vs offchain bias
### Onchain / wallet-level
- session limits
- spend caps
- actual execution
- durable permission boundaries

### Offchain
- agent names and avatars
- human-readable summaries
- trusted status labels
- activity feed grouping
- rule explanations
- reason strings
- derived dashboards
