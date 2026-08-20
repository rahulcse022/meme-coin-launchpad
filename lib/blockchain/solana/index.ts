import type { BlockchainService } from "@/lib/blockchain/types";

function notImplemented(method: string): never {
  throw new Error(
    `Solana ${method} is not available yet. Token creation ships in Phase 4.`,
  );
}

export const solanaBlockchainService: BlockchainService = {
  family: "solana",
  createToken: () => notImplemented("createToken"),
  getTokenBalance: () => notImplemented("getTokenBalance"),
  getTransactionStatus: () => notImplemented("getTransactionStatus"),
  verifyTransaction: () => notImplemented("verifyTransaction"),
};
