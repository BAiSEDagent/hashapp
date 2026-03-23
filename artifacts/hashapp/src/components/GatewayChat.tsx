import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useAccount } from "wagmi";
import {
  getSession,
  setSession as setSessionStore,
  registerAgent,
  pollInbound,
  sendReply,
  clearSession,
  type GatewayMessage,
  type GatewaySession,
} from "@/lib/gatewayClient";
import { useDemo } from "@/context/DemoContext";
import { AgentAvatar } from "@/components/AgentAvatar";
import { executeDelegationSpend } from "@/lib/delegationSpend";
import { AGENT_SESSION_ADDRESS } from "@/config/delegation";

const VENICE_BADGE_STYLE = {
  background: "rgba(100,80,255,0.12)",
  border: "0.5px solid rgba(100,80,255,0.28)",
  color: "#AFA9EC",
} as const;

const UNREAD_DOT = "#7F77DD";
const POLL_INTERVAL = 3000;

function VeniceBadge({ label }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider shrink-0"
      style={VENICE_BADGE_STYLE}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: UNREAD_DOT }} />
      {label ?? "Venice"}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="p-1 rounded hover:bg-white/[0.08] transition-colors"
    >
      {copied
        ? <Check size={12} className="text-green-400" />
        : <Copy size={12} className="text-muted-foreground/40" />
      }
    </button>
  );
}

