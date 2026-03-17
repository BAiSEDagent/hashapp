export interface RegisterDelegationResult {
  spendToken: string;
  expiresAt: number;
}

export async function registerDelegation(
  permissionsContext: `0x${string}`,
  delegatorAddress: `0x${string}`,
): Promise<RegisterDelegationResult> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  const response = await fetch(`${apiBase}/delegation/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      permissionsContext,
      delegatorAddress,
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
