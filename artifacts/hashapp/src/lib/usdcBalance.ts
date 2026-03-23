import { createPublicClient, http, erc20Abi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { USDC_BASE_SEPOLIA } from '@/config/delegation';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function getUsdcBalance(address: `0x${string}`): Promise<number> {
  const raw = await publicClient.readContract({
    address: USDC_BASE_SEPOLIA as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });
  return Number(raw) / 1e6;
}
