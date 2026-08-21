import type { BlockchainService, CreateTokenParams, CreateTokenResult, OnChainConfirmation } from "@/lib/blockchain/types";
import { getNetworkById } from "@/config/chains";
import { getCreationFeeBaseUnits, getFeeRecipientAddress } from "@/config/creation-fees";
import { memeTokenAbi } from "@/lib/contracts/evm/abi";
import { memeTokenBytecode } from "@/lib/contracts/evm/meme-token-bytecode";

// The TVM is EVM-compatible and uses the same Solidity ABI and bytecode.
// TronLink injects window.tronWeb which handles contract deployment on TVM.

const SHASTA_FULL_NODE = "https://api.shasta.trongrid.io";
const TRON_FULL_NODE = "https://api.trongrid.io";

async function getTronWeb() {
  if (typeof window === "undefined") {
    throw new Error(
      "Tron transactions must be submitted from a browser with TronLink installed.",
    );
  }

  // Give TronLink time to inject if the page just loaded
  if (!window.tronWeb) {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (!window.tronWeb) {
    throw new Error(
      "TronLink is not installed. Install TronLink wallet extension and refresh the page.",
    );
  }

  if (!window.tronWeb.ready || !window.tronWeb.defaultAddress?.base58) {
    throw new Error(
      "TronLink is not connected. Please unlock your TronLink wallet and try again.",
    );
  }

  return window.tronWeb;
}

export async function createTronToken(
  params: CreateTokenParams,
): Promise<CreateTokenResult> {
  const tronWeb = await getTronWeb();

  const network = getNetworkById(params.networkId ?? "tron");
  if (!network || network.family !== "tron") {
    throw new Error("The selected network is not a supported TRON chain.");
  }

  const creatorAddress = tronWeb.defaultAddress.base58 as string;

  if (!creatorAddress) {
    throw new Error("No TRON account is connected. Unlock TronLink and try again.");
  }

  // Normalize to lowercase for comparison (TronLink uses base58 which is case-sensitive)
  if (creatorAddress !== params.creatorAddress) {
    throw new Error(
      "The connected TronLink account does not match the creator address shown in the preview.",
    );
  }

  const feeRecipient = getFeeRecipientAddress(network.id);
  // TRX fee is in sun (6 decimals), already computed by getCreationFeeBaseUnits
  const feeInSun = Number(getCreationFeeBaseUnits(network.id));

  const onChainSupply = params.totalSupply * BigInt(10 ** params.decimals);

  // The TVM is EVM-compatible — we reuse the EVM bytecode (Solidity 0.8.x targets TVM).
  // TronWeb's createSmartContract accepts a `parameters` array for constructor args —
  // it does the ABI encoding internally. Do NOT append encoded params to the bytecode.
  const bytecodeHex = memeTokenBytecode; // keep 0x prefix

  // Use TronLink to create the smart contract transaction
  const tx = await tronWeb.transactionBuilder.createSmartContract(
    {
      abi: memeTokenAbi,
      bytecode: bytecodeHex,
      callValue: feeInSun,
      feeLimit: 1_000_000_000, // 1000 TRX max fee
      userFeePercentage: 100,
      originEnergyLimit: 10_000_000,
      parameters: [
        params.name,
        params.symbol,
        params.decimals,
        onChainSupply.toString(),
        creatorAddress,
        feeRecipient,
        params.isMintable ?? false,
        params.isBurnable ?? true,
      ],
    },
    creatorAddress,
  );

  // Sign the transaction with TronLink
  const signedTx = await tronWeb.trx.sign(tx);

  // Broadcast the signed transaction
  const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

  if (!receipt?.result && !receipt?.txid) {
    throw new Error(
      receipt?.message
        ? `TRON transaction failed: ${receipt.message}`
        : "TRON transaction was not accepted by the network. Check TronLink for details.",
    );
  }

  const txHash = receipt.txid as string;

  // Wait for the transaction to be confirmed (up to 30 seconds)
  let attempts = 0;
  let contractAddress: string | undefined;

  while (attempts < 15) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const info = await tronWeb.trx.getTransactionInfo(txHash);
      if (info?.contract_address) {
        contractAddress = tronWeb.address.fromHex(info.contract_address) as string;
        break;
      }
    } catch {
      // Keep polling
    }
    attempts++;
  }

  if (!contractAddress) {
    // Return the hash even if we couldn't get the contract address yet
    // The verify step will pick it up
    return {
      transactionHash: txHash,
      tokenAddress: txHash, // placeholder until verified
    };
  }

  return {
    transactionHash: txHash,
    tokenAddress: contractAddress,
  };
}



async function getTronTransactionStatus(
  hash: string,
  networkId?: string,
): Promise<OnChainConfirmation> {
  try {
    const node = networkId === "tron-shasta" ? SHASTA_FULL_NODE : TRON_FULL_NODE;
    const res = await fetch(`${node}/wallet/gettransactioninfobyid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: hash }),
    });
    const info = await res.json();

    if (!info?.id) {
      // Try checking if it's at least submitted
      const txRes = await fetch(`${node}/wallet/gettransactionbyid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: hash }),
      });
      const tx = await txRes.json();
      return tx?.txID ? "pending" : "not_found";
    }

    if (info.receipt?.result === "SUCCESS") return "confirmed";
    if (info.receipt?.result) return "failed";
    return "pending";
  } catch {
    return "not_found";
  }
}

export const tronBlockchainService: BlockchainService = {
  family: "tron",
  createToken: createTronToken,
  getTokenBalance: async (_ownerAddress: string, _tokenAddress: string): Promise<bigint> => {
    throw new Error("TRON getTokenBalance is not implemented yet.");
  },
  getTransactionStatus: getTronTransactionStatus,
  verifyTransaction: async (hash: string, networkId?: string): Promise<boolean> => {
    const status = await getTronTransactionStatus(hash, networkId);
    return status === "confirmed";
  },
};
