import { type EIP1193Provider, createWalletClient, custom, parseUnits } from 'viem';
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions';
import {
  DELEGATION_CHAIN,
  USDC_BASE_SEPOLIA,
  SCOUT_SESSION_ADDRESS,
  PERMISSION_PERIOD_DURATION,
  PERMISSION_EXPIRY_SECONDS,
} from '@/config/delegation';

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export interface GrantedDelegation {
  permissionsContext: `0x${string}`;
  delegationManager: `0x${string}`;
  grantedPermissions: unknown;
}

export async function requestDelegatedPermission(
  amountUsdc: number,
): Promise<GrantedDelegation> {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask Flask 13.5.0+.');
  }

  const walletClient = createWalletClient({
    chain: DELEGATION_CHAIN,
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());

  const now = Math.floor(Date.now() / 1000);
  const periodAmount = parseUnits(amountUsdc.toString(), 6);

  const permissionRequest = [
    {
      chainId: DELEGATION_CHAIN.id,
      expiry: now + PERMISSION_EXPIRY_SECONDS,
      signer: {
        type: 'account' as const,
        data: { address: SCOUT_SESSION_ADDRESS },
      },
      permission: {
        type: 'erc20-token-periodic' as const,
        data: {
          tokenAddress: USDC_BASE_SEPOLIA,
          periodAmount,
          periodDuration: PERMISSION_PERIOD_DURATION,
        },
      },
      isAdjustmentAllowed: true,
    },
  ];

  console.log('[Delegation] requestExecutionPermissions payload:', JSON.stringify(permissionRequest, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  const grantedPermissions = await walletClient.requestExecutionPermissions(permissionRequest);

  const firstPermission = grantedPermissions[0];
  if (!firstPermission) {
    throw new Error('No permissions returned from wallet');
  }

  const permissionsContext = firstPermission.context as `0x${string}`;
  const signerMeta = firstPermission.signerMeta;
  if (!signerMeta) {
    throw new Error('No signer metadata in granted permission');
  }
  const delegationManager = signerMeta.delegationManager as `0x${string}`;

  return {
    permissionsContext,
    delegationManager,
    grantedPermissions,
  };
}
