import { z } from "zod";
import { NextRequest } from "next/server";
import { getNetworkById } from "@/config/chains";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";
import { verifyEvmTokenCreation } from "@/lib/blockchain/evm/verify-token-creation";
import { verifySolanaTokenCreation } from "@/lib/blockchain/solana/verify-token-creation";
import { getTronTransactionInfo } from "@/lib/blockchain/tron/verify";
import { saveVerifiedToken } from "@/lib/tokens/save-verified-token";
import { submitExplorerVerification } from "@/lib/blockchain/evm/verify-source-code";

const bodySchema = z.object({
  networkId: z.string().min(1),
  transactionHash: z.string().min(1),
  creatorAddress: z.string().min(1),
  name: z.string().min(2),
  symbol: z.string().min(2),
  totalSupply: z.string().regex(/^[0-9]+$/),
  decimals: z.number().int().min(0).max(18),
  verifyOnExplorer: z.boolean().optional(),
  isMintable: z.boolean().optional(),
  isBurnable: z.boolean().optional(),
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

  // --- Solana branch ---
  if (network.family === "solana") {
    let result;
    try {
      result = await verifySolanaTokenCreation({
        networkId: parsed.data.networkId,
        transactionHash: parsed.data.transactionHash,
        creatorAddress: parsed.data.creatorAddress,
        name: parsed.data.name,
        symbol: parsed.data.symbol,
        totalSupply: BigInt(parsed.data.totalSupply),
        decimals: parsed.data.decimals,
      });
    } catch (error) {
      return Response.json(
        {
          verified: false,
          reason:
            error instanceof Error
              ? error.message
              : "Solana token creation could not be verified.",
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
        isMintable: parsed.data.isMintable,
        isBurnable: parsed.data.isBurnable,
        verifyOnExplorer: parsed.data.verifyOnExplorer,
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

  // --- EVM branch ---
  if (network.family !== "evm") {
    return Response.json(
      {
        verified: false,
        reason: "Only EVM, TRON, and Solana token creation can be verified.",
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
      isMintable: parsed.data.isMintable,
      isBurnable: parsed.data.isBurnable,
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
      isMintable: parsed.data.isMintable,
      isBurnable: parsed.data.isBurnable,
      verifyOnExplorer: parsed.data.verifyOnExplorer,
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

  let explorerVerification: { success: boolean; result?: string; error?: string } | undefined = undefined;

  if (parsed.data.verifyOnExplorer && result.transactionInput) {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Wait to ensure the block explorer has indexed the newly created contract
        await new Promise((resolve) => setTimeout(resolve, 3000));

        explorerVerification = await submitExplorerVerification({
          networkId: parsed.data.networkId,
          contractAddress: result.tokenAddress,
          transactionInputHex: result.transactionInput,
        });

        if (
          !explorerVerification.success &&
          explorerVerification.error?.includes("Unable to locate ContractCode") &&
          attempts < maxAttempts
        ) {
          console.log(`Explorer verification pending, contract not found yet (attempt ${attempts}). Retrying...`);
          continue; // Retry
        }

        console.log("Explorer verification submission result:", explorerVerification);
        break; // Success or non-retriable error
      } catch (err) {
        console.error(`Failed to submit explorer verification (attempt ${attempts}):`, err);
        explorerVerification = {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
        if (attempts >= maxAttempts) {
          break;
        }
      }
    }
  }

  return Response.json({
    verified: true,
    tokenAddress: result.tokenAddress,
    transactionHash: result.transactionHash,
    explorerVerification,
  });
}
