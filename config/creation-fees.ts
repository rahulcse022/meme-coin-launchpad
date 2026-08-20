import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import { parseUnits } from "viem";
import {
  getNetworkById,
  supportedNetworks,
  type ChainFamily,
} from "@/config/chains";

export const EVM_FEE_RECIPIENT_ADDRESS =
  "0x793dDB0eACf5499d51cAB2064EbfCB457AF6b193";

export const BTC_FEE_RECIPIENT_ADDRESS = "bc1qga55z5ffcs5fn27jezghl4xe6srd8udvcefygs";

export const SOLANA_FEE_RECIPINT_ADDRESS = "CXzvoUvEqKqMHpmywCApY8x2NVTuaKw9LEpewRjhYnY9";

export const SHASTA_FEE_RECIPINT_ADDRESS = "TPv7nBLrp3Q9Z2FvRjnw33LHeqgT5UyYHA";

export const SOLANA_DEVNET_RECIPINT_ADDRESS = "ESYasCnsUxif9WJ7kjk4xod9LmfCJZuGNHXdaJURfWs3";

export type NetworkFeeConfig = {
  recipient: string;
  amount: string;
};

export const NETWORK_FEE_CONFIG_MAP: Record<string, NetworkFeeConfig> = {
  // EVM
  ethereum: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  bnb: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  polygon: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  base: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  arbitrum: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  sepolia: { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  "bsc-testnet": { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  "polygon-amoy": { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  "base-sepolia": { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },
  "arbitrum-sepolia": { recipient: EVM_FEE_RECIPIENT_ADDRESS, amount: "0.1" },

  // Solana
  solana: { recipient: SOLANA_FEE_RECIPINT_ADDRESS, amount: "0.1" },
  "solana-devnet": { recipient: SOLANA_DEVNET_RECIPINT_ADDRESS, amount: "0.1" },
  "solana-testnet": { recipient: SOLANA_DEVNET_RECIPINT_ADDRESS, amount: "0.1" },

  // Tron
  tron: { recipient: SHASTA_FEE_RECIPINT_ADDRESS, amount: "0.1" },
  "tron-shasta": { recipient: SHASTA_FEE_RECIPINT_ADDRESS, amount: "0.1" },
};

/** Default native token amount charged to create a token if not found in map. */
export const CREATION_FEE_AMOUNT = "0.1";

const decimalsByFamily: Record<ChainFamily, number> = {
  evm: 18,
  solana: 9,
  tron: 6,
};

export type PlatformFeeQuote = {
  chain: ChainFamily;
  networkId: string;
  amount: string;
  currency: string;
  decimals: number;
  recipient: string;
  active: boolean;
};

export function getFeeRecipientAddress(networkId: string): string {
  const config = NETWORK_FEE_CONFIG_MAP[networkId];
  const recipient = config?.recipient;
  if (!recipient) {
    throw new Error(
      `Set fee recipient address for network "${networkId}" in config/creation-fees.ts`,
    );
  }

  const network = getNetworkById(networkId);
  if (network?.family === "evm") {
    if (!isAddress(recipient) || getAddress(recipient) === zeroAddress) {
      throw new Error(`Invalid EVM fee recipient address for network "${networkId}"`);
    }
    return getAddress(recipient);
  }

  return recipient;
}

export function getCreationFee(networkId: string): PlatformFeeQuote {
  const network = getNetworkById(networkId);

  if (!network) {
    throw new Error(
      `Network "${networkId}" is not in the launchpad configuration.`,
    );
  }

  const config = NETWORK_FEE_CONFIG_MAP[networkId];
  const amount = config?.amount || CREATION_FEE_AMOUNT;

  let recipient = "";
  let active = true;

  try {
    recipient = getFeeRecipientAddress(networkId);
  } catch {
    active = false;
  }

  return {
    chain: network.family,
    networkId: network.id,
    amount,
    currency: network.nativeSymbol || network.shortName,
    decimals: decimalsByFamily[network.family],
    recipient,
    active,
  };
}

export function getConfiguredPlatformFees(): PlatformFeeQuote[] {
  return supportedNetworks.map((network) => getCreationFee(network.id));
}

export function getCreationFeeBaseUnits(networkId: string) {
  const fee = getCreationFee(networkId);
  return parseUnits(fee.amount, fee.decimals);
}
