export type VerifiedTokenCreation = {
  tokenAddress: string;
  transactionHash: string;
};

export async function verifyCreatedToken(input: {
  networkId: string;
  transactionHash: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
}): Promise<VerifiedTokenCreation> {
  const response = await fetch("/api/tokens/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        verified: true;
        tokenAddress: string;
        transactionHash: string;
      }
    | {
        verified: false;
        reason?: string;
      }
    | null;

  if (!payload || payload.verified !== true) {
    throw new Error(
      (payload && "reason" in payload && payload.reason) ||
        "Backend verification failed. Token creation was not marked successful.",
    );
  }

  if (!payload.tokenAddress || !payload.transactionHash) {
    throw new Error(
      "Backend verification succeeded without a token address. Creation was not marked successful.",
    );
  }

  return {
    tokenAddress: payload.tokenAddress,
    transactionHash: payload.transactionHash,
  };
}
