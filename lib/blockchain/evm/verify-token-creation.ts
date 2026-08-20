import {
  createPublicClient,
  decodeDeployData,
  defineChain,
  getAddress,
  http,
  isAddress,
  isHash,
  zeroAddress,
  type Address,
  type Hash,
} from "viem";
import { getNetworkById } from "@/config/chains";
import { getCreationFeeBaseUnits, getFeeRecipientAddress } from "@/config/creation-fees";
import { getEvmRpcUrl } from "@/config/evm-contracts";
import { memeTokenAbi } from "@/lib/contracts/evm/abi";
import { memeTokenBytecode } from "@/lib/contracts/evm/meme-token-bytecode";
import type { OnChainConfirmation } from "@/lib/blockchain/types";

export type VerifyEvmTokenInput = {
  networkId: string;
  transactionHash: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
};

export type VerifyEvmTokenResult =
  | {
      verified: true;
      tokenAddress: Address;
      transactionHash: Hash;
    }
  | {
      verified: false;
      reason: string;
    };

function getPublicClient(networkId: string) {
  const network = getNetworkById(networkId);
  const rpcUrl = getEvmRpcUrl(networkId);

  if (!network?.evmChainId) {
    throw new Error("The selected network is not a supported EVM chain.");
  }

  if (!rpcUrl) {
    throw new Error(
      `No RPC URL is configured for ${network.name}. Set EVM_RPC_URL or a per-network RPC.`,
    );
  }

  return createPublicClient({
    chain: defineChain({
      id: network.evmChainId,
      name: network.name,
      nativeCurrency: {
        name: network.nativeSymbol || "ETH",
        symbol: network.nativeSymbol || "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [rpcUrl] },
      },
    }),
    transport: http(rpcUrl),
  });
}

export async function getEvmTransactionStatus(
  hash: string,
  networkId: string,
): Promise<OnChainConfirmation> {
  if (!isHash(hash)) {
    return "not_found";
  }

  const client = getPublicClient(networkId);
  const receipt = await client.getTransactionReceipt({ hash }).catch(() => null);

  if (!receipt) {
    const tx = await client.getTransaction({ hash }).catch(() => null);
    return tx ? "pending" : "not_found";
  }

  return receipt.status === "success" ? "confirmed" : "failed";
}

export async function verifyEvmTokenCreation(
  input: VerifyEvmTokenInput,
): Promise<VerifyEvmTokenResult> {
  const network = getNetworkById(input.networkId);

  if (!network || network.family !== "evm") {
    return { verified: false, reason: "The selected network is not a supported EVM chain." };
  }

  if (!isHash(input.transactionHash)) {
    return { verified: false, reason: "The transaction hash is not a valid EVM hash." };
  }

  if (!isAddress(input.creatorAddress)) {
    return { verified: false, reason: "The creator address is not a valid EVM address." };
  }

  const client = getPublicClient(network.id);
  const hash = input.transactionHash as Hash;
  const creator = getAddress(input.creatorAddress);
  const expectedFee = getCreationFeeBaseUnits(network.id);
  const feeRecipient = getFeeRecipientAddress();

  const transaction = await client.getTransaction({ hash }).catch(() => null);

  if (!transaction) {
    return { verified: false, reason: "The transaction was not found on this network." };
  }

  if (getAddress(transaction.from) !== creator) {
    return {
      verified: false,
      reason: "The transaction sender does not match the connected creator wallet.",
    };
  }

  if (transaction.to && getAddress(transaction.to) !== zeroAddress) {
    return {
      verified: false,
      reason: "The transaction was not a token contract deployment from the connected wallet.",
    };
  }

  if (transaction.value !== expectedFee) {
    return {
      verified: false,
      reason: "The paid creation fee does not match the configured network fee.",
    };
  }

  try {
    const decoded = decodeDeployData({
      abi: memeTokenAbi,
      bytecode: memeTokenBytecode,
      data: transaction.input,
    });

    if (
      decoded.args[0] !== input.name ||
      decoded.args[1] !== input.symbol ||
      decoded.args[2] !== input.decimals ||
      decoded.args[3] !== input.totalSupply ||
      getAddress(decoded.args[4]) !== creator ||
      getAddress(decoded.args[5]) !== feeRecipient
    ) {
      return {
        verified: false,
        reason: "The deployment arguments do not match the submitted token and fee recipient.",
      };
    }
  } catch {
    return {
      verified: false,
      reason: "The transaction data is not a MemeToken deployment.",
    };
  }

  const receipt = await client.getTransactionReceipt({ hash }).catch(() => null);

  if (!receipt) {
    return {
      verified: false,
      reason: "The transaction is not confirmed yet. Wait for it to be mined and try again.",
    };
  }

  if (receipt.status !== "success") {
    return {
      verified: false,
      reason: "The token creation transaction reverted on-chain. No token was created.",
    };
  }

  const tokenAddress = receipt.contractAddress;

  if (!tokenAddress) {
    return {
      verified: false,
      reason: "The deployment receipt did not include a contract address.",
    };
  }

  const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
    client.readContract({
      address: tokenAddress,
      abi: memeTokenAbi,
      functionName: "name",
    }),
    client.readContract({
      address: tokenAddress,
      abi: memeTokenAbi,
      functionName: "symbol",
    }),
    client.readContract({
      address: tokenAddress,
      abi: memeTokenAbi,
      functionName: "decimals",
    }),
    client.readContract({
      address: tokenAddress,
      abi: memeTokenAbi,
      functionName: "totalSupply",
    }),
    client.readContract({
      address: tokenAddress,
      abi: memeTokenAbi,
      functionName: "owner",
    }),
  ]);

  if (name !== input.name || symbol !== input.symbol) {
    return {
      verified: false,
      reason: "The deployed token metadata does not match the submitted configuration.",
    };
  }

  if (decimals !== input.decimals || totalSupply !== input.totalSupply) {
    return {
      verified: false,
      reason: "The deployed token supply or decimals do not match the submitted configuration.",
    };
  }

  if (getAddress(owner) !== creator) {
    return {
      verified: false,
      reason: "The deployed token owner is not the connected creator wallet.",
    };
  }

  return {
    verified: true,
    tokenAddress,
    transactionHash: hash,
  };
}
