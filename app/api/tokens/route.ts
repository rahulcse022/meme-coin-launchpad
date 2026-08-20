import { NextRequest } from "next/server";
import { isAddress } from "viem";
import { listTokensByCreator } from "@/lib/tokens/list-creator-tokens";

/** Accept EVM (0x hex), Tron (T... base58, 34 chars), and Solana (base58, 32-44 chars) addresses */
function isValidWalletAddress(address: string): boolean {
  // EVM: 0x + 40 hex chars
  if (isAddress(address)) return true;
  // Tron: starts with T, 34 chars base58
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return true;
  // Solana: 32-44 base58 chars (no 0/O/I/l)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return true;
  return false;
}

export async function GET(request: NextRequest) {
  const creator = request.nextUrl.searchParams.get("creator")?.trim();

  if (!creator || !isValidWalletAddress(creator)) {
    return Response.json(
      { error: "Query parameter \"creator\" must be a valid wallet address." },
      { status: 400 },
    );
  }

  try {
    const payload = await listTokensByCreator(creator);
    return Response.json(payload);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load tokens for this wallet.",
      },
      { status: 500 },
    );
  }
}
