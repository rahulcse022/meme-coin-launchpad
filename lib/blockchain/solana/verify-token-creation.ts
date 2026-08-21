import { Connection, PublicKey } from "@solana/web3.js";
import { getNetworkById } from "@/config/chains";
import { getCreationFeeBaseUnits, getFeeRecipientAddress } from "@/config/creation-fees";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";

export type VerifySolanaTokenInput = {
  networkId: string;
  transactionHash: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
};

export type VerifySolanaTokenResult =
  | {
      verified: true;
      tokenAddress: string;
      transactionHash: string;
    }
  | {
      verified: false;
      reason: string;
    };

export async function verifySolanaTokenCreation(
  input: VerifySolanaTokenInput,
): Promise<VerifySolanaTokenResult> {
  const network = getNetworkById(input.networkId);

  if (!network || network.family !== "solana") {
    return { verified: false, reason: "The selected network is not a supported Solana network." };
  }

  const rpcUrl = process.env.SOLANA_RPC_URL || (input.networkId === "solana-devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com");
  const connection = new Connection(rpcUrl, "confirmed");

  try {
    // 1. Fetch the parsed transaction details
    const tx = await connection.getParsedTransaction(input.transactionHash, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { verified: false, reason: "Transaction was not found on this Solana network." };
    }

    if (tx.meta?.err) {
      return { verified: false, reason: "The transaction failed on-chain." };
    }

    // 2. Verify that the signer/payer matches the creatorAddress
    const signers = tx.transaction.message.accountKeys.filter((key) => key.signer);
    const primarySigner = signers[0]?.pubkey.toBase58();
    if (primarySigner !== input.creatorAddress) {
      return {
        verified: false,
        reason: `Transaction was signed by ${primarySigner}, but creator is ${input.creatorAddress}.`,
      };
    }

    // 3. Find the created Mint account (Token Address)
    // The transaction should contain a createAccount or initializeMint instruction.
    // Let's inspect the instructions inside the transaction to extract the mint address.
    let mintAddress: string | null = null;
    let feePaid = false;

    const expectedFeeAmount = getCreationFeeBaseUnits(input.networkId);
    const treasuryAddress = getFeeRecipientAddress(input.networkId);

    // Scan all outer instructions
    const instructions = tx.transaction.message.instructions;
    for (const inst of instructions) {
      // Check for SPL Token initialization
      if (
        "program" in inst &&
        inst.program === "spl-token" &&
        "parsed" in inst &&
        inst.parsed?.type === "initializeMint"
      ) {
        mintAddress = inst.parsed.info.mint;
      }

      // Check for fee transfer
      if (
        "program" in inst &&
        inst.program === "system" &&
        "parsed" in inst &&
        inst.parsed?.type === "transfer"
      ) {
        const info = inst.parsed.info;
        if (
          info.source === input.creatorAddress &&
          info.destination === treasuryAddress &&
          BigInt(info.lamports.toString()) === BigInt(expectedFeeAmount.toString())
        ) {
          feePaid = true;
        }
      }
    }

    // Scan inner instructions just in case instructions were bundled or nested
    if (tx.meta?.innerInstructions) {
      for (const inner of tx.meta.innerInstructions) {
        for (const inst of inner.instructions) {
          if (
            "program" in inst &&
            inst.program === "system" &&
            "parsed" in inst &&
            inst.parsed?.type === "transfer"
          ) {
            const info = inst.parsed.info;
            if (
              info.source === input.creatorAddress &&
              info.destination === treasuryAddress &&
              BigInt(info.lamports.toString()) === BigInt(expectedFeeAmount.toString())
            ) {
              feePaid = true;
            }
          }
        }
      }
    }

    if (!feePaid) {
      return {
        verified: false,
        reason: `Could not verify native fee payment of ${expectedFeeAmount.toString()} lamports to ${treasuryAddress}.`,
      };
    }

    if (!mintAddress) {
      return {
        verified: false,
        reason: "Could not find a token initialization instruction in this transaction.",
      };
    }

    // 4. Inspect the Mint account info directly on-chain to double-check supply and authority
    const accountInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    if (!accountInfo.value) {
      return {
        verified: false,
        reason: `Mint account ${mintAddress} could not be fetched on-chain.`,
      };
    }

    const data = accountInfo.value.data;
    if (typeof data !== "object" || !("parsed" in data) || data.program !== "spl-token") {
      return {
        verified: false,
        reason: `Account ${mintAddress} is not a valid SPL Token mint.`,
      };
    }

    const info = data.parsed.info;
    const expectedSupply = scaleTokenAmount(input.totalSupply, input.decimals);

    if (info.decimals !== input.decimals) {
      return {
        verified: false,
        reason: `Decimals mismatch: expected ${input.decimals}, found ${info.decimals}.`,
      };
    }

    if (BigInt(info.supply.toString()) !== expectedSupply) {
      return {
        verified: false,
        reason: `Supply mismatch: expected ${expectedSupply.toString()}, found ${info.supply}.`,
      };
    }

    if (info.mintAuthority !== input.creatorAddress) {
      return {
        verified: false,
        reason: `Mint authority mismatch: expected ${input.creatorAddress}, found ${info.mintAuthority}.`,
      };
    }

    return {
      verified: true,
      tokenAddress: mintAddress,
      transactionHash: input.transactionHash,
    };
  } catch (error) {
    return {
      verified: false,
      reason: error instanceof Error ? error.message : "Error verifying Solana transaction.",
    };
  }
}
