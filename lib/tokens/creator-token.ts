export type CreatorToken = {
  id: string;
  networkId: string;
  networkName: string;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  tokenAddress: string;
  transactionHash: string;
  feeAmount: string;
  feeCurrency: string;
  createdAt: string;
  explorerTokenUrl: string | null;
  explorerTxUrl: string | null;
};

export type CreatorTokenStats = {
  totalTokens: number;
  fees: { amount: string; currency: string }[];
};
