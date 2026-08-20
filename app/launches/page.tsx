import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launches",
};

export default function LaunchesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Launches</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Liquidity and DEX integrations are not implemented yet. When a DEX is
        missing, the product will mark it as Coming Soon instead of simulating
        a pool.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <p className="font-medium">Coming Soon</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Uniswap, PancakeSwap, Raydium, and TRON DEX adapters will land in a
          later phase.
        </p>
      </div>
    </div>
  );
}
