import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, metaMask } from 'wagmi/connectors';
import { USE_METAMASK_DELEGATION } from '@/config/delegation';

const connectors = USE_METAMASK_DELEGATION
  ? [metaMask({ dappMetadata: { name: 'Hashapp' } })]
  : [injected(), coinbaseWallet({ appName: 'Hashapp' })];

export const walletConfig = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
});
