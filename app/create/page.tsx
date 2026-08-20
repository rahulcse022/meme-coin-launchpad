import type { Metadata } from "next";
import CreateWizard from "@/components/token/create-wizard";
import ConnectButton from "@/components/wallet/connect-button";

export const metadata: Metadata = {
  title: "Create",
};

export default function CreatePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Create Meme Coin</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Choose a chain, configure the token, then preview and pay. The
            connected wallet deploys the token and pays the hardcoded network
            fee to the treasury in config/creation-fees.ts. Success is shown
            only after on-chain verification and a MongoDB save.
          </p>
        </div>
        <ConnectButton />
      </div>
      <div className="mt-8">
        <CreateWizard />
      </div>
    </div>
  );
}
