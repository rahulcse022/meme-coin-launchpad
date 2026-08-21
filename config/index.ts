import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { TronAdapter } from "@reown/appkit-adapter-tron";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { allAppKitNetworks, evmAppKitNetworks } from "@/config/chains";
import { siteConfig } from "@/config/site";

export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

export const networks = allAppKitNetworks;

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: evmAppKitNetworks,
});

export const solanaAdapter = new SolanaAdapter();

export const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({
      openUrlWhenWalletNotFound: false,
      checkTimeout: 3000,
    }),
  ],
});

export const config = wagmiAdapter.wagmiConfig;

export const appKitMetadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  icons: [`${siteConfig.url}/icons/logo.png`],
};
