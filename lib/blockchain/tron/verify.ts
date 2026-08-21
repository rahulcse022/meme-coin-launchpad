import crypto from "crypto";

const SHASTA_FULL_NODE = "https://api.shasta.trongrid.io";
const TRON_FULL_NODE = "https://api.trongrid.io";

/**
 * Fetches Tron transaction info from TronGrid and returns the deployed contract address.
 * Throws if the transaction is not found, failed, or has no contract address.
 */
export async function getTronTransactionInfo(
  hash: string,
  networkId: string,
): Promise<string> {
  const node = networkId === "tron-shasta" ? SHASTA_FULL_NODE : TRON_FULL_NODE;

  // Wait up to 20 seconds for transaction confirmation
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    try {
      const res = await fetch(`${node}/wallet/gettransactioninfobyid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: hash }),
      });

      const info = await res.json() as {
        id?: string;
        contract_address?: string;
        receipt?: { result?: string };
        result?: string;
      };

      if (!info?.id) {
        lastError = "The transaction was not found on this TRON network.";
        continue;
      }

      if (info.receipt?.result === "REVERT" || info.result === "FAILED") {
        throw new Error("The TRON contract deployment transaction reverted. No token was created.");
      }

      if (!info.contract_address) {
        lastError = "The transaction was found but has no contract address yet.";
        continue;
      }

      // Convert TronGrid hex address format (prefixed 41) to base58 using a minimal approach
      // TronGrid returns hex without 0x prefix but with 41 prefix (mainnet) or a4 (shasta)
      const hexAddr = info.contract_address;
      return hexToBase58CheckAddress(hexAddr);
    } catch (error) {
      if (error instanceof Error && error.message.includes("reverted")) {
        throw error;
      }
      lastError = error instanceof Error ? error.message : "Network error contacting TronGrid.";
    }
  }

  throw new Error(
    lastError ||
      "The TRON transaction could not be confirmed after waiting 20 seconds. Try again shortly.",
  );
}

/**
 * Converts a hex address (as returned by TronGrid) to a base58check TRON address.
 * TronGrid returns addresses as hex strings like "41a614f803b6fd780986a42c78ec9c7f77e6ded38"
 */
function hexToBase58CheckAddress(hexAddress: string): string {
  // We use a minimal SHA-256 + Base58 implementation
  // Tron addresses are: base58check(0x41 + 20-byte-pubkey-hash)
  // TronGrid already returns the full 21-byte hex (41 prefix + 20 bytes)
  const bytes = hexStringToBytes(hexAddress);
  return base58CheckEncode(bytes);
}

function hexStringToBytes(hex: string): Uint8Array {
  const len = hex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58CheckEncode(payload: Uint8Array): string {
  const hash1 = crypto.createHash("sha256").update(payload).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.slice(0, 4);

  const full = new Uint8Array(payload.length + 4);
  full.set(payload);
  full.set(checksum, payload.length);

  // Convert to base58
  let num = BigInt("0x" + Buffer.from(full).toString("hex"));
  let result = "";

  while (num > BigInt(0)) {
    const remainder = num % BigInt(58);
    num = num / BigInt(58);
    result = BASE58_ALPHABET[Number(remainder)] + result;
  }

  // Add leading '1's for leading zero bytes
  for (const byte of full) {
    if (byte !== 0) break;
    result = "1" + result;
  }

  return result;
}
