import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Copy, Check, LogOut, X, Wallet } from 'lucide-react';

export function AccountSheet({ onClose }: { onClose: () => void }) {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-card border-t border-border/40 rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold tracking-tight">Account</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        <div className="bg-zinc-800/40 rounded-2xl p-4 border border-zinc-700/30 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
              <Wallet size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-emerald-400/80 font-medium">Connected</span>
              </div>
              <p className="text-[11px] text-muted-foreground/40 mt-0.5">{chain?.name ?? 'Base Sepolia'}</p>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-xl px-4 py-3 border border-zinc-700/20">
            <p className="text-[10px] text-muted-foreground/35 font-medium mb-1">Wallet address</p>
            <p className="text-[14px] font-mono text-foreground/90 tracking-wide mb-1.5">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
            <p className="text-[10px] font-mono text-muted-foreground/40 break-all leading-relaxed">{address}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30 hover:bg-zinc-800/60 active:scale-[0.98] transition-all"
          >
            {copied ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Copy size={16} className="text-muted-foreground/50" />
            )}
            <span className="text-[14px] font-medium text-foreground">
              {copied ? 'Copied!' : 'Copy address'}
            </span>
          </button>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 active:scale-[0.98] transition-all"
          >
            <LogOut size={16} className="text-rose-400/70" />
            <span className="text-[14px] font-medium text-rose-400/80">Disconnect wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
