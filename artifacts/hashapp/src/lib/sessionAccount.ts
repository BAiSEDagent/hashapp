import { SCOUT_SESSION_ADDRESS } from '@/config/delegation';

export function getScoutSessionAddress(): `0x${string}` {
  return SCOUT_SESSION_ADDRESS;
}

export function getScoutAddressShort(): string {
  const addr = SCOUT_SESSION_ADDRESS;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
