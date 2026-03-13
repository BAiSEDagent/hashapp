import { useRoute, Link } from 'wouter';
import { X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemo } from '@/context/DemoContext';
import { AvatarIcon } from '@/components/ui/AvatarIcon';

export default function Receipt() {
  const [, params] = useRoute('/receipt/:id');
  const { feed } = useDemo();
  
  const item = feed.find(f => f.id === params?.id);

  if (!item) return <div className="p-8 text-center mt-20">Receipt not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] flex justify-center bg-background"
    >
      <div className="w-full max-w-[430px] bg-background h-full flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <X size={24} className="text-foreground" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col items-center">
          
          <AvatarIcon 
            initial={item.merchantInitial} 
            colorClass={item.merchantColor} 
            size="xl" 
            className="mb-6 shadow-2xl"
          />
          
          <h2 className="text-xl font-medium text-muted-foreground mb-2">{item.merchant}</h2>
          <h1 className="text-5xl font-bold tracking-tighter text-foreground mb-8">
            {item.amountStr}
          </h1>

          <div className={`px-4 py-1.5 rounded-full text-sm font-medium mb-12 flex items-center gap-2
            ${item.status === 'BLOCKED' || item.status === 'DECLINED' ? 'bg-rose-500/10 text-rose-400' : 
              item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 
              'bg-emerald-500/10 text-emerald-400'}
          `}>
            <div className={`w-2 h-2 rounded-full 
              ${item.status === 'BLOCKED' || item.status === 'DECLINED' ? 'bg-rose-400' : 
                item.status === 'PENDING' ? 'bg-amber-400' : 
                'bg-emerald-400'}
            `} />
            {item.statusMessage}
          </div>

          <div className="w-full bg-card rounded-2xl p-5 border border-border/50 space-y-5">
            <DetailRow label="Date & Time" value={`${item.dateGroup === 'TODAY' ? 'Today' : item.dateGroup === 'YESTERDAY' ? 'Yesterday' : item.dateGroup} at ${item.timestamp}`} />
            <DetailRow label="Category" value={item.category} />
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Stated Purpose</span>
              <span className="text-sm text-foreground font-medium leading-relaxed">{item.intent}</span>
            </div>
            <DetailRow 
              label="Approval" 
              value={item.status === 'AUTO_APPROVED' ? 'Auto-approved' : item.status === 'APPROVED' ? 'Human-approved' : item.status === 'BLOCKED' ? 'Blocked by rule' : item.status === 'DECLINED' ? 'Declined' : 'Pending'} 
            />
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Authorized by</span>
              <div className="flex items-center gap-2">
                <AvatarIcon initial="S" colorClass="bg-zinc-800" size="sm" />
                <span className="text-sm font-medium">Scout</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-[13px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
              Settled on Base · proof available
            </p>
            {item.txHash && (
              <p className="text-xs font-mono text-muted-foreground/40 flex items-center justify-center gap-1 cursor-pointer hover:text-muted-foreground/60 transition-colors">
                tx {item.txHash} <ExternalLink size={10} />
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
