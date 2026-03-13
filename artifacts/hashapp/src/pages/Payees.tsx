import React from 'react';
import { Search } from 'lucide-react';
import { AvatarIcon } from '@/components/ui/AvatarIcon';

const TRUSTED_PAYEES = [
  { name: 'PitchBook', initial: 'P', color: 'bg-blue-600' },
  { name: 'Perplexity', initial: 'P', color: 'bg-teal-500' },
  { name: 'OpenAI', initial: 'O', color: 'bg-zinc-700' },
  { name: 'Statista', initial: 'S', color: 'bg-orange-500' },
  { name: 'DataStream', initial: 'D', color: 'bg-purple-600' },
];

const RECENT_DESTINATIONS = [
  { name: 'PitchBook', initial: 'P', color: 'bg-blue-600', date: 'Yesterday', totalSpend: '$185.00', txCount: 6, verified: true },
  { name: 'OpenAI', initial: 'O', color: 'bg-zinc-700', date: 'Yesterday', totalSpend: '$312.00', txCount: 14, verified: true },
  { name: 'CloudAnalytics', initial: 'C', color: 'bg-rose-600', date: 'Mar 12', totalSpend: '$299.00', txCount: 1, verified: false },
  { name: 'Statista', initial: 'S', color: 'bg-orange-500', date: 'Mar 11', totalSpend: '$87.00', txCount: 3, verified: true },
  { name: 'Bloomberg', initial: 'B', color: 'bg-zinc-800', date: 'Mar 05', totalSpend: '$450.00', txCount: 3, verified: true },
];

export default function Payees() {
  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-background/90 backdrop-blur-md z-10">
        <h1 className="text-3xl font-bold tracking-tight">Trusted Destinations</h1>
      </header>

      {/* Trusted Rail */}
      <div className="mb-8">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Favorites</h2>
        </div>
        <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory hide-scrollbar">
          {TRUSTED_PAYEES.map((payee) => (
            <div key={payee.name} className="flex flex-col items-center gap-2 snap-start shrink-0">
              <AvatarIcon initial={payee.initial} colorClass={payee.color} size="lg" className="shadow-lg" />
              <span className="text-[11px] font-medium text-muted-foreground w-16 text-center truncate">
                {payee.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-8">
        <div className="relative flex items-center w-full h-12 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground px-4">
          <Search size={18} className="mr-3" />
          <input 
            type="text" 
            placeholder="Search payees" 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Recent List */}
      <div className="px-6 flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-2 mb-2">
          Recent
        </h2>
        
        {RECENT_DESTINATIONS.map((dest, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/30 transition-colors cursor-pointer -mx-3">
            <div className="relative">
              <AvatarIcon initial={dest.initial} colorClass={dest.color} />
              {dest.verified && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-background" title="Verified on Base"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{dest.name}</h3>
              <p className="text-xs text-muted-foreground">Last: {dest.date} · {dest.txCount} {dest.txCount === 1 ? 'purchase' : 'purchases'}</p>
            </div>
            
            <div className="text-right">
              <span className="font-medium text-foreground">{dest.totalSpend}</span>
              <p className="text-[10px] text-muted-foreground/60">total spend</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
