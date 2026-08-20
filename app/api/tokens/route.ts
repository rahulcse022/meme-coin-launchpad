import { NextRequest } from "next/server";
import { isAddress } from "viem";
import { listTokensByCreator } from "@/lib/tokens/list-creator-tokens";

export async function GET(request: NextRequest) {
  const creator = request.nextUrl.searchParams.get("creator")?.trim();

  if (!creator || !isAddress(creator)) {
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
