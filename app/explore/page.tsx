import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Explore Tokens</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Search, filters, and market data will appear after tokens are created
        and indexed. No placeholder prices or fake volume are shown.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <p className="font-medium">No tokens to display</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Connect a wallet and create a token once on-chain deployment is
          enabled.
        </p>
      </div>
    </div>
  );
}
