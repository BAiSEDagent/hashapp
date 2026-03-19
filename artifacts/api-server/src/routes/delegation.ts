import { Router } from 'express';
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { createWalletClient, http, encodeFunctionData, erc20Abi, parseUnits, isAddress, verifyMessage, decodeAbiParameters, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { erc7710WalletActions } from '@metamask/smart-accounts-kit/actions';
import { db } from '@workspace/db';
import { delegationChallenges, delegationContextOwners, delegationRateLimits, delegationIdempotency } from '@workspace/db/schema';
import { eq, lt, and } from 'drizzle-orm';

const delegationRouter = Router();

const ALLOWED_TOKENS: Record<string, boolean> = {
  '0x036cbd53842c5426634e7929541ec2318f3dcf7e': true,
};

const ALLOWED_RECIPIENTS: Record<string, boolean> = {
  '0xbf8bfde4b42baa2f4377b8ebc5d2602d3080a4d4': true,
  '0x000000000000000000000000000000000000dead': true,
};

const ALLOWED_DELEGATION_MANAGER = '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3';

const MAX_SPEND_AMOUNT_MICRO = 1_000_000_000n;
const SPEND_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_CONTEXT = 5;

const IDEMPOTENCY_TTL_MS = 300_000;

const CHALLENGE_TTL_SECONDS = 120;

const USDC_AMOUNT_PATTERN = /^\d+(\.\d{1,6})?$/;

async function pruneExpiredEntries() {
  const now = Date.now();
  const nowSec = Math.floor(now / 1000);
  try {
    await db.delete(delegationIdempotency).where(lt(delegationIdempotency.createdAt, now - IDEMPOTENCY_TTL_MS));
    await db.delete(delegationRateLimits).where(lt(delegationRateLimits.windowStart, now - RATE_LIMIT_WINDOW_MS));
    await db.delete(delegationChallenges).where(lt(delegationChallenges.createdAt, nowSec - CHALLENGE_TTL_SECONDS * 2));
    await db.delete(delegationContextOwners).where(lt(delegationContextOwners.registeredAt, nowSec - SPEND_TOKEN_TTL_SECONDS));
  } catch (err) {
    console.error('[DelegationPrune] Error:', err instanceof Error ? err.message : err);
  }
}

setInterval(() => { pruneExpiredEntries(); }, 60_000);

const DELEGATION_TUPLE_TYPE = {
  type: 'tuple[]' as const,
  components: [
    { name: 'delegate', type: 'address' as const },
    { name: 'delegator', type: 'address' as const },
    { name: 'authority', type: 'bytes32' as const },
    { name: 'caveats', type: 'tuple[]' as const, components: [
      { name: 'enforcer', type: 'address' as const },
      { name: 'terms', type: 'bytes' as const },
      { name: 'args', type: 'bytes' as const },
    ]},
    { name: 'salt', type: 'uint256' as const },
    { name: 'signature', type: 'bytes' as const },
  ],
};

function extractDelegatorFromContext(permissionsContext: `0x${string}`): string | null {
  try {
    const [delegations] = decodeAbiParameters(
      [DELEGATION_TUPLE_TYPE],
      permissionsContext,
    );
    if (!delegations || delegations.length === 0) return null;
    const firstDelegation = delegations[0] as { delegator: string };
    if (!firstDelegation.delegator || !isAddress(firstDelegation.delegator)) return null;
    return getAddress(firstDelegation.delegator).toLowerCase();
  } catch {
    return null;
  }
}

function getHmacSecret(): string {
  const dedicated = process.env.DELEGATION_AUTH_SECRET?.trim();
  if (dedicated) {
    return dedicated;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DELEGATION_AUTH_SECRET is required in production. Do not rely on fallback.');
  }
  const raw = process.env.SCOUT_PRIVATE_KEY?.trim();
  if (!raw) throw new Error('Neither DELEGATION_AUTH_SECRET nor SCOUT_PRIVATE_KEY configured');
  console.warn('[DelegationAuth] DELEGATION_AUTH_SECRET not set — falling back to derived secret from SCOUT_PRIVATE_KEY. Set DELEGATION_AUTH_SECRET for production.');
  return createHmac('sha256', 'hashapp-delegation-auth-v1').update(raw).digest('hex');
}

function createSpendToken(permissionsContext: string, delegatorAddress: string, issuedAt: number): string {
  const secret = getHmacSecret();
  const payload = `${permissionsContext.toLowerCase()}:${delegatorAddress.toLowerCase()}:${issuedAt}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  const tokenData = JSON.stringify({ ctx: permissionsContext.toLowerCase(), addr: delegatorAddress.toLowerCase(), iat: issuedAt, sig });
  return Buffer.from(tokenData).toString('base64url');
}

function validateSpendToken(token: string, permissionsContext: string): { valid: boolean; error?: string; delegatorAddress?: string } {
  const secret = getHmacSecret();
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    const { ctx, addr, iat, sig } = decoded;

    if (!ctx || !addr || !iat || !sig) {
      return { valid: false, error: 'Malformed spend token' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - iat > SPEND_TOKEN_TTL_SECONDS) {
      return { valid: false, error: 'Spend token expired' };
    }

    if (ctx !== permissionsContext.toLowerCase()) {
      return { valid: false, error: 'Token does not match permissionsContext' };
    }

    const payload = `${ctx}:${addr}:${iat}`;
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    return { valid: true, delegatorAddress: addr };
  } catch {
    return { valid: false, error: 'Invalid spend token format' };
  }
}

delegationRouter.post('/delegation/challenge', async (req, res) => {
  try {
    const { permissionsContext, delegatorAddress } = req.body;

    if (!permissionsContext || !delegatorAddress) {
      res.status(400).json({ error: 'Missing required fields: permissionsContext, delegatorAddress' });
      return;
    }

    if (typeof permissionsContext !== 'string' || !permissionsContext.startsWith('0x') || permissionsContext.length < 10) {
      res.status(400).json({ error: 'Invalid permissionsContext format' });
      return;
    }

    if (!isAddress(delegatorAddress)) {
      res.status(400).json({ error: 'Invalid delegatorAddress' });
      return;
    }

    const nonce = randomBytes(32).toString('hex');
    const nowSec = Math.floor(Date.now() / 1000);
    const challenge = `hashapp-delegation-register:${nonce}:${permissionsContext.toLowerCase()}:${delegatorAddress.toLowerCase()}:${nowSec}`;

    await db.insert(delegationChallenges).values({
      nonce,
      permissionsContext: permissionsContext.toLowerCase(),
      delegatorAddress: delegatorAddress.toLowerCase(),
      createdAt: nowSec,
      used: false,
    });

    res.json({
      challenge,
      nonce,
      expiresAt: nowSec + CHALLENGE_TTL_SECONDS,
    });
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DelegationChallenge] ERROR:', rawMessage);
    res.status(500).json({ error: 'Failed to issue challenge' });
  }
});

delegationRouter.post('/delegation/register', async (req, res) => {
  try {
    const { permissionsContext, delegatorAddress, signature, challengeId } = req.body;

    if (!permissionsContext || !delegatorAddress) {
      res.status(400).json({ error: 'Missing required fields: permissionsContext, delegatorAddress' });
      return;
    }

    if (!signature || !challengeId) {
      res.status(401).json({ error: 'Missing wallet signature or challengeId' });
      return;
    }

    if (typeof permissionsContext !== 'string' || !permissionsContext.startsWith('0x') || permissionsContext.length < 10) {
      res.status(400).json({ error: 'Invalid permissionsContext format' });
      return;
    }

    if (!isAddress(delegatorAddress)) {
      res.status(400).json({ error: 'Invalid delegatorAddress' });
      return;
    }

    const [challengeRow] = await db
      .delete(delegationChallenges)
      .where(
        and(
          eq(delegationChallenges.nonce, challengeId),
          eq(delegationChallenges.used, false),
        ),
      )
      .returning();

    if (!challengeRow) {
      res.status(401).json({ error: 'Invalid, expired, or already-used challenge' });
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec - challengeRow.createdAt > CHALLENGE_TTL_SECONDS) {
      res.status(401).json({ error: 'Challenge expired' });
      return;
    }

    if (challengeRow.permissionsContext !== permissionsContext.toLowerCase()) {
      res.status(401).json({ error: 'Challenge does not match permissionsContext' });
      return;
    }

    if (challengeRow.delegatorAddress !== delegatorAddress.toLowerCase()) {
      res.status(401).json({ error: 'Challenge does not match delegatorAddress' });
      return;
    }

    const expectedMessage = `hashapp-delegation-register:${challengeId}:${permissionsContext.toLowerCase()}:${delegatorAddress.toLowerCase()}:${challengeRow.createdAt}`;

    let recoveredValid = false;
    try {
      recoveredValid = await verifyMessage({
        address: delegatorAddress as `0x${string}`,
        message: expectedMessage,
        signature: signature as `0x${string}`,
      });
    } catch {
      recoveredValid = false;
    }

    if (!recoveredValid) {
      res.status(401).json({ error: 'Signature verification failed' });
      return;
    }

    const embeddedDelegator = extractDelegatorFromContext(permissionsContext as `0x${string}`);
    if (embeddedDelegator) {
      if (embeddedDelegator !== delegatorAddress.toLowerCase()) {
        res.status(403).json({ error: 'Signer does not match delegation owner' });
        return;
      }
    }

    const ctxKey = permissionsContext.toLowerCase();
    const [existingOwner] = await db.select().from(delegationContextOwners).where(eq(delegationContextOwners.contextKey, ctxKey)).limit(1);

    if (existingOwner) {
      if (existingOwner.owner !== delegatorAddress.toLowerCase()) {
        res.status(403).json({ error: 'Context already bound to a different owner' });
        return;
      }
    } else {
      await db.insert(delegationContextOwners).values({
        contextKey: ctxKey,
        owner: delegatorAddress.toLowerCase(),
        registeredAt: Math.floor(Date.now() / 1000),
      });
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const spendToken = createSpendToken(permissionsContext, delegatorAddress, issuedAt);

    console.log('[DelegationRegister] Issued spend token for delegator:', delegatorAddress.slice(0, 10) + '...');

    res.json({ spendToken, expiresAt: issuedAt + SPEND_TOKEN_TTL_SECONDS });
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DelegationRegister] ERROR:', rawMessage);
    res.status(500).json({ error: 'Failed to register delegation' });
  }
});

delegationRouter.post('/delegation/spend', async (req, res) => {
  try {
    const { permissionsContext, delegationManager, tokenAddress, amountUsdc, recipient, idempotencyKey, spendToken } = req.body;

    if (!spendToken || typeof spendToken !== 'string') {
      res.status(401).json({ error: 'Missing spend authorization token' });
      return;
    }

    if (!permissionsContext || !delegationManager || !tokenAddress || !amountUsdc || !recipient) {
      res.status(400).json({ error: 'Missing required fields: permissionsContext, delegationManager, tokenAddress, amountUsdc, recipient' });
      return;
    }

    if (typeof permissionsContext !== 'string' || !permissionsContext.startsWith('0x') || permissionsContext.length < 10) {
      res.status(400).json({ error: 'Invalid permissionsContext format' });
      return;
    }

    const tokenValidation = validateSpendToken(spendToken, permissionsContext);
    if (!tokenValidation.valid) {
      res.status(401).json({ error: tokenValidation.error || 'Unauthorized' });
      return;
    }

    const ctxKey = permissionsContext.toLowerCase();
    const [registeredOwner] = await db.select().from(delegationContextOwners).where(eq(delegationContextOwners.contextKey, ctxKey)).limit(1);
    if (!registeredOwner) {
      res.status(403).json({ error: 'Context not registered' });
      return;
    }
    if (tokenValidation.delegatorAddress !== registeredOwner.owner) {
      res.status(403).json({ error: 'Token owner does not match registered context owner' });
      return;
    }

    if (!isAddress(tokenAddress)) {
      res.status(400).json({ error: 'Invalid tokenAddress' });
      return;
    }

    if (!isAddress(recipient)) {
      res.status(400).json({ error: 'Invalid recipient address' });
      return;
    }

    if (!isAddress(delegationManager)) {
      res.status(400).json({ error: 'Invalid delegationManager address' });
      return;
    }

    if (!ALLOWED_TOKENS[tokenAddress.toLowerCase()]) {
      res.status(403).json({ error: 'Token not in allowlist' });
      return;
    }

    if (!ALLOWED_RECIPIENTS[recipient.toLowerCase()]) {
      res.status(403).json({ error: 'Recipient not in allowlist' });
      return;
    }

    if (delegationManager.toLowerCase() !== ALLOWED_DELEGATION_MANAGER.toLowerCase()) {
      res.status(403).json({ error: 'Unrecognized delegation manager' });
      return;
    }

    if (typeof amountUsdc !== 'string') {
      res.status(400).json({ error: 'amountUsdc must be a string (e.g. "5" or "5.50")' });
      return;
    }
    if (!USDC_AMOUNT_PATTERN.test(amountUsdc)) {
      res.status(400).json({ error: 'amountUsdc must be a decimal string (e.g. "5" or "5.50")' });
      return;
    }
    const amountStr = amountUsdc;
    let amountMicro: bigint;
    try {
      amountMicro = parseUnits(amountStr, 6);
    } catch {
      res.status(400).json({ error: 'amountUsdc could not be parsed as USDC amount' });
      return;
    }
    if (amountMicro <= 0n || amountMicro > MAX_SPEND_AMOUNT_MICRO) {
      res.status(400).json({ error: 'Amount must be between 0 and 1000 USDC' });
      return;
    }

    if (idempotencyKey && typeof idempotencyKey === 'string') {
      const [existing] = await db.select().from(delegationIdempotency).where(eq(delegationIdempotency.key, idempotencyKey)).limit(1);
      if (existing) {
        res.json({ txHash: existing.txHash, success: true, deduplicated: true });
        return;
      }
    }

    const now = Date.now();
    const contextKey = permissionsContext.slice(0, 66).toLowerCase();
    const [rateEntry] = await db.select().from(delegationRateLimits).where(eq(delegationRateLimits.contextKey, contextKey)).limit(1);

    if (rateEntry) {
      if (now - rateEntry.windowStart < RATE_LIMIT_WINDOW_MS) {
        if (rateEntry.count >= RATE_LIMIT_MAX_PER_CONTEXT) {
          res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
          return;
        }
        await db.update(delegationRateLimits).set({ count: rateEntry.count + 1 }).where(eq(delegationRateLimits.contextKey, contextKey));
      } else {
        await db.update(delegationRateLimits).set({ count: 1, windowStart: now }).where(eq(delegationRateLimits.contextKey, contextKey));
      }
    } else {
      await db.insert(delegationRateLimits).values({ contextKey, count: 1, windowStart: now });
    }

    const rawKey = process.env.SCOUT_PRIVATE_KEY?.trim();
    if (!rawKey) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const sessionKey: `0x${string}` = rawKey.startsWith('0x')
      ? (rawKey as `0x${string}`)
      : (`0x${rawKey}` as `0x${string}`);
    const sessionAccount = privateKeyToAccount(sessionKey);

    const walletClient = createWalletClient({
      account: sessionAccount,
      chain: baseSepolia,
      transport: http(),
    }).extend(erc7710WalletActions());

    const calldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient as `0x${string}`, parseUnits(amountStr, 6)],
    });

    const txHash = await walletClient.sendTransactionWithDelegation({
      account: sessionAccount,
      chain: baseSepolia,
      to: tokenAddress as `0x${string}`,
      data: calldata,
      permissionsContext: permissionsContext as `0x${string}`,
      delegationManager: delegationManager as `0x${string}`,
    } as Parameters<typeof walletClient.sendTransactionWithDelegation>[0]);

    if (idempotencyKey && typeof idempotencyKey === 'string') {
      await db.insert(delegationIdempotency).values({ key: idempotencyKey, txHash, createdAt: Date.now() });
    }

    console.log('[DelegationSpend] SUCCESS for delegator:', tokenValidation.delegatorAddress?.slice(0, 10) + '...', 'txHash:', txHash);

    res.json({ txHash, success: true });
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DelegationSpend] ERROR:', rawMessage);
    console.error('[DelegationSpend] Error code:', err?.code);
    console.error('[DelegationSpend] Error data:', JSON.stringify(err?.data));
    console.error('[DelegationSpend] Error details:', err?.details);
    try {
      console.error('[DelegationSpend] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    } catch { console.error('[DelegationSpend] Full error (non-serializable):', err); }

    let safeMessage = 'Delegation spend execution failed';
    if (rawMessage.includes('reverted')) safeMessage = 'Transaction reverted onchain';
    else if (rawMessage.includes('insufficient')) safeMessage = 'Insufficient funds or allowance';
    else if (rawMessage.includes('nonce')) safeMessage = 'Nonce conflict — please retry';

    res.status(500).json({ error: safeMessage });
  }
});

export default delegationRouter;
