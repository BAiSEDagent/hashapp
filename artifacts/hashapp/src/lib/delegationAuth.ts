export interface RegisterDelegationResult {
  spendToken: string;
  expiresAt: number;
}

export type SignMessageFn = (args: { message: string }) => Promise<`0x${string}`>;

export async function registerDelegation(
  permissionsContext: `0x${string}`,
  delegatorAddress: `0x${string}`,
  signMessage: SignMessageFn,
): Promise<RegisterDelegationResult> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  const challengeResponse = await fetch(`${apiBase}/delegation/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      permissionsContext,
      delegatorAddress,
    }),
  });

  if (!challengeResponse.ok) {
    let errorMsg = 'Failed to obtain challenge';
    try {
      const body = await challengeResponse.json();
      if (body?.error) errorMsg = body.error;
    } catch {
      errorMsg = `Challenge request failed (HTTP ${challengeResponse.status})`;
    }
    throw new Error(errorMsg);
  }

  const { challenge, nonce } = await challengeResponse.json();
  if (!challenge || !nonce) {
    throw new Error('Server returned invalid challenge');
  }

  const signature = await signMessage({ message: challenge });

  const response = await fetch(`${apiBase}/delegation/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      permissionsContext,
      delegatorAddress,
      signature,
      challengeId: nonce,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Delegation registration failed';
    try {
      const body = await response.json();
      if (body?.error) errorMsg = body.error;
    } catch {
      errorMsg = `Registration failed (HTTP ${response.status})`;
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  if (!result.spendToken) {
    throw new Error('No spend token returned from server');
  }

  return {
    spendToken: result.spendToken,
    expiresAt: result.expiresAt,
  };
}
