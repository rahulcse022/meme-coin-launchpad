import { NextRequest } from "next/server";
import { getNetworkById } from "@/config/chains";
import { getCreationFee } from "@/config/creation-fees";

export async function GET(request: NextRequest) {
  const networkId = request.nextUrl.searchParams.get("network");

  if (!networkId) {
    return Response.json(
      { error: "Query parameter \"network\" is required." },
      { status: 400 },
    );
  }

  const network = getNetworkById(networkId);

  if (!network) {
    return Response.json(
      { error: `Network "${networkId}" is not in the launchpad configuration.` },
      { status: 404 },
    );
  }

  const fee = getCreationFee(networkId);

  if (!fee.active) {
    return Response.json(
      { error: `Set FEE_RECIPIENT_ADDRESS in config/creation-fees.ts before creating tokens on ${network.name}.` },
      { status: 404 },
    );
  }

  return Response.json(fee);
}
