import { Router } from "express";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const router = Router();

const SPEND_PERMISSION_MANAGER = "0xf85210B21cC50302F477BA56686d2019dC9b67Ad" as const;
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
    const scoutPrivateKey = process.env.SCOUT_PRIVATE_KEY;
    if (!scoutPrivateKey) {
      return res.status(500).json({ error: "SCOUT_PRIVATE_KEY not configured" });
    }

    const permission = req.body?.permission;
    const value = req.body?.value;

    if (!permission || !value) {
      return res.status(400).json({ error: "Missing permission or value" });
    }

    const account = privateKeyToAccount(
      scoutPrivateKey.startsWith("0x") ? (scoutPrivateKey as `0x${string}`) : (`0x${scoutPrivateKey}` as `0x${string}`)
    );

    if (account.address.toLowerCase() !== String(permission.spender).toLowerCase()) {
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
        BigInt(value),
      ],
      gas: 200000n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return res.json({
      ok: true,
      hash,
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      basescanUrl: `https://sepolia.basescan.org/tx/${hash}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

export default router;
