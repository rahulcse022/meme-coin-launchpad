import type { ChainFamily } from "@/config/chains";
import { evmBlockchainService } from "@/lib/blockchain/evm";
import { solanaBlockchainService } from "@/lib/blockchain/solana";
import { tronBlockchainService } from "@/lib/blockchain/tron";
import type { BlockchainService } from "@/lib/blockchain/types";

const services: Record<ChainFamily, BlockchainService> = {
  evm: evmBlockchainService,
  solana: solanaBlockchainService,
  tron: tronBlockchainService,
};

export function getBlockchainService(family: ChainFamily): BlockchainService {
  return services[family];
}

export type { BlockchainService } from "@/lib/blockchain/types";
