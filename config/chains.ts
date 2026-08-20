import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  polygon,
  polygonAmoy,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
  tronMainnet,
  tronShastaTestnet,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

export type ChainFamily = "evm" | "solana" | "tron";

export type SupportedNetwork = {
  id: string;
  family: ChainFamily;
  name: string;
  shortName: string;
  testnet: boolean;
  explorerUrl: string;
  appKitNetwork: AppKitNetwork;
  evmChainId?: number;
  nativeSymbol?: string;
  alwaysShowInCreateFlow?: boolean;
};

export const supportedNetworks: readonly SupportedNetwork[] = [
  {
    id: "ethereum",
    family: "evm",
    name: "Ethereum",
    shortName: "ETH",
    testnet: false,
    explorerUrl: "https://etherscan.io",
    appKitNetwork: mainnet,
    evmChainId: 1,
    nativeSymbol: "ETH",
  },
  {
    id: "bnb",
    family: "evm",
    name: "BNB Chain",
    shortName: "BSC",
    testnet: false,
    explorerUrl: "https://bscscan.com",
    appKitNetwork: bsc,
    evmChainId: 56,
    nativeSymbol: "BNB",
  },
  {
    id: "polygon",
    family: "evm",
    name: "Polygon",
    shortName: "POL",
    testnet: false,
    explorerUrl: "https://polygonscan.com",
    appKitNetwork: polygon,
    evmChainId: 137,
    nativeSymbol: "POL",
  },
  {
    id: "base",
    family: "evm",
    name: "Base",
    shortName: "BASE",
    testnet: false,
    explorerUrl: "https://basescan.org",
    appKitNetwork: base,
    evmChainId: 8453,
    nativeSymbol: "ETH",
  },
  {
    id: "arbitrum",
    family: "evm",
    name: "Arbitrum",
    shortName: "ARB",
    testnet: false,
    explorerUrl: "https://arbiscan.io",
    appKitNetwork: arbitrum,
    evmChainId: 42161,
    nativeSymbol: "ETH",
  },
  {
    id: "sepolia",
    family: "evm",
    name: "Sepolia",
    shortName: "SEP",
    testnet: true,
    explorerUrl: "https://sepolia.etherscan.io",
    appKitNetwork: sepolia,
    evmChainId: 11155111,
    nativeSymbol: "ETH",
    alwaysShowInCreateFlow: true,
  },
  {
    id: "bsc-testnet",
    family: "evm",
    name: "BSC Testnet",
    shortName: "tBSC",
    testnet: true,
    explorerUrl: "https://testnet.bscscan.com",
    appKitNetwork: bscTestnet,
    evmChainId: 97,
    nativeSymbol: "tBNB",
    alwaysShowInCreateFlow: true,
  },
  {
    id: "polygon-amoy",
    family: "evm",
    name: "Polygon Amoy",
    shortName: "AMOY",
    testnet: true,
    explorerUrl: "https://amoy.polygonscan.com",
    appKitNetwork: polygonAmoy,
    evmChainId: 80002,
    nativeSymbol: "POL",
  },
  {
    id: "base-sepolia",
    family: "evm",
    name: "Base Sepolia",
    shortName: "bSEP",
    testnet: true,
    explorerUrl: "https://sepolia.basescan.org",
    appKitNetwork: baseSepolia,
    evmChainId: 84532,
    nativeSymbol: "ETH",
  },
  {
    id: "arbitrum-sepolia",
    family: "evm",
    name: "Arbitrum Sepolia",
    shortName: "aSEP",
    testnet: true,
    explorerUrl: "https://sepolia.arbiscan.io",
    appKitNetwork: arbitrumSepolia,
    evmChainId: 421614,
    nativeSymbol: "ETH",
  },
  {
    id: "solana",
    family: "solana",
    name: "Solana",
    shortName: "SOL",
    testnet: false,
    explorerUrl: "https://solscan.io",
    appKitNetwork: solana,
    nativeSymbol: "SOL",
  },
  {
    id: "solana-devnet",
    family: "solana",
    name: "Solana Devnet",
    shortName: "SOL-DEV",
    testnet: true,
    explorerUrl: "https://solscan.io/?cluster=devnet",
    appKitNetwork: solanaDevnet,
    nativeSymbol: "SOL",
  },
  {
    id: "solana-testnet",
    family: "solana",
    name: "Solana Testnet",
    shortName: "SOL-TEST",
    testnet: true,
    explorerUrl: "https://solscan.io/?cluster=testnet",
    appKitNetwork: solanaTestnet,
    nativeSymbol: "SOL",
  },
  {
    id: "tron",
    family: "tron",
    name: "TRON",
    shortName: "TRX",
    testnet: false,
    explorerUrl: "https://tronscan.org",
    appKitNetwork: tronMainnet,
    nativeSymbol: "TRX",
  },
  {
    id: "tron-shasta",
    family: "tron",
    name: "TRON Shasta",
    shortName: "SHASTA",
    testnet: true,
    explorerUrl: "https://shasta.tronscan.org",
    appKitNetwork: tronShastaTestnet,
    nativeSymbol: "TRX",
  },
];

export const chainFamilies: readonly {
  id: ChainFamily;
  name: string;
  description: string;
}[] = [
  {
    id: "evm",
    name: "EVM",
    description: "Ethereum, BNB Chain, Polygon, Base, Arbitrum, Sepolia, and BSC Testnet.",
  },
  {
    id: "solana",
    name: "Solana",
    description: "Solana mainnet and official test networks.",
  },
  {
    id: "tron",
    name: "TRON",
    description: "TRON mainnet and Shasta testnet.",
  },
];

export function getNetworksByFamily(family: ChainFamily) {
  return supportedNetworks.filter((network) => network.family === family);
}

export function getNetworkById(id: string) {
  return supportedNetworks.find((network) => network.id === id);
}

export function getExplorerTxUrl(network: SupportedNetwork, hash: string) {
  return `${network.explorerUrl}/tx/${hash}`;
}

export function getExplorerTokenUrl(network: SupportedNetwork, address: string) {
  return `${network.explorerUrl}/token/${address}`;
}

export const evmAppKitNetworks = getNetworksByFamily("evm").map(
  (network) => network.appKitNetwork,
) as [AppKitNetwork, ...AppKitNetwork[]];

export const allAppKitNetworks = supportedNetworks.map(
  (network) => network.appKitNetwork,
) as [AppKitNetwork, ...AppKitNetwork[]];
