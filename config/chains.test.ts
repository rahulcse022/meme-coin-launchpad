import { describe, expect, it } from "vitest";
import { getNetworkById, getNetworksByFamily } from "@/config/chains";

describe("create-flow networks", () => {
  it("always includes Sepolia and BSC Testnet in the EVM family", () => {
    const evm = getNetworksByFamily("evm");
    const sepolia = getNetworkById("sepolia");
    const bscTestnet = getNetworkById("bsc-testnet");

    expect(sepolia?.alwaysShowInCreateFlow).toBe(true);
    expect(bscTestnet?.alwaysShowInCreateFlow).toBe(true);
    expect(evm.some((network) => network.id === "sepolia")).toBe(true);
    expect(evm.some((network) => network.id === "bsc-testnet")).toBe(true);
    expect(sepolia?.evmChainId).toBe(11155111);
    expect(bscTestnet?.evmChainId).toBe(97);
  });
});
