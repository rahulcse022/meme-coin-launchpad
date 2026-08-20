import { z } from "zod";
import { NextRequest } from "next/server";
import { getNetworkById } from "@/config/chains";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";
import { verifyEvmTokenCreation } from "@/lib/blockchain/evm/verify-token-creation";
import { getTronTransactionInfo } from "@/lib/blockchain/tron/verify";
import { saveVerifiedToken } from "@/lib/tokens/save-verified-token";

const bodySchema = z.object({
  networkId: z.string().min(1),
  transactionHash: z.string().min(1),
  creatorAddress: z.string().min(1),
  name: z.string().min(2),
  symbol: z.string().min(2),
  totalSupply: z.string().regex(/^[0-9]+$/),
  decimals: z.number().int().min(0).max(18),
});

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);

  if (!current || current.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (current.count >= 20) {
    return false;
  }

  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (!rateLimit(ip)) {
    return Response.json(
      { verified: false, reason: "Too many verification requests. Wait a minute and try again." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { verified: false, reason: "The verification payload was invalid." },
      { status: 400 },
    );
  }

  const network = getNetworkById(parsed.data.networkId);

  if (!network) {
    return Response.json(
      { verified: false, reason: "Unknown network." },
      { status: 400 },
    );
  }

  // --- TRON branch ---
  if (network.family === "tron") {
    let tronTokenAddress: string;
    try {
      tronTokenAddress = await getTronTransactionInfo(
        parsed.data.transactionHash,
        network.id,
      );
    } catch (error) {
      return Response.json(
        {
          verified: false,
          reason:
            error instanceof Error
              ? error.message
              : "Could not verify TRON transaction.",
        },
        { status: 400 },
      );
    }

    try {
      await saveVerifiedToken({
        networkId: parsed.data.networkId,
        chain: network.family,
        name: parsed.data.name,
        symbol: parsed.data.symbol,
        decimals: parsed.data.decimals,
        totalSupply: parsed.data.totalSupply,
        creatorAddress: parsed.data.creatorAddress,
        tokenAddress: tronTokenAddress,
        transactionHash: parsed.data.transactionHash,
      });
    } catch (error) {
      return Response.json(
        {
          verified: false,
          reason:
            error instanceof Error
              ? error.message
              : "The token was verified on-chain but could not be saved to MongoDB.",
        },
        { status: 500 },
      );
    }

    return Response.json({
      verified: true,
      tokenAddress: tronTokenAddress,
      transactionHash: parsed.data.transactionHash,
    });
  }

  // --- EVM branch ---
  if (network.family !== "evm") {
    return Response.json(
      {
        verified: false,
        reason: "Only EVM and TRON token creation can be verified in this phase.",
      },
      { status: 400 },
    );
  }

  let result;

  try {
    result = await verifyEvmTokenCreation({
      networkId: parsed.data.networkId,
      transactionHash: parsed.data.transactionHash,
      creatorAddress: parsed.data.creatorAddress,
      name: parsed.data.name,
      symbol: parsed.data.symbol,
      totalSupply: scaleTokenAmount(BigInt(parsed.data.totalSupply), parsed.data.decimals),
      decimals: parsed.data.decimals,
    });
  } catch (error) {
    return Response.json(
      {
        verified: false,
        reason:
          error instanceof Error
            ? error.message
            : "Token creation could not be verified.",
      },
      { status: 400 },
    );
  }

  if (!result.verified) {
    return Response.json(result, { status: 400 });
  }

  try {
    await saveVerifiedToken({
      networkId: parsed.data.networkId,
      chain: network.family,
      name: parsed.data.name,
      symbol: parsed.data.symbol,
      decimals: parsed.data.decimals,
      totalSupply: parsed.data.totalSupply,
      creatorAddress: parsed.data.creatorAddress,
      tokenAddress: result.tokenAddress,
      transactionHash: result.transactionHash,
    });
  } catch (error) {
    return Response.json(
      {
        verified: false,
        reason:
          error instanceof Error
            ? error.message
            : "The token was verified on-chain but could not be saved to MongoDB.",
      },
      { status: 500 },
    );
  }

  return Response.json(result);
}
