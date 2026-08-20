import type { BlockchainService } from "@/lib/blockchain/types";

function notImplemented(method: string): never {
  throw new Error(
    `TRON ${method} is not available yet. Token creation ships in Phase 5.`,
  );
}

export const tronBlockchainService: BlockchainService = {
  family: "tron",
  createToken: () => notImplemented("createToken"),
  getTokenBalance: () => notImplemented("getTokenBalance"),
  getTransactionStatus: () => notImplemented("getTransactionStatus"),
  verifyTransaction: () => notImplemented("verifyTransaction"),
};
