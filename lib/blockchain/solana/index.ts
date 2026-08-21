import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { none, type Signer } from "@metaplex-foundation/umi";
import { createMetadataAccountV3, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

import type { BlockchainService, CreateTokenParams, CreateTokenResult, OnChainConfirmation } from "@/lib/blockchain/types";
import { getNetworkById } from "@/config/chains";
import { getCreationFeeBaseUnits, getFeeRecipientAddress } from "@/config/creation-fees";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";

export function walletActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/user rejected|denied transaction|rejected the request|cancel/i.test(message)) {
    return "Transaction rejected by wallet. Please approve the transaction in your wallet and try again.";
  }
  if (/insufficient funds|exceeds the balance|insufficient lamports/i.test(message)) {
    return "Insufficient funds. The connected wallet must cover the creation fee plus gas.";
  }
  return message;
}

export const solanaBlockchainService: BlockchainService = {
  family: "solana",

  async createToken(params: CreateTokenParams): Promise<CreateTokenResult> {
    const { solanaProvider, solanaConnection, networkId, creatorAddress, name, symbol, decimals, totalSupply } = params;

    if (!networkId) {
      throw new Error("Select a Solana network before creating a token.");
    }

    const network = getNetworkById(networkId);
    if (!network || network.family !== "solana") {
      throw new Error("The selected network is not a supported Solana network.");
    }

    if (!solanaProvider) {
      throw new Error("Solana wallet provider is not connected.");
    }

    const connection = (solanaConnection as Connection) || new Connection(network.explorerUrl.includes("devnet") ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com", "confirmed");
    const payerPubkey = new PublicKey(creatorAddress);
    const treasuryAddress = getFeeRecipientAddress(networkId);
    const treasuryPubkey = new PublicKey(treasuryAddress);

    try {
      // 1. Generate a new Keypair for the Mint account
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey;

      // 2. Calculate the required rent exempt balance for the Mint space
      const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // 3. Derive ATA for the creator
      const associatedTokenAddress = getAssociatedTokenAddressSync(
        mintPubkey,
        payerPubkey,
        false,
        TOKEN_PROGRAM_ID
      );

      // 4. Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash("confirmed");

      // 5. Construct the Transaction
      const transaction = new Transaction({
        feePayer: payerPubkey,
        recentBlockhash: blockhash,
      });

      // Instruction 1: Create Mint Account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: payerPubkey,
          newAccountPubkey: mintPubkey,
          lamports: rentExemptBalance,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Instruction 2: Initialize Mint Account
      transaction.add(
        createInitializeMintInstruction(
          mintPubkey,
          decimals,
          payerPubkey,
          payerPubkey,
          TOKEN_PROGRAM_ID
        )
      );

      // Instruction 3: Create Associated Token Account for Creator
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payerPubkey,
          associatedTokenAddress,
          payerPubkey,
          mintPubkey,
          TOKEN_PROGRAM_ID
        )
      );

      // Instruction 4: Mint Supply to Creator
      const onChainSupply = scaleTokenAmount(totalSupply, decimals);
      transaction.add(
        createMintToInstruction(
          mintPubkey,
          associatedTokenAddress,
          payerPubkey,
          onChainSupply,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Instruction 5: Pay the creation fee to the treasury
      const feeInLamports = getCreationFeeBaseUnits(networkId);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payerPubkey,
          toPubkey: treasuryPubkey,
          lamports: BigInt(feeInLamports.toString()),
        })
      );

      // Instruction 6: Create Metaplex Metadata Account (if metadata URI exists)
      if (params.metadataUri) {
        const rpcUrl = network.explorerUrl.includes("devnet")
          ? "https://api.devnet.solana.com"
          : "https://api.mainnet-beta.solana.com";
        const umi = createUmi(rpcUrl).use(mplTokenMetadata());
        const creatorPubkeyUmi = fromWeb3JsPublicKey(payerPubkey);
        const mintPubkeyUmi = fromWeb3JsPublicKey(mintPubkey);

        const createMetadataIxUmi = createMetadataAccountV3(umi, {
          mint: mintPubkeyUmi,
          mintAuthority: { publicKey: creatorPubkeyUmi } as unknown as Signer,
          payer: { publicKey: creatorPubkeyUmi } as unknown as Signer,
          updateAuthority: creatorPubkeyUmi,
          isMutable: true,
          collectionDetails: none(),
          data: {
            name: name,
            symbol: symbol,
            uri: params.metadataUri,
            sellerFeeBasisPoints: 0,
            creators: none(),
            collection: none(),
            uses: none(),
          },
        });

        const createMetadataIx = toWeb3JsInstruction(
          createMetadataIxUmi.getInstructions()[0]
        );

        transaction.add(createMetadataIx);
      }

      // Instruction 7: Revoke Mint Authority (if isMintable is false)
      if (params.isMintable === false) {
        transaction.add(
          createSetAuthorityInstruction(
            mintPubkey,
            payerPubkey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      // 8. Sign transaction partially with the mint account keypair
      transaction.partialSign(mintKeypair);

      // 9. Request signing and broadcasting from wallet provider
      const signature = await (solanaProvider as {
        sendTransaction: (
          transaction: Transaction,
          connection: Connection,
          options?: { signers?: Keypair[] }
        ) => Promise<string>;
      }).sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      // 10. Wait for on-chain block commitment
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, "confirmed");

      return {
        transactionHash: signature,
        tokenAddress: mintPubkey.toBase58(),
      };
    } catch (error) {
      throw new Error(walletActionError(error));
    }
  },

  async getTokenBalance(ownerAddress: string, tokenAddress: string): Promise<bigint> {
    return BigInt(0);
  },

  async getTransactionStatus(hash: string, networkId?: string): Promise<OnChainConfirmation> {
    if (!networkId) return "not_found";
    const network = getNetworkById(networkId);
    if (!network) return "not_found";

    const rpcUrl = process.env.SOLANA_RPC_URL || (network.id === "solana-devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com");
    const connection = new Connection(rpcUrl, "confirmed");

    try {
      const tx = await connection.getSignatureStatus(hash, {
        searchTransactionHistory: true,
      });

      const status = tx?.value;
      if (!status) {
        return "not_found";
      }

      if (status.err) {
        return "failed";
      }

      if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
        return "confirmed";
      }

      return "pending";
    } catch {
      return "not_found";
    }
  },

  async verifyTransaction(hash: string, networkId?: string): Promise<boolean> {
    const status = await this.getTransactionStatus(hash, networkId);
    return status === "confirmed";
  },
};
