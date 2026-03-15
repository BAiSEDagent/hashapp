import React from 'react';
import { Bot, Shield, ArrowRight, CheckCircle2, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useDemo } from '@/context/DemoContext';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { useLocation } from 'wouter';

export default function Agent() {
  const { rules, feed, spendPermissions } = useDemo();
  const { address, isConnected } = useAccount();
  const [, setLocation] = useLocation();
  const activeRulesCount = rules.filter(r => r.enabled).length;
  const approvedCount = feed.filter(i => i.status === 'APPROVED' || i.status === 'AUTO_APPROVED').length;
  const blockedCount = feed.filter(i => i.status === 'BLOCKED').length;
  const activePermissions = spendPermissions.filter(p => p.state === 'active');

  const totalSpent = feed
    .filter(i => i.status === 'APPROVED' || i.status === 'AUTO_APPROVED')
    .reduce((sum, i) => sum + i.amount, 0);

  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : null;

  return (
    <div className="flex flex-col min-h-full pb-8">
      <div className="px-6 pt-14 pb-8 flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/60 flex items-center justify-center shadow-2xl">
            <Bot size={38} className="text-zinc-300" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
            <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        
        <h1 className="text-[26px] font-bold tracking-tight mb-1">Scout</h1>
        <p className="text-[12px] text-muted-foreground/50 mb-0.5">Research agent · reads markets, files reports</p>
        <p className="text-[10px] text-muted-foreground/30 font-mono tracking-wide mb-4">scout.base.eth</p>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/10 text-[10px] font-medium text-emerald-400/80">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
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
            <StateRow label="Identity" value="scout.base.eth" mono />
            <StateRow 
              label="Spending from" 
              value={isConnected && truncatedAddress ? truncatedAddress : 'No wallet connected'} 
              valueColor={isConnected ? undefined : 'text-muted-foreground/40'}
            />
            <StateRow label="Settlement" value="USDC on Base" />
            <StateRow label="Spent this month" value={`$${totalSpent.toFixed(2)}`} />
            <StateRow label="Constraints" value={`${activeRulesCount} active rules`} />
          </div>
        </div>

        {activePermissions.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={14} className="text-muted-foreground/40" />
              <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Spend Permissions</span>
              <span className="ml-auto text-[10px] text-muted-foreground/30 tabular-nums">{activePermissions.length} active</span>
            </div>
            <div className="space-y-3">
              {activePermissions.map(perm => {
                const cadenceLabel = { daily: '/day', weekly: '/wk', monthly: '/mo' };
                const isRealOnchain = perm.isReal && perm.txHash;
                return (
                  <div key={perm.id} className="flex items-center gap-3">
                    <AvatarIcon initial={perm.vendorInitial} colorClass={perm.vendorColor} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-foreground">{perm.vendor}</span>
                      {isRealOnchain ? (
                        <a
                          href={`https://sepolia.basescan.org/tx/${perm.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink size={8} />
                          Onchain proof
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30 block">Demo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[13px] font-semibold tabular-nums">${perm.amount}{cadenceLabel[perm.cadence]}</span>
                      <div className={`w-[5px] h-[5px] rounded-full ${perm.state === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          ERC-8004 · Base Sepolia
        </p>
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
