import { describe, expect, it } from "vitest";
import { scaleTokenAmount } from "@/lib/blockchain/evm/scale-amount";

describe("scaleTokenAmount", () => {
  it("scales whole tokens by 18 decimals", () => {
    expect(scaleTokenAmount(BigInt(1), 18)).toBe(BigInt("1000000000000000000"));
  });

  it("leaves the amount unchanged at 0 decimals", () => {
    expect(scaleTokenAmount(BigInt(1000), 0)).toBe(BigInt(1000));
  });

  it("scales by 6 decimals", () => {
    expect(scaleTokenAmount(BigInt(5), 6)).toBe(BigInt(5_000_000));
  });
});
