import {
  getExplorerTokenUrl,
  getExplorerTxUrl,
  getNetworkById,
} from "@/config/chains";
import { getTokensCollection, type CreatedTokenDocument } from "@/lib/db/mongo";
import type { CreatorToken, CreatorTokenStats } from "@/lib/tokens/creator-token";

export type { CreatorToken, CreatorTokenStats };

function toPublicToken(doc: CreatedTokenDocument): CreatorToken {
  const network = getNetworkById(doc.networkId);
  const createdAt =
    doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : new Date(doc.createdAt).toISOString();

  return {
    id: `${doc.networkId}:${doc.tokenAddress}`,
    networkId: doc.networkId,
    networkName: network?.name || doc.networkId,
    chain: doc.chain,
    name: doc.name,
    symbol: doc.symbol,
    decimals: doc.decimals,
    totalSupply: doc.totalSupply,
    creatorAddress: doc.creatorAddress,
    tokenAddress: doc.tokenAddress,
    transactionHash: doc.transactionHash,
    feeAmount: doc.feeAmount,
    feeCurrency: doc.feeCurrency,
    createdAt,
    explorerTokenUrl: network
      ? getExplorerTokenUrl(network, doc.tokenAddress)
      : null,
    explorerTxUrl: network ? getExplorerTxUrl(network, doc.transactionHash) : null,
  };
}

function sumFees(tokens: CreatorToken[]): CreatorTokenStats["fees"] {
  const totals = new Map<string, number>();

  for (const token of tokens) {
    const current = totals.get(token.feeCurrency) || 0;
    totals.set(token.feeCurrency, current + Number(token.feeAmount));
  }

  return [...totals.entries()].map(([currency, amount]) => ({
    amount: Number.isInteger(amount) ? String(amount) : amount.toString(),
    currency,
  }));
}

export async function listTokensByCreator(creatorAddress: string) {
  const collection = await getTokensCollection();
  const docs = await collection
    .find({ creatorAddress: creatorAddress.toLowerCase() })
    .sort({ createdAt: -1 })
    .toArray();

  const tokens = docs.map(toPublicToken);

  return {
    tokens,
    stats: {
      totalTokens: tokens.length,
      fees: sumFees(tokens),
    } satisfies CreatorTokenStats,
  };
}
