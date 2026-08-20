const rpcUrls: Record<string, string | undefined> = {
  sepolia:
    process.env.EVM_RPC_SEPOLIA ||
    process.env.EVM_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com",
  "bsc-testnet":
    process.env.EVM_RPC_BSC_TESTNET ||
    process.env.EVM_RPC_URL ||
    "https://bsc-testnet-rpc.publicnode.com",
  ethereum: process.env.EVM_RPC_ETHEREUM || process.env.EVM_RPC_URL,
  bnb: process.env.EVM_RPC_BNB || process.env.EVM_RPC_URL,
  polygon: process.env.EVM_RPC_POLYGON || process.env.EVM_RPC_URL,
  base: process.env.EVM_RPC_BASE || process.env.EVM_RPC_URL,
  arbitrum: process.env.EVM_RPC_ARBITRUM || process.env.EVM_RPC_URL,
};

export function getEvmRpcUrl(networkId: string) {
  return rpcUrls[networkId];
}
