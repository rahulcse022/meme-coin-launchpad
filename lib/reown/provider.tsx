"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import {
  appKitMetadata,
  networks,
  projectId,
  solanaAdapter,
  tronAdapter,
  wagmiAdapter,
} from "@/config";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter, solanaAdapter, tronAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: appKitMetadata,
  features: {
    analytics: true,
  },
  themeMode: "dark",

});

export default function AppProviders({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider
        config={wagmiAdapter.wagmiConfig as Config}
        initialState={initialState}
      >
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
