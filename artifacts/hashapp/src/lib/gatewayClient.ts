import { getAddress } from "viem";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

export interface GatewayMessage {
  id: string;
  from: "human" | "agent";
  content: string;
  type: "message" | "spend_request" | "info" | string;
  ts: number;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface GatewaySession {
  sessionToken: string;
  agentKey: string;
  agentName: string;
  walletAddress: string;
}

function storageKey(address?: string): string {
  if (!address) return "hashapp_gateway_session";
  try {
    return `hashapp_gateway_session_${getAddress(address)}`;
  } catch {
    return "hashapp_gateway_session";
  }
}

export function getSession(address?: string): GatewaySession | null {
  try {
    const raw = localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(
  session: GatewaySession,
  address?: string
): void {
  localStorage.setItem(storageKey(address), JSON.stringify(session));
}

export function clearSession(address?: string): void {
  localStorage.removeItem(storageKey(address));
}

export async function registerAgent(
  agentName: string,
  walletAddress: string
): Promise<GatewaySession> {
  const res = await fetch(`${API_BASE}/gateway/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentName, walletAddress }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Registration failed");
  }

  const data = await res.json();
  const session: GatewaySession = {
    sessionToken: data.sessionToken,
    agentKey: data.agentKey,
    agentName: data.agentName,
    walletAddress: data.walletAddress,
  };

  setSession(session, walletAddress);
  return session;
}

export async function pollInbound(since: number, sessionToken: string): Promise<{
  messages: GatewayMessage[];
  agentName?: string;
}> {
  if (!sessionToken) return { messages: [] };

  const res = await fetch(`${API_BASE}/gateway/inbound?since=${since}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function sendReply(content: string, sessionToken: string): Promise<void> {
  if (!sessionToken) throw new Error("No active gateway session");

  const res = await fetch(`${API_BASE}/gateway/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Reply failed");
  }
}

export async function checkStatus(sessionToken: string): Promise<boolean> {
  if (!sessionToken) return false;

  try {
    const res = await fetch(`${API_BASE}/gateway/status`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const data = await res.json();
    return data.connected === true;
  } catch {
    return false;
  }
}
