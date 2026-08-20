import { describe, expect, it } from "vitest";
import {
  CREATION_FEE_AMOUNT,
  getConfiguredPlatformFees,
  getCreationFee,
  getCreationFeeBaseUnits,
  getFeeRecipientAddress,
} from "@/config/creation-fees";

describe("creation fees", () => {
  it("charges 0.1 native tokens on every configured network", () => {
    const fees = getConfiguredPlatformFees();

    expect(fees.length).toBeGreaterThan(0);
    expect(fees.every((fee) => fee.amount === CREATION_FEE_AMOUNT)).toBe(
      true,
    );
  });

  it("keeps fees inactive until FEE_RECIPIENT_ADDRESS is a real wallet", () => {
    try {
      const recipient = getFeeRecipientAddress();
      expect(getCreationFee("sepolia").active).toBe(true);
      expect(getCreationFee("sepolia").recipient).toBe(recipient);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(getCreationFee("sepolia").active).toBe(false);
    }
  });

  it("uses tBNB on BSC Testnet and ETH on Sepolia", () => {
    expect(getCreationFee("bsc-testnet")).toMatchObject({
      amount: "0.1",
      currency: "tBNB",
      decimals: 18,
    });
    expect(getCreationFee("sepolia")).toMatchObject({
      amount: "0.1",
      currency: "ETH",
      decimals: 18,
    });
  });

  it("converts the EVM fee to 0.1 * 10^18 base units", () => {
    const expected = BigInt("100000000000000000");
    expect(getCreationFeeBaseUnits("bsc-testnet")).toBe(expected);
    expect(getCreationFeeBaseUnits("sepolia")).toBe(expected);
    expect(getCreationFeeBaseUnits("ethereum")).toBe(expected);
    expect(getCreationFeeBaseUnits("bnb")).toBe(expected);
  });
});
