import { cn } from '@/lib/utils';

interface AvatarIconProps {
  initial: string;
  colorClass: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarIcon({ initial, colorClass, size = 'md', className }: AvatarIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl'
  };

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-semibold text-white shadow-inner shrink-0",
      colorClass,
      sizeClasses[size],
      className
    )}>
      {initial}
    </div>
  );
}
