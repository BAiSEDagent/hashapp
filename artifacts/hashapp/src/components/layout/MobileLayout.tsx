import { Link, useLocation } from 'wouter';
import { Activity, Bot, ShieldCheck, DollarSign, ArrowLeftRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { AgentAvatar } from '@/components/AgentAvatar';
import { cn } from '@/lib/utils';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#000000] w-full flex justify-center text-foreground font-sans">
      <div className="w-full max-w-[430px] bg-background min-h-screen relative flex flex-col shadow-2xl border-x border-white/[0.04]">
        {isConnected && (
          <Link
            href="/agent"
            className="absolute top-6 right-6 z-30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Open Agent"
          >
            <div className="relative">
              <AgentAvatar size="sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
          </Link>
        )}

        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {children}
        </main>

        <nav className="absolute bottom-0 w-full h-[72px] bg-background/85 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-4 z-50">
          <NavItem href="/" icon={<DollarSign size={20} />} label="Money" />
          <NavItem href="/activity" icon={<Activity size={20} />} label="Activity" />
          <NavItem href="/defi" icon={<ArrowLeftRight size={20} />} label="DeFi" />
          <NavItem href="/agent" icon={<Bot size={20} />} label="Agent" />
          <NavItem href="/rules" icon={<ShieldCheck size={20} />} label="Rules" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  const [location] = useLocation();
  const isActive = href === '/' ? location === '/' : location.startsWith(href);

  return (
    <Link 
      href={href} 
      data-testid={`nav-${label.toLowerCase()}`}
      className={cn(
        "flex flex-col items-center justify-center w-12 gap-1 transition-all duration-200",
        isActive ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground/80"
      )}
    >
      <div className={cn(
        "transition-transform duration-300",
        isActive ? "scale-105" : "scale-100"
      )}>
        {icon}
      </div>
      <span className="text-[8px] font-medium tracking-wider uppercase">{label}</span>
    </Link>
  );
}
