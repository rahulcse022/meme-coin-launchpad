import {
  deployContract,
  getAccount,
  switchChain,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { UserRejectedRequestError } from "viem";
import { config } from "@/config";
import { getNetworkById } from "@/config/chains";
import { getCreationFee, getCreationFeeBaseUnits, getFeeRecipientAddress } from "@/config/creation-fees";
import { memeTokenAbi } from "@/lib/contracts/evm/abi";
import { memeTokenBytecode } from "@/lib/contracts/evm/meme-token-bytecode";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";
import type { CreateTokenParams, CreateTokenResult } from "@/lib/blockchain/types";

export function walletActionError(error: unknown) {
  if (error instanceof UserRejectedRequestError) {
    return "Transaction rejected by wallet. Please approve the transaction in your wallet and try again.";
  }

  const message = error instanceof Error ? error.message : String(error);

  if (/user rejected|denied transaction|rejected the request/i.test(message)) {
    return "Transaction rejected by wallet. Please approve the transaction in your wallet and try again.";
  }

  if (/connector not connected|no connector/i.test(message)) {
    return "No wallet is connected. Connect a wallet and try again.";
  }

  if (/insufficient funds|exceeds the balance/i.test(message)) {
    return "Insufficient funds. The connected wallet must cover the creation fee plus gas.";
  }

  return error instanceof Error
    ? error.message
    : "The wallet could not send the token creation transaction.";
}

export async function createEvmToken(
  params: CreateTokenParams,
): Promise<CreateTokenResult> {
  try {
    if (!params.networkId) {
      throw new Error("Select an EVM network before creating a token.");
    }

    const network = getNetworkById(params.networkId);

    if (!network || network.family !== "evm" || !network.evmChainId) {
      throw new Error("The selected network is not a supported EVM chain.");
    }

    const account = getAccount(config);

    if (!account.address) {
      throw new Error("Connect an EVM wallet before creating a token.");
    }

    if (account.address.toLowerCase() !== params.creatorAddress.toLowerCase()) {
      throw new Error(
        "The connected wallet does not match the creator address shown in the preview.",
      );
    }

    if (account.chainId !== network.evmChainId) {
      await switchChain(config, { chainId: network.evmChainId });
    }

    const fee = getCreationFee(network.id);
    const feeValue = getCreationFeeBaseUnits(network.id);
    const feeRecipient = getFeeRecipientAddress(network.id);
    const onChainSupply = scaleTokenAmount(params.totalSupply, params.decimals);

    const hash = await deployContract(config, {
      abi: memeTokenAbi,
      bytecode: memeTokenBytecode,
      args: [
        params.name,
        params.symbol,
        params.decimals,
        onChainSupply,
        account.address,
        feeRecipient as `0x${string}`,
      ],
      value: feeValue,
      chainId: network.evmChainId,
    });

    const receipt = await waitForTransactionReceipt(config, {
      hash,
      chainId: network.evmChainId,
    });

    if (receipt.status !== "success") {
      throw new Error(
        "The token creation transaction was mined but reverted. No token was created.",
      );
    }

    if (!receipt.contractAddress) {
      throw new Error(
        `The ${fee.amount} ${fee.currency} fee was sent, but no token contract address was returned.`,
      );
    }

    return {
      transactionHash: hash,
      tokenAddress: receipt.contractAddress,
    };
  } catch (error) {
    throw new Error(walletActionError(error));
  }
}
