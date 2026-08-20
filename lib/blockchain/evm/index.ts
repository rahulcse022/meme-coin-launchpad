import type { BlockchainService, CreateTokenParams } from "@/lib/blockchain/types";
import { createEvmToken } from "@/lib/blockchain/evm/create-token";
import { getEvmTransactionStatus } from "@/lib/blockchain/evm/verify-token-creation";

export const evmBlockchainService: BlockchainService = {
  family: "evm",
  createToken: (params: CreateTokenParams) => createEvmToken(params),
  async getTokenBalance() {
    throw new Error("EVM token balances are not wired into the dashboard yet.");
  },
  getTransactionStatus: async (hash: string, networkId?: string) => {
    if (!networkId) {
      throw new Error("An EVM network is required to look up a transaction.");
    }

    return getEvmTransactionStatus(hash, networkId);
  },
  async verifyTransaction(hash: string, networkId?: string) {
    if (!networkId) {
      return false;
    }

    const status = await getEvmTransactionStatus(hash, networkId);
    return status === "confirmed";
  },
};
