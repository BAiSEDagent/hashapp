import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AccountSheet } from './AccountSheet';

export function WalletAddressChip() {
  const { address, isConnected } = useAccount();
  const [showSheet, setShowSheet] = useState(false);

  if (!isConnected || !address) return null;

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      <button
        onClick={() => setShowSheet(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] active:scale-[0.97] transition-all cursor-pointer"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] text-muted-foreground/50 font-mono">{truncated}</span>
      </button>
      {showSheet && <AccountSheet onClose={() => setShowSheet(false)} />}
    </>
  );
}
