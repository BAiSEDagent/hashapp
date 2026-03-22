import { AGENT_SESSION_ADDRESS } from '@/config/delegation';

export function getDelegationRecipientAddress(): `0x${string}` {
  return AGENT_SESSION_ADDRESS;
}

export function getDelegationRecipientShort(): string {
  const addr = AGENT_SESSION_ADDRESS;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