function SpendRequestCard({
  message,
  agentName,
  onApprove,
  onDeny,
}: {
  message: GatewayMessage;
  agentName: string;
  onApprove: (vendor: string, amount: number, messageId: string) => Promise<void>;
  onDeny: (messageId: string) => Promise<void>;
}) {
  const vendor = String(message.metadata?.vendor ?? "Unknown vendor");
  const amount = Number(message.metadata?.amount ?? 0);
  const [acted, setActed] = useState<"approved" | "denied" | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full">
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: "rgba(100,80,255,0.06)",
          borderColor: "rgba(100,80,255,0.2)",
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: "rgba(100,80,255,0.15)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: UNREAD_DOT }}
          />
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "#AFA9EC" }}
          >
            Venice · Private reasoning
          </span>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">
                Spend request
              </p>
              <p className="text-[15px] font-semibold text-foreground">
                {vendor}
              </p>
            </div>
            <p className="text-[20px] font-bold text-foreground">
              ${amount.toFixed(2)}
            </p>
          </div>

          <p className="text-[12px] text-muted-foreground/60 leading-relaxed mb-3">
            {message.content}
          </p>

          {acted ? (
            <div
              className={`text-center py-2 rounded-xl text-[12px] font-semibold ${
                acted === "approved"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {acted === "approved" ? "Approved" : "Denied"}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await onDeny(message.id);
                  setActed("denied");
                  setLoading(false);
                }}
                className="py-2.5 rounded-xl text-[12px] font-semibold text-muted-foreground/60 bg-white/[0.05] hover:bg-white/[0.09] transition-colors disabled:opacity-40"
              >
                Deny
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onApprove(vendor, amount, message.id);
                    setActed("approved");
                  } catch {
                    setActed("denied");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="py-2.5 rounded-xl text-[12px] font-semibold text-white bg-primary/80 hover:bg-primary transition-colors disabled:opacity-40"
              >
                {loading ? "Executing..." : "Approve →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiKeyPanel({
  session,
  onDismiss,
}: {
  session: GatewaySession;
  onDismiss: () => void;
}) {
  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="text-[13px] font-semibold text-foreground mb-1">
          Gateway active
        </p>
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
          Give this API key to your agent. It uses this to send
          messages and reason privately via Venice.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
          Agent API key
        </label>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
          <code className="flex-1 text-[11px] text-primary/80 font-mono truncate">
            {session.agentKey}
          </code>
          <CopyButton text={session.agentKey} />
        </div>
        <p className="text-[10px] text-muted-foreground/25">
          Keep this secret. Anyone with this key can send messages
          as your agent.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
          Gateway endpoints
        </label>
        <div className="space-y-1">
          {[
            "POST /api/gateway/message",
            "POST /api/gateway/reason",
            "GET  /api/gateway/messages",
          ].map((ep) => (
            <div
              key={ep}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2"
            >
              <code className="flex-1 text-[10px] text-muted-foreground/50 font-mono">
                {ep}
              </code>
              <CopyButton text={ep} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-foreground/60 bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
      >
        Open chat
      </button>
    </div>
  );
}

export function GatewayChat() {
  const {
    spendPermissions,
    activeThreadId,
    recordDelegationSpend,
    connectedAgent,
  } = useDemo();

  const { address } = useAccount();

  const [session, setSession_] = useState<GatewaySession | null>(
    () => getSession(address)
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<GatewayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastPollTs, setLastPollTs] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!expanded || session || !connectedAgent) return;
    registerAgent(
      connectedAgent.name,
      address ?? ""
    )
      .then((s) => {
        setSession_(s);
        setSessionStore(s, address);
        setShowApiKey(true);
      })
      .catch(() => {});
  }, [expanded, session, connectedAgent, address]);

  const poll = useCallback(async () => {
    if (!session) return;
    try {
      const { messages: incoming } = await pollInbound(lastPollTs, session.sessionToken);
      if (incoming.length > 0) {
        setMessages((prev) => [...prev, ...incoming]);
        setLastPollTs(incoming[incoming.length - 1].ts);
        if (!expanded) setHasUnread(true);
      }
    } catch {
      // silent
    }
  }, [session, lastPollTs, expanded]);

  useEffect(() => {
    if (!session) return;
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, poll]);

  useEffect(() => {
    if (expanded) setHasUnread(false);
  }, [expanded]);

  const handleApproveSpend = useCallback(
    async (vendor: string, amount: number, _messageId: string) => {
      const perm = spendPermissions.find(
        (p) =>
          p.vendor.toLowerCase() === vendor.toLowerCase() &&
          p.state === "active" &&
          p.permissionsContext !== undefined &&
          p.delegationManager !== undefined &&
          p.spendToken !== undefined
      );

      if (!perm || !perm.permissionsContext || !perm.delegationManager || !perm.spendToken) {
        await sendReply(
          `Denied: no active delegation permission found for ${vendor}`,
          session?.sessionToken ?? ""
        );
        throw new Error(`No active delegation permission for ${vendor}`);
      }

      try {
        const result = await executeDelegationSpend({
          permissionsContext: perm.permissionsContext,
          delegationManager: perm.delegationManager,
          amountUsdc: amount,
          recipient: AGENT_SESSION_ADDRESS,
          spendToken: perm.spendToken,
        });

        if (!result.txHash) {
          await sendReply(
            `Denied: execution returned no transaction hash`,
            session?.sessionToken ?? ""
          );
          throw new Error("Execution returned no transaction hash");
        }

        const txHash = result.txHash as `0x${string}`;

        recordDelegationSpend(
          perm.id,
          amount,
          txHash,
          activeThreadId ?? undefined,
          true
        );

        await sendReply(
          `Approved: ${vendor} $${amount.toFixed(2)} — tx ${txHash}`,
          session?.sessionToken ?? ""
        );
      } catch (e: any) {
        if (!e.message?.includes("No active delegation") && !e.message?.includes("no transaction hash")) {
          await sendReply(`Denied: ${e.message}`, session?.sessionToken ?? "");
        }
        throw e;
      }
    },
    [spendPermissions, activeThreadId, recordDelegationSpend, session]
  );

  const handleDenySpend = useCallback(async (_messageId: string) => {
    await sendReply("Denied", session?.sessionToken ?? "");
  }, [session]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);

    const localMsg: GatewayMessage = {
      id: crypto.randomUUID(),
      from: "human",
      content,
      type: "message",
      ts: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, localMsg]);

    try {
      await sendReply(content, session?.sessionToken ?? "");
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="bg-card rounded-2xl border border-border/30 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 p-5">
          <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider flex-1">
            {session
              ? `Chat · ${session.agentName}`
              : connectedAgent
              ? `Chat · ${connectedAgent.name}`
              : "Connect agent to enable chat"}
          </span>
          {hasUnread && (
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{ background: UNREAD_DOT }}
            />
          )}
          {session && (
            <>
              <span className="text-[10px] text-muted-foreground/30">
                Private reasoning
              </span>
              <VeniceBadge />
            </>
          )}
          <ChevronDown size={14} className="text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  if (!connectedAgent) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
        <div
          onClick={() => setExpanded(false)}
          className="flex items-center gap-3 p-5 cursor-pointer hover:bg-white/[0.02] border-b border-white/[0.04]"
        >
          <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider flex-1">
            No agent connected
          </span>
          <ChevronUp size={14} className="text-muted-foreground/30" />
        </div>
        <div className="p-5 text-center">
          <p className="text-[12px] text-muted-foreground/40 leading-relaxed">
            Connect an agent from the Agent tab to enable the
            gateway chat.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/[0.04]">
          <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider flex-1">
            Setting up gateway…
          </span>
          <VeniceBadge />
        </div>
        <div className="p-5 text-center">
          <p className="text-[11px] text-muted-foreground/30">
            Connecting {connectedAgent.name}…
          </p>
        </div>
      </div>
    );
  }

  if (showApiKey) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/[0.04]">
          <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider flex-1">
            {session.agentName}
          </span>
          <VeniceBadge />
        </div>
        <ApiKeyPanel
          session={session}
          onDismiss={() => setShowApiKey(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-2xl border border-border/30 overflow-hidden flex flex-col"
      style={{ maxHeight: 460 }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] shrink-0">
        <button
          onClick={() => setExpanded(false)}
          className="p-1 -ml-1 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft size={16} className="text-muted-foreground/50" />
        </button>
        <AgentAvatar size="sm" />
        <span className="text-[13px] font-semibold text-foreground flex-1 truncate">
          {session.agentName}
        </span>
        <VeniceBadge />
        <button
          onClick={() => setShowApiKey(true)}
          className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors px-2"
        >
          API key
        </button>
        <button
          onClick={() => {
            clearSession(address);
            setSession_(null);
            setMessages([]);
            setShowApiKey(false);
            setExpanded(false);
          }}
          className="text-[10px] text-red-400/40 hover:text-red-400/70 transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-[11px] text-muted-foreground/30 text-center py-4">
            Waiting for {session.agentName} to send a message…
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${
              m.from === "human" ? "justify-end" : "justify-start"
            }`}
          >
            {m.from === "agent" && m.type !== "spend_request" && (
              <AgentAvatar size="sm" />
            )}

            {m.from === "agent" && m.type === "spend_request" ? (
              <SpendRequestCard
                message={m}
                agentName={session.agentName}
                onApprove={handleApproveSpend}
                onDeny={handleDenySpend}
              />
            ) : (
              <div className="flex flex-col max-w-[82%]">
                <div
                  className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                    m.from === "human"
                      ? "bg-blue-600/20 text-foreground rounded-br-sm"
                      : "bg-white/[0.06] text-foreground/90 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
                {m.from === "agent" && (
                  <span
                    className="text-[7px] font-semibold uppercase tracking-wider mt-1 self-start px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(100,80,255,0.10)",
                      border: "0.5px solid rgba(100,80,255,0.22)",
                      color: "#AFA9EC",
                    }}
                  >
                    Private · Venice
                  </span>
                )}
                <span className="text-[8px] text-muted-foreground/20 mt-1">
                  {new Date(m.ts).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.04] shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Message ${session.agentName}…`}
          disabled={sending}
          className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}
