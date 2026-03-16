import { baseSepolia } from 'wagmi/chains';

export const USE_METAMASK_DELEGATION = import.meta.env.VITE_USE_METAMASK_DELEGATION === 'true';

export const DELEGATION_CHAIN = baseSepolia;
export const DELEGATION_CHAIN_ID = baseSepolia.id;

export const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

export const SCOUT_SESSION_ADDRESS = (import.meta.env.VITE_SCOUT_SESSION_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const DELEGATION_MANAGER_ADDRESS = '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3' as const;

export const PERMISSION_PERIOD_DURATION = 86400;
export const PERMISSION_EXPIRY_SECONDS = 604800;
