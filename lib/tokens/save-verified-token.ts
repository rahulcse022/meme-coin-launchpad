import { MongoServerError } from "mongodb";
import { getCreationFee, getFeeRecipientAddress } from "@/config/creation-fees";
import {
  getTokensCollection,
  type CreatedTokenDocument,
} from "@/lib/db/mongo";

export async function saveVerifiedToken(input: {
  networkId: string;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  tokenAddress: string;
  transactionHash: string;
}): Promise<CreatedTokenDocument> {
  const fee = getCreationFee(input.networkId);
  const feeRecipient = getFeeRecipientAddress();
  const collection = await getTokensCollection();

  const document: CreatedTokenDocument = {
    networkId: input.networkId,
    chain: input.chain,
    name: input.name,
    symbol: input.symbol,
    decimals: input.decimals,
    totalSupply: input.totalSupply,
    creatorAddress: input.creatorAddress.toLowerCase(),
    tokenAddress: input.tokenAddress.toLowerCase(),
    transactionHash: input.transactionHash.toLowerCase(),
    feeAmount: fee.amount,
    feeCurrency: fee.currency,
    feeRecipient: feeRecipient.toLowerCase(),
    createdAt: new Date(),
  };

  try {
    await collection.insertOne(document);
    return document;
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const existing = await collection.findOne({
        networkId: document.networkId,
        transactionHash: document.transactionHash,
      });

      if (
        existing &&
        existing.tokenAddress === document.tokenAddress &&
        existing.creatorAddress === document.creatorAddress
      ) {
        return existing;
      }

      throw new Error(
        "This transaction was already used. Token creation hashes cannot be reused.",
      );
    }

    throw error;
  }
}
