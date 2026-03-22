import { Router } from "express";
import { createWalletClient, createPublicClient, http, isAddress, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const router = Router();

const SPEND_PERMISSION_MANAGER = "0xf85210B21cC50302F477BA56686d2019dC9b67Ad" as const;
const MAX_VALUE = 50_000_000n; // 50 USDC (6 decimals)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_SPENDER = 5;
const IDEMPOTENCY_TTL_MS = 300_000;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const idempotencyMap = new Map<string, { hash: `0x${string}`; ts: number }>();
function pruneMaps() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
  }
  for (const [key, entry] of idempotencyMap) {
    if (now - entry.ts > IDEMPOTENCY_TTL_MS) idempotencyMap.delete(key);
  }
}

const spendPermissionManagerAbi = [
  {
    name: "spend",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "spendPermission",
        type: "tuple",
        components: [
          { name: "account", type: "address" },
          { name: "spender", type: "address" },
          { name: "token", type: "address" },
          { name: "allowance", type: "uint160" },
          { name: "period", type: "uint48" },
          { name: "start", type: "uint48" },
          { name: "end", type: "uint48" },
          { name: "salt", type: "uint256" },
          { name: "extraData", type: "bytes" },
        ],
      },
      { name: "value", type: "uint160" },
    ],
    outputs: [],
  },
] as const;

router.post("/test/spend", async (req, res) => {
  try {
    pruneMaps();

    const scoutPrivateKey = process.env.SCOUT_PRIVATE_KEY;
    if (!scoutPrivateKey) {
      return res.status(500).json({ error: "SCOUT_PRIVATE_KEY not configured" });
    }

    const permission = req.body?.permission;
    const value = req.body?.value;
    const idempotencyKey = typeof req.body?.idempotencyKey === 'string' ? req.body.idempotencyKey.trim() : '';

    if (!permission || value === undefined || value === null) {
      return res.status(400).json({ error: "Missing permission or value" });
    }

    if (
      !isAddress(permission.account) ||
      !isAddress(permission.spender) ||
      !isAddress(permission.token) ||
      typeof permission.extraData !== 'string' ||
      !permission.extraData.startsWith('0x')
    ) {
      return res.status(400).json({ error: "Invalid permission payload" });
    }

    const spendValue = BigInt(value);
    if (spendValue <= 0n || spendValue > MAX_VALUE) {
      return res.status(400).json({ error: "Spend value must be between 1 and 50 USDC" });
    }

    if (idempotencyKey) {
      const existing = idempotencyMap.get(idempotencyKey);
      if (existing) {
        return res.json({ ok: true, hash: existing.hash, deduplicated: true });
      }
    }

    const normalizedSpender = getAddress(permission.spender).toLowerCase();
    const rateEntry = rateLimitMap.get(normalizedSpender);
    const now = Date.now();
    if (rateEntry && now - rateEntry.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (rateEntry.count >= RATE_LIMIT_MAX_PER_SPENDER) {
        return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
      }
      rateEntry.count += 1;
    } else {
      rateLimitMap.set(normalizedSpender, { count: 1, windowStart: now });
    }

    const account = privateKeyToAccount(
      scoutPrivateKey.startsWith("0x") ? (scoutPrivateKey as `0x${string}`) : (`0x${scoutPrivateKey}` as `0x${string}`)
    );

    if (account.address.toLowerCase() !== normalizedSpender) {
      return res.status(400).json({ error: "SCOUT_PRIVATE_KEY does not match permission spender" });
    }

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    });

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    });

    const hash = await walletClient.writeContract({
      address: SPEND_PERMISSION_MANAGER,
      abi: spendPermissionManagerAbi,
      functionName: "spend",
      args: [
        {
          account: permission.account,
          spender: permission.spender,
          token: permission.token,
          allowance: BigInt(permission.allowance),
          period: permission.period,
          start: permission.start,
          end: permission.end,
          salt: BigInt(permission.salt),
          extraData: permission.extraData,
        },
        spendValue,
      ],
      gas: 200000n,
    });

    if (idempotencyKey) {
      idempotencyMap.set(idempotencyKey, { hash, ts: Date.now() });
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return res.json({
      ok: true,
      hash,
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      basescanUrl: `https://sepolia.basescan.org/tx/${hash}`,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    let safeMessage = 'Spend execution failed';
    if (rawMessage.includes('reverted')) safeMessage = 'Transaction reverted onchain';
    else if (rawMessage.includes('insufficient')) safeMessage = 'Insufficient funds or allowance';
    else if (rawMessage.includes('nonce')) safeMessage = 'Nonce conflict — please retry';
    return res.status(500).json({ error: safeMessage });
  }
});

export default router;
