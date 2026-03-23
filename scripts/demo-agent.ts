/**
 * Hashapp demo agent
 *
 * Full Venice track loop:
 * private context → Venice private reasoning →
 * structured spend request → human approval →
 * onchain execution → receipt with Venice attribution
 *
 * Run:
 *   AGENT_API_KEY=hk_xxx \
 *   HASHAPP_URL=https://hashapp-prototype.replit.app \
 *   pnpm tsx scripts/demo-agent.ts
 */

const HASHAPP_URL =
  process.env.HASHAPP_URL ?? "https://hashapp-prototype.replit.app";
const AGENT_KEY = process.env.AGENT_API_KEY;

if (!AGENT_KEY) {
  console.error("AGENT_API_KEY required");
  process.exit(1);
}

const PRIVATE_CONTEXT = `
Wallet state: 60 USDC available
Daily cap: $89, spent today: $0
Active delegation: 6 days 23 hours remaining
Vendor: DataStream Pro
Price: $5.00/session
Last purchase: 2 days ago
Last report quality: high — critical market signals present
Internal note: today analysis window opens in 30 minutes
Risk flag: none — vendor is on approved list
`;

interface ReasonResult {
  decision: "approve" | "deny";
  vendor: string;
  amount: number;
  reason: string;
}

async function reason(question: string): Promise<ReasonResult> {
  console.log("\nAgent: calling Venice private reasoning...");

  const res = await fetch(`${HASHAPP_URL}/api/gateway/reason`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGENT_KEY}`,
    },
    body: JSON.stringify({
      context: PRIVATE_CONTEXT,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Reasoning failed: ${err.error ?? res.status}`);
  }

  return res.json();
}

async function sendSpendRequest(result: ReasonResult): Promise<void> {
  const res = await fetch(`${HASHAPP_URL}/api/gateway/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGENT_KEY}`,
    },
    body: JSON.stringify({
      type: "spend_request",
      content: result.reason,
      metadata: {
        vendor: result.vendor,
        amount: result.amount,
        veniceReasoned: true,
      },
    }),
  });

  if (!res.ok) throw new Error("Failed to send spend request");
}

async function pollForApproval(
  timeoutMs = 180000
): Promise<"approved" | "denied" | "timeout"> {
  const deadline = Date.now() + timeoutMs;
  let since = 0;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));

    const res = await fetch(
      `${HASHAPP_URL}/api/gateway/messages?since=${since}`,
      { headers: { Authorization: `Bearer ${AGENT_KEY}` } }
    );

    if (!res.ok) continue;

    const { messages } = (await res.json()) as {
      messages: Array<{ content: string; ts: number }>;
    };

    for (const m of messages) {
      const lower = m.content.toLowerCase();
      if (lower.includes("approved")) return "approved";
      if (lower.includes("denied")) return "denied";
      since = Math.max(since, m.ts);
    }
  }

  return "timeout";
}

async function main() {
  console.log("=== Hashapp Demo Agent ===");
  console.log("Venice private reasoning → trusted public action\n");

  const result = await reason(
    "Should I request a DataStream Pro session now? " +
    "Evaluate cost, timing, and risk."
  );

  console.log(`Venice decision: ${result.decision.toUpperCase()}`);
  console.log(`Vendor: ${result.vendor}`);
  console.log(`Amount: $${result.amount}`);
  console.log(`Reason: ${result.reason}`);

  if (result.decision === "deny") {
    console.log("\nAgent: Venice recommended deny — no request sent");
    return;
  }

  console.log(
    "\nAgent: sending spend request to human via Hashapp gateway..."
  );
  await sendSpendRequest(result);
  console.log("Agent: request delivered — waiting for human approval...");

  const outcome = await pollForApproval();

  if (outcome === "approved") {
    console.log("\nAgent: approved — onchain execution triggered by human");
    console.log(
      "Agent: receipt will show Venice attribution on Base Sepolia"
    );
  } else if (outcome === "denied") {
    console.log("\nAgent: human denied the request");
  } else {
    console.log("\nAgent: no response within 3 minutes");
  }
}

main().catch((e) => {
  console.error("Agent error:", e.message);
  process.exit(1);
});
