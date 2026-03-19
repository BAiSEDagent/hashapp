import { DELEGATION_RECIPIENT_ADDRESS } from '@/config/delegation';

export function getDelegationRecipientAddress(): `0x${string}` {
  return DELEGATION_RECIPIENT_ADDRESS;
}

export function getDelegationRecipientShort(): string {
  const addr = DELEGATION_RECIPIENT_ADDRESS;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
