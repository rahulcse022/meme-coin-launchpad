import { getNetworkById } from "@/config/chains";
import { type PlatformFeeQuote } from "@/config/creation-fees";

function isPlatformFeeQuote(value: unknown): value is PlatformFeeQuote {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.chain === "string" &&
    typeof record.networkId === "string" &&
    typeof record.amount === "string" &&
    typeof record.currency === "string" &&
    typeof record.decimals === "number" &&
    typeof record.recipient === "string" &&
    typeof record.active === "boolean"
  );
}

export async function getPlatformFee(networkId: string): Promise<PlatformFeeQuote> {
  const network = getNetworkById(networkId);

  if (!network) {
    throw new Error(`Network "${networkId}" is not in the launchpad configuration.`);
  }

  const response = await fetch(
    `/api/platform-fee?network=${encodeURIComponent(networkId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(
      payload?.error ||
        `The fee service returned ${response.status}. Token creation is paused until the platform fee can be loaded.`,
    );
  }

  const payload: unknown = await response.json();

  if (!isPlatformFeeQuote(payload) || payload.networkId !== networkId) {
    throw new Error(
      "The fee service returned an invalid payload. The displayed fee was not trusted.",
    );
  }

  if (!payload.active) {
    throw new Error(
      `Token creation is paused on ${network.name}. The platform fee is not active.`,
    );
  }

  return payload;
}

export function formatPlatformFee(fee: PlatformFeeQuote) {
  return `${fee.amount} ${fee.currency}`;
}
