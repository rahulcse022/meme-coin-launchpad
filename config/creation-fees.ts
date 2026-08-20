import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import { parseUnits } from "viem";
import {
  getNetworkById,
  supportedNetworks,
  type ChainFamily,
} from "@/config/chains";

/** Native token amount charged to create a token on every network. */
export const CREATION_FEE_AMOUNT = "0.1";

/**
 * Launchpad treasury wallet that receives the creation fee.
 * Replace this with your EVM wallet before creating tokens.
 */
export const FEE_RECIPIENT_ADDRESS =
  "0x31fC3728cB5D8aa976929224D88d8AC563292B89";

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

export function getFeeRecipientAddress(): Address {
  if (
    !isAddress(FEE_RECIPIENT_ADDRESS) ||
    getAddress(FEE_RECIPIENT_ADDRESS) === zeroAddress
  ) {
    throw new Error(
      "Set FEE_RECIPIENT_ADDRESS in config/creation-fees.ts to the wallet that should receive creation fees.",
    );
  }

  return getAddress(FEE_RECIPIENT_ADDRESS);
}

export function getCreationFee(networkId: string): PlatformFeeQuote {
  const network = getNetworkById(networkId);

  if (!network) {
    throw new Error(
      `Network "${networkId}" is not in the launchpad configuration.`,
    );
  }

  let recipient = "";
  let active = true;

  try {
    recipient = getFeeRecipientAddress();
  } catch {
    active = false;
  }

  return {
    chain: network.family,
    networkId: network.id,
    amount: CREATION_FEE_AMOUNT,
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
