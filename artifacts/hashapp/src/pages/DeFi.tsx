import { ArrowDownUp, Info } from 'lucide-react';
import { SwapPanel } from '@/components/SwapPanel';

export default function DeFi() {
  return (
    <div className="flex flex-col min-h-full pb-8">
      <header className="px-6 pt-12 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight">DeFi</h1>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">Swap to Pay · settlement infrastructure</p>
      </header>

      <div className="px-6 pt-5 flex flex-col gap-4">
        <div className="bg-primary/[0.04] border border-primary/[0.07] rounded-xl p-4 flex gap-3">
          <Info className="text-primary/50 shrink-0 mt-0.5" size={14} />
          <p className="text-[11px] text-primary/50 leading-relaxed">
            Convert tokens to pay vendors. Uniswap handles the swap, your agent handles the payment — all within your spending rules.
          </p>
        </div>

        <SwapPanel />
      </div>

      <div className="mt-auto pt-10 text-center pb-4">
        <p className="text-[10px] text-muted-foreground/20 font-medium tracking-widest uppercase">
          Powered by Uniswap · Base Sepolia
        </p>
      </div>
    </div>
  );
}
