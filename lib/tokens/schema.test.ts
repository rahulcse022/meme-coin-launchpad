import { createTokenConfigSchema, getTokenFormDefaults } from "@/lib/tokens/schema";
import { describe, expect, it } from "vitest";

const valid = {
  ...getTokenFormDefaults("evm"),
  name: "Doge Killer",
  symbol: "dgk",
  description: "Community meme token for the launchpad.",
};

describe("createTokenConfigSchema", () => {
  it("uppercases the symbol and accepts a complete EVM config", () => {
    const parsed = createTokenConfigSchema("evm").parse(valid);
    expect(parsed.symbol).toBe("DGK");
    expect(parsed.decimals).toBe(18);
  });

  it("rejects allocations that do not sum to 100 when hasAllocations is true", () => {
    const result = createTokenConfigSchema("evm").safeParse({
      ...valid,
      hasAllocations: true,
      creatorAllocation: 50,
      liquidityAllocation: 50,
      communityAllocation: 50,
      burnAllocation: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/add up to 100%/);
    }
  });

  it("skips allocation checks when hasAllocations is false", () => {
    const result = createTokenConfigSchema("evm").safeParse({
      ...valid,
      hasAllocations: false,
      creatorAllocation: 50,
      liquidityAllocation: 50,
      communityAllocation: 50,
      burnAllocation: 0,
    });

    expect(result.success).toBe(true);
  });

  it("rejects Solana decimals above the configured maximum", () => {
    const result = createTokenConfigSchema("solana").safeParse({
      ...valid,
      decimals: 18,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a short name", () => {
    const result = createTokenConfigSchema("tron").safeParse({
      ...valid,
      name: "A",
      decimals: 6,
    });

    expect(result.success).toBe(false);
  });
});
