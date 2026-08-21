import type { ChainFamily } from "@/config/chains";

export type TransactionStatus =
  | "preparing"
  | "waiting_for_wallet"
  | "waiting_for_confirmation"
  | "processing"
  | "success"
  | "failed";

export type OnChainConfirmation = "pending" | "confirmed" | "failed" | "not_found";

export type CreateTokenParams = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  creatorAddress: string;
  metadataUri?: string;
  networkId?: string;
  solanaProvider?: unknown;
  solanaConnection?: unknown;
  verifyOnExplorer?: boolean;
  isMintable?: boolean;
  isBurnable?: boolean;
};

export type CreateTokenResult = {
  tokenAddress: string;
  transactionHash: string;
};

export interface BlockchainService {
  readonly family: ChainFamily;
  createToken(params: CreateTokenParams): Promise<CreateTokenResult>;
  getTokenBalance(ownerAddress: string, tokenAddress: string): Promise<bigint>;
  getTransactionStatus(
    hash: string,
    networkId?: string,
  ): Promise<OnChainConfirmation>;
  verifyTransaction(hash: string, networkId?: string): Promise<boolean>;
}
