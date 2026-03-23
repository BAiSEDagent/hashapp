import { Router } from "express";
import crypto from "crypto";

const router = Router();

const agents = new Map<string, {
  agentKey: string;
  agentName: string;
  walletAddress: string;
  sessionToken: string;
  createdAt: number;
}>();

const messages = new Map<string, Array<{
  id: string;
  from: "human" | "agent";
  content: string;
  type: "message" | "spend_request" | "info";
  ts: number;
  read: boolean;
  metadata?: Record<string, unknown>;
}>>();

const sessions = new Map<string, string>();

function requireAgentAuth(req: any, res: any): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing agent API key" });
    return null;
  }
  const key = auth.slice(7);
  if (!agents.has(key)) {
    res.status(401).json({ error: "Invalid agent API key" });
    return null;
  }
  return key;
}

function requireSessionAuth(req: any, res: any): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing session token" });
    return null;
  }
  const token = auth.slice(7);
  const agentKey = sessions.get(token);
  if (!agentKey) {
    res.status(401).json({ error: "Invalid session token" });
    return null;
  }
  return agentKey;
}

router.post("/register", (req, res) => {
  const { agentName, walletAddress } = req.body as {
    agentName?: string;
    walletAddress?: string;
  };

  if (!agentName || !walletAddress) {
    return res.status(400).json({ error: "agentName and walletAddress required" });
  }

  const agentKey = `hk_${crypto.randomBytes(32).toString("hex")}`;
  const sessionToken = `hs_${crypto.randomBytes(32).toString("hex")}`;

  agents.set(agentKey, {
    agentKey,
    agentName,
    walletAddress,
    sessionToken,
    createdAt: Date.now(),
  });

  messages.set(agentKey, []);
  sessions.set(sessionToken, agentKey);

  return res.json({ agentKey, sessionToken, agentName, walletAddress });
});

router.post("/message", (req, res) => {
  const agentKey = requireAgentAuth(req, res);
  if (!agentKey) return;

  const { content, type = "message", metadata } = req.body as {
    content?: string;
    type?: string;
    metadata?: Record<string, unknown>;
  };

  if (!content || typeof content !== "string" || content.length > 4000) {
    return res.status(400).json({ error: "content required, max 4000 chars" });
  }

  const queue = messages.get(agentKey) ?? [];
  const msg = {
    id: crypto.randomUUID(),
    from: "agent" as const,
    content,
    type: (type as any) || "message",
    ts: Date.now(),
    read: false,
    metadata,
  };
  queue.push(msg);
  messages.set(agentKey, queue);

  return res.json({ id: msg.id, ts: msg.ts });
});

router.get("/messages", (req, res) => {
  const agentKey = requireAgentAuth(req, res);
  if (!agentKey) return;

  const since = Number(req.query.since) || 0;
  const queue = messages.get(agentKey) ?? [];
  const humanMessages = queue.filter(
    (m) => m.from === "human" && m.ts > since
  );

  return res.json({ messages: humanMessages });
});

router.get("/inbound", (req, res) => {
  const agentKey = requireSessionAuth(req, res);
  if (!agentKey) return;

  const since = Number(req.query.since) || 0;
  const queue = messages.get(agentKey) ?? [];
  const agentMessages = queue.filter(
    (m) => m.from === "agent" && m.ts > since
  );

  agentMessages.forEach((m) => { m.read = true; });

  const agent = agents.get(agentKey);
  return res.json({
    messages: agentMessages,
    agentName: agent?.agentName,
    agentWallet: agent?.walletAddress,
  });
});

router.post("/reply", (req, res) => {
  const agentKey = requireSessionAuth(req, res);
  if (!agentKey) return;

  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || content.length > 4000) {
    return res.status(400).json({ error: "content required, max 4000 chars" });
  }

  const queue = messages.get(agentKey) ?? [];
  const msg = {
    id: crypto.randomUUID(),
    from: "human" as const,
    content,
    type: "message" as const,
    ts: Date.now(),
    read: false,
  };
  queue.push(msg);
  messages.set(agentKey, queue);

  return res.json({ id: msg.id, ts: msg.ts });
});

router.post("/reason", async (req, res) => {
  const agentKey = requireAgentAuth(req, res);
  if (!agentKey) return;

  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "VENICE_API_KEY not configured" });
  }

  const { messages: msgs, system, context } = req.body as {
    messages?: Array<{ role: string; content: string }>;
    system?: string;
    context?: string;
  };

  if (!msgs || !Array.isArray(msgs) || msgs.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  if (msgs.length > 50) {
    return res.status(400).json({ error: "max 50 messages" });
  }

  const agent = agents.get(agentKey);

  const systemPrompt = system ||
    `You are ${agent?.agentName ?? "a research agent"} with delegated USDC spending authority on Base Sepolia.

You reason over private context and output ONLY valid JSON in this exact shape:
{
  "decision": "approve" | "deny",
  "vendor": "string",
  "amount": number,
  "reason": "string (max 60 words, plain English)"
}

No explanation outside the JSON. No markdown. Just the JSON object.`;

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...(context
      ? [{ role: "user", content: `Private context:\n${context}` }]
      : []),
    ...msgs,
  ];

  try {
    const veniceRes = await fetch(
      "https://api.venice.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          stream: false,
          max_tokens: 200,
          messages: fullMessages,
          venice_parameters: {
            include_venice_system_prompt: false,
            enable_web_search: "off",
          },
        }),
      }
    );

    if (!veniceRes.ok) {
      return res.status(502).json({
        error: "Venice unavailable",
        status: veniceRes.status,
      });
    }

    const data = await veniceRes.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (!["approve", "deny"].includes(parsed.decision)) {
        throw new Error("Invalid decision value");
      }

      return res.json({
        decision: parsed.decision,
        vendor: String(parsed.vendor ?? ""),
        amount: Number(parsed.amount ?? 0),
        reason: String(parsed.reason ?? ""),
        raw,
      });
    } catch {
      return res.status(422).json({
        error: "Venice returned unparseable response",
        raw,
      });
    }
  } catch {
    return res.status(502).json({ error: "Venice unavailable" });
  }
});

router.get("/status", (req, res) => {
  const auth = req.headers.authorization?.slice(7);
  if (!auth) return res.status(401).json({ error: "No token" });

  if (agents.has(auth)) {
    const agent = agents.get(auth)!;
    return res.json({
      connected: true,
      role: "agent",
      agentName: agent.agentName,
      walletAddress: agent.walletAddress,
    });
  }

  const agentKey = sessions.get(auth);
  if (agentKey) {
    const agent = agents.get(agentKey)!;
    return res.json({
      connected: true,
      role: "human",
      agentName: agent.agentName,
      walletAddress: agent.walletAddress,
    });
  }

  return res.status(401).json({ connected: false });
});

export default router;
