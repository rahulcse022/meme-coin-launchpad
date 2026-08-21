import { describe, expect, it } from "vitest";
import {
  getConfiguredPlatformFees,
  getCreationFee,
  getCreationFeeBaseUnits,
  getFeeRecipientAddress,
} from "@/config/creation-fees";

describe("creation fees", () => {
  it("charges native tokens on every configured network", () => {
    const fees = getConfiguredPlatformFees();

    expect(fees.length).toBeGreaterThan(0);
    expect(fees.every((fee) => fee.amount === "0.1" || fee.amount === "0.001")).toBe(
      true,
    );
  });

  it("keeps fees inactive until FEE_RECIPIENT_ADDRESS is a real wallet", () => {
    try {
      const recipient = getFeeRecipientAddress("sepolia");
      expect(getCreationFee("sepolia").active).toBe(true);
      expect(getCreationFee("sepolia").recipient).toBe(recipient);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(getCreationFee("sepolia").active).toBe(false);
    }
  });

  it("uses tBNB on BSC Testnet and ETH on Sepolia", () => {
    expect(getCreationFee("bsc-testnet")).toMatchObject({
      amount: "0.001",
      currency: "tBNB",
      decimals: 18,
    });
    expect(getCreationFee("sepolia")).toMatchObject({
      amount: "0.001",
      currency: "ETH",
      decimals: 18,
    });
  });

  it("converts the EVM fee to base units", () => {
    expect(getCreationFeeBaseUnits("bsc-testnet")).toBe(BigInt("1000000000000000"));
    expect(getCreationFeeBaseUnits("sepolia")).toBe(BigInt("1000000000000000"));
    expect(getCreationFeeBaseUnits("ethereum")).toBe(BigInt("1000000000000000"));
    expect(getCreationFeeBaseUnits("bnb")).toBe(BigInt("1000000000000000"));
  });
});
