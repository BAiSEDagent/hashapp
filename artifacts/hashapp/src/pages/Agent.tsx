import React, { useState, useCallback, useMemo } from 'react';
import { Shield, ArrowRight, CheckCircle2, Zap, RefreshCw, ArrowLeftRight, Eye, ChevronDown, Bot, Pencil, Unplug, X } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { useDemo, type ConnectedAgent } from '@/context/DemoContext';
import { useLocation } from 'wouter';
import { AgentAvatar } from '@/components/AgentAvatar';
import { TruthBadge } from '@/components/TruthBadge';
import { USE_METAMASK_DELEGATION } from '@/config/delegation';
import { SCOUT_SESSION_ADDRESS } from '@/config/delegation';
import {
  SCOUT_SPENDER_ADDRESS,
  SPEND_PERMISSION_MANAGER_ADDRESS,
  SPEND_PERMISSION_MANAGER_ABI,
} from '@/config/spendPermission';

const scoutAddress = USE_METAMASK_DELEGATION ? SCOUT_SESSION_ADDRESS : SCOUT_SPENDER_ADDRESS;
const SCOUT_ADDRESS_SHORT = `${scoutAddress.slice(0, 6)}...${scoutAddress.slice(-4)}`;

export default function Agent() {
  const { connectedAgent, connectAgent, updateAgent, disconnectAgent } = useDemo();
  const [showSheet, setShowSheet] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleConnect = (agent: ConnectedAgent) => {
    connectAgent(agent);
    setShowSheet(false);
    setEditMode(false);
  };

  const handleUpdate = (agent: ConnectedAgent) => {
    updateAgent(agent);
    setShowSheet(false);
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
    setShowSheet(true);
  };

  const handleDisconnect = () => {
    disconnectAgent();
  };

  if (!connectedAgent) {
    return (
      <>
        <EmptyState onConnect={() => { setEditMode(false); setShowSheet(true); }} />
        {showSheet && (
          <ConnectionSheet
            onSubmit={handleConnect}
            onClose={() => setShowSheet(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ActiveState
        agent={connectedAgent}
        onEdit={handleEdit}
        onDisconnect={handleDisconnect}
      />
      {showSheet && (
        <ConnectionSheet
          initialValues={editMode ? connectedAgent : undefined}
          onSubmit={editMode ? handleUpdate : handleConnect}
          onClose={() => { setShowSheet(false); setEditMode(false); }}
        />
      )}
    </>
  );
}

function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col min-h-full pb-8 items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-[280px]">
        <div className="w-20 h-20 rounded-full bg-zinc-800/60 border border-zinc-700/30 flex items-center justify-center mb-6">
          <Bot size={32} className="text-zinc-500" />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight mb-2 text-foreground">No Agent Connected</h1>
        <p className="text-[13px] text-muted-foreground/50 leading-relaxed mb-8">
          Connect an agent to request payments, use private reasoning, and act within your spending rules.
        </p>
        <button
          onClick={onConnect}
          className="w-full py-3 rounded-xl text-[14px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
        >
          Connect Agent
        </button>
      </div>
    </div>
  );
}

function ConnectionSheet({
  initialValues,
  onSubmit,
  onClose,
}: {
  initialValues?: ConnectedAgent;
  onSubmit: (agent: ConnectedAgent) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialValues?.name || '');
  const [role, setRole] = useState(initialValues?.role || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [errors, setErrors] = useState<{ name?: string; role?: string; address?: string }>({});

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!role.trim()) newErrors.role = 'Required';
    if (!address.trim()) newErrors.address = 'Required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ name: name.trim(), role: role.trim(), address: address.trim() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-card border-t border-border/40 rounded-t-3xl p-6 pb-24 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-foreground">
            {initialValues ? 'Edit Agent' : 'Connect Agent'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <X size={14} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
              placeholder="e.g. Scout"
              className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/60 border text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors ${errors.name ? 'border-rose-500/50' : 'border-border/30'}`}
            />
            {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Role / Description</label>
            <input
              type="text"
              value={role}
              onChange={(e) => { setRole(e.target.value); setErrors(prev => ({ ...prev, role: undefined })); }}
              placeholder="e.g. Research agent · reads markets, files reports"
              className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/60 border text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors ${errors.role ? 'border-rose-500/50' : 'border-border/30'}`}
            />
            {errors.role && <p className="text-[10px] text-rose-400 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Execution Address or ENS</label>
            <input
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: undefined })); }}
              placeholder="e.g. 0x1234... or agent.base.eth"
              className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/60 border text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono text-[13px] transition-colors ${errors.address ? 'border-rose-500/50' : 'border-border/30'}`}
            />
            {errors.address && <p className="text-[10px] text-rose-400 mt-1">{errors.address}</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all mt-2"
          >
            {initialValues ? 'Save Changes' : 'Connect Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveState({
  agent,
  onEdit,
  onDisconnect,
}: {
  agent: ConnectedAgent;
  onEdit: () => void;
  onDisconnect: () => void;
}) {
  const { rules, feed, spendPermissions, recordScoutSwapAndPay } = useDemo();
  const { address, isConnected } = useAccount();
  const [, setLocation] = useLocation();
  const [scoutPayState, setScoutPayState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [scoutPayError, setScoutPayError] = useState<string | null>(null);
  const activeRulesCount = rules.filter(r => r.enabled).length;
  const approvedCount = feed.filter(i => i.status === 'APPROVED' || i.status === 'AUTO_APPROVED').length;
  const blockedCount = feed.filter(i => i.status === 'BLOCKED').length;
  const activePermissions = spendPermissions.filter(p => p.state === 'active');

  const totalSpent = feed
    .filter(i => i.status === 'APPROVED' || i.status === 'AUTO_APPROVED')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalBudget = activePermissions.reduce((sum, p) => sum + p.amount, 0);

  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : null;

  const agentAddressShort = agent.address.length > 12
    ? `${agent.address.slice(0, 6)}...${agent.address.slice(-4)}`
    : agent.address;

  const handleScoutAutoPay = useCallback(async () => {
    setScoutPayState('running');
    setScoutPayError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const scoutToken = import.meta.env.VITE_SCOUT_API_TOKEN || '';
      const res = await fetch(`${API_BASE}/swap/scout-swap-and-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(scoutToken ? { 'Authorization': `Bearer ${scoutToken}` } : {}),
        },
        body: JSON.stringify({
          tokenIn: '0x0000000000000000000000000000000000000000',
          tokenOut: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
          amount: '10000000000000000',
          recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD10',
          paymentAmountUsdc: '10',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Auto-pay failed' }));
        throw new Error(body.error || `Failed (${res.status})`);
      }

      const data = await res.json();
      recordScoutSwapAndPay({
        swapTxHash: data.swapTxHash,
        paymentTxHash: data.paymentTxHash,
        swapDetails: {
          tokenIn: '0x0000000000000000000000000000000000000000',
          tokenOut: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
          tokenInSymbol: 'ETH',
          tokenOutSymbol: 'USDC',
          amountIn: '0.01',
          amountOut: data.outputAmount ? (Number(data.outputAmount) / 1e6).toFixed(2) : '~10',
          exchangeRate: '',
          gasCostUSD: data.gasFeeUSD || '0',
          priceImpact: 0,
        },
        vendor: 'Perplexity',
        paymentAmountUsdc: 10,
      });
      setScoutPayState('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Auto-pay failed';
      setScoutPayError(msg);
      setScoutPayState('error');
    }
  }, [recordScoutSwapAndPay]);

  return (
    <div className="flex flex-col min-h-full pb-8">
      <div className="px-6 pt-14 pb-8 flex flex-col items-center text-center">
        <div className="relative mb-5">
          <AgentAvatar size="xl" editable />
          <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
            <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        
        <h1 className="text-[26px] font-bold tracking-tight mb-1">{agent.name}</h1>
        <p className="text-[12px] text-muted-foreground/50 mb-1">{agent.role}</p>
        <p className="text-[10px] text-muted-foreground/30 font-mono tracking-wide mb-4">{agentAddressShort}</p>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/10 text-[10px] font-medium text-emerald-400/80 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            <Pencil size={11} />
            Edit Agent
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-rose-400/70 transition-colors"
          >
            <Unplug size={11} />
            Disconnect
          </button>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3.5">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard value={approvedCount} label="Approved" color="text-emerald-400" />
          <StatCard value={blockedCount} label="Blocked" color="text-rose-400" />
          <StatCard value={activeRulesCount} label="Rules" color="text-primary" />
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-muted-foreground/40" />
            <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Operating State</span>
          </div>
          <div className="space-y-3">
            <StateRow label="Status" value="Active" valueColor="text-emerald-400" />
            <StateRow label="Spender address" value={SCOUT_ADDRESS_SHORT} mono />
            <StateRow 
              label="Spending from" 
              value={isConnected && truncatedAddress ? truncatedAddress : 'No wallet connected'} 
              valueColor={isConnected ? undefined : 'text-muted-foreground/40'}
            />
            <StateRow label="Settlement" value="USDC on Base" />
            <StateRow
              label="Authority model"
              value={USE_METAMASK_DELEGATION ? 'MetaMask Delegation (ERC-7710)' : 'SpendPermissionManager'}
            />
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[12px] text-muted-foreground/40">Spent this month</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-foreground/90">${totalSpent.toFixed(2)}</span>
                <TruthBadge type="demo" />
              </div>
            </div>
            <StateRow label="Budget" value={`$${totalBudget}/mo across ${activePermissions.length} permissions`} />
            <StateRow label="Constraints" value={`${activeRulesCount} active rules`} />
          </div>
        </div>

        <ReasoningPrivacyCard />

        {activePermissions.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={14} className="text-muted-foreground/40" />
              <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Spend Permissions</span>
              <span className="ml-auto text-[10px] text-muted-foreground/30 tabular-nums">{activePermissions.length} active</span>
            </div>
            <div className="space-y-3">
              {activePermissions.map(perm => (
                <AgentPermissionRow key={perm.id} perm={perm} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight size={14} className="text-muted-foreground/40" />
            <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{agent.name} Auto-Pay</span>
          </div>
          <p className="text-[11px] text-muted-foreground/40 mb-4">
            {agent.name} can autonomously swap ETH → USDC via Uniswap then pay vendors. This triggers a real onchain swap + USDC transfer on Base Sepolia.
          </p>
          <button
            onClick={handleScoutAutoPay}
            disabled={scoutPayState === 'running'}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scoutPayState === 'running' ? 'Swapping & Paying...' : scoutPayState === 'done' ? 'Done — Check Activity ✓' : `Trigger ${agent.name} Swap → Pay`}
          </button>
          {scoutPayError && (
            <p className="mt-2 text-[10px] text-rose-400/80">{scoutPayError}</p>
          )}
          {scoutPayState === 'done' && (
            <p className="mt-2 text-[10px] text-emerald-400/80">SWAP + PAYMENT recorded in Activity feed with real tx hashes.</p>
          )}
        </div>

        <div 
          onClick={() => setLocation('/rules')}
          className="bg-card rounded-2xl p-4 border border-border/30 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
              <Shield size={16} className="text-primary/80" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-foreground">Active Constraints</h3>
              <p className="text-[10px] text-muted-foreground/40">{activeRulesCount} rules protecting your wallet</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-muted-foreground/20" />
        </div>
      </div>

      <div className="mt-auto pt-10 text-center pb-4">
        <p className="text-[10px] text-muted-foreground/20 font-medium tracking-widest uppercase">
          {USE_METAMASK_DELEGATION ? 'ERC-7710 · ERC-7715 · ' : ''}Base Sepolia
        </p>
      </div>
    </div>
  );
}

function AgentPermissionRow({ perm }: { perm: import('@/context/DemoContext').SpendPermission }) {
  const cadenceLabel = { daily: '/day', weekly: '/wk', monthly: '/mo' };
  const permStruct = perm.permissionStruct;
  const isDelegation = USE_METAMASK_DELEGATION && perm.isDelegation;

  const { data: isApprovedOnchain } = useReadContract({
    address: SPEND_PERMISSION_MANAGER_ADDRESS,
    abi: SPEND_PERMISSION_MANAGER_ABI,
    functionName: 'isApproved',
    args: permStruct ? [{
      account: permStruct.account,
      spender: permStruct.spender,
      token: permStruct.token,
      allowance: BigInt(permStruct.allowance),
      period: permStruct.period,
      start: permStruct.start,
      end: permStruct.end,
      salt: BigInt(permStruct.salt),
      extraData: permStruct.extraData,
    }] : undefined,
    chainId: 84532,
    query: { enabled: !isDelegation && !!permStruct && !!perm.isReal },
  });

  let badgeType: 'onchain' | 'demo' | 'pending';
  if (isDelegation && perm.permissionsContext) {
    badgeType = 'onchain';
  } else if (perm.isReal && perm.txHash) {
    const verified = isApprovedOnchain ?? perm.onchainVerified;
    badgeType = verified ? 'onchain' : 'pending';
  } else {
    badgeType = 'demo';
  }

  return (
    <div className="flex items-center gap-3">
      <AgentAvatar size="sm" />
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-medium text-foreground">{perm.vendor}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TruthBadge type={badgeType} txHash={perm.txHash} />
          {isDelegation && (
            <span className="text-[8px] text-orange-400/60 font-medium uppercase tracking-wider">delegation</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-semibold tabular-nums">${perm.amount}{cadenceLabel[perm.cadence]}</span>
        <div className={`w-[5px] h-[5px] rounded-full ${perm.state === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      </div>
    </div>
  );
}

function ReasoningPrivacyCard() {
  const { feed, privateReasoningEnabled, setPrivateReasoningEnabled } = useDemo();
  const [expanded, setExpanded] = useState(false);

  const lastAnalysis = useMemo(() => {
    const veniceItem = feed.find(i => i.privateReasoningUsed);
    if (!veniceItem) return null;
    if (veniceItem.dateGroup === 'TODAY') return 'Today';
    if (veniceItem.dateGroup === 'YESTERDAY') return 'Yesterday';
    return veniceItem.dateGroup;
  }, [feed]);

  return (
    <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-violet-400/60" />
            <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Reasoning & Privacy</span>
          </div>
          <button
            onClick={() => setPrivateReasoningEnabled(!privateReasoningEnabled)}
            className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-200 ${privateReasoningEnabled ? 'bg-emerald-500/80' : 'bg-zinc-600/60'}`}
          >
            <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${privateReasoningEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>

        <p className={`text-[11px] font-medium mb-3 ${privateReasoningEnabled ? 'text-emerald-400/80' : 'text-muted-foreground/40'}`}>
          {privateReasoningEnabled ? 'Private review enabled' : 'Private review disabled'}
        </p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[10px] text-muted-foreground/30 font-medium">Privacy details</span>
        <ChevronDown size={12} className={`text-muted-foreground/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${expanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 space-y-3">
          <StateRow label="Provider" value="Venice" />
          <StateRow label="Inputs allowed" value="Text" />
          <StateRow label="Disclosure policy" value="Summary only" />
          {lastAnalysis && (
            <StateRow label="Last private analysis" value={lastAnalysis} />
          )}
          <p className="text-[10px] text-muted-foreground/30 mt-2 leading-relaxed">
            {privateReasoningEnabled
              ? 'Venice reasoning may inform actions while keeping raw inputs private.'
              : 'Actions will not use Venice private reasoning.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/30 text-center">
      <p className={`text-[22px] font-bold tracking-tight ${color}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground/30 mt-1 font-medium uppercase tracking-[0.15em]">{label}</p>
    </div>
  );
}

function StateRow({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[12px] text-muted-foreground/40">{label}</span>
      <span className={`text-[12px] font-medium ${mono ? 'font-mono text-muted-foreground/60 tracking-wide' : valueColor || 'text-foreground/90'}`}>{value}</span>
    </div>
  );
}
