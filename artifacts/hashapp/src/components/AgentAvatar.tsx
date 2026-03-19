import { useRef } from 'react';
import { Camera, Bot } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';

export function AgentAvatar({
  size = 'md',
  editable = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  className?: string;
}) {
  const { agentAvatarUrl, setAgentAvatarUrl, connectedAgent } = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-20 h-20 text-[26px]',
  };

  const iconSizes = { sm: 10, md: 16, lg: 20, xl: 28 };

  const initial = connectedAgent?.name ? connectedAgent.name.charAt(0).toUpperCase() : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAgentAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const avatar = (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {agentAvatarUrl ? (
        <img
          src={agentAvatarUrl}
          alt={connectedAgent?.name ?? 'Agent'}
          className="w-full h-full object-cover"
        />
      ) : initial ? (
        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/60 flex items-center justify-center rounded-full">
          <span className="font-bold text-zinc-300">{initial}</span>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/60 flex items-center justify-center rounded-full">
          <Bot size={iconSizes[size]} className="text-zinc-500" />
        </div>
      )}
      {editable && connectedAgent && (
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full">
          <Camera size={size === 'xl' ? 20 : size === 'lg' ? 16 : 12} className="text-white/80" />
        </div>
      )}
    </div>
  );

  if (!editable || !connectedAgent) return avatar;

  return (
    <>
      <div onClick={() => fileRef.current?.click()} className="cursor-pointer">
        {avatar}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
