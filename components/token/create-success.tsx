"use client";

import { useState } from "react";
import {
  getExplorerTokenUrl,
  getExplorerTxUrl,
  type SupportedNetwork,
} from "@/config/chains";
import { formatAddress } from "@/lib/utils/format-address";
import Button from "@/components/ui/button";
import { useWatchAsset } from "wagmi";

export default function CreateSuccess({
  network,
  tokenAddress,
  transactionHash,
  symbol,
  decimals,
  logoUrl,
}: {
  network: SupportedNetwork;
  tokenAddress: string;
  transactionHash: string;
  symbol: string;
  decimals: number;
  logoUrl?: string | null;
}) {
  const { watchAsset } = useWatchAsset();
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--accent-muted)", background: "var(--accent-subtle)" }}
      role="status"
    >
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${symbol} logo`}
            className="size-9 rounded-full object-cover"
            style={{ outline: "2px solid var(--accent-muted)", outlineOffset: "2px" }}
          />
        )}
        Token created
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Backend verification confirmed this token on {network.name}. A wallet
        hash alone was not enough.
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <CopyRow label="Token address" value={tokenAddress} display={formatAddress(tokenAddress, 6)} />
        <CopyRow
          label="Transaction"
          value={transactionHash}
          display={formatAddress(transactionHash, 6)}
        />
      </dl>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={getExplorerTokenUrl(network, tokenAddress)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
        >
          View token
        </a>
        <a
          href={getExplorerTxUrl(network, transactionHash)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 shadow-sm transition-all active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
        >
          View transaction
        </a>

        {network.family === "evm" && (
          <button
            type="button"
            onClick={() =>
              watchAsset({
                type: "ERC20",
                options: {
                  address: tokenAddress,
                  symbol,
                  decimals,
                  image: logoUrl ?? undefined,
                },
              })
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 shadow-sm transition-all active:scale-[0.98] cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
          >
            Add token to wallet
          </button>
        )}
      </div>
    </section>
  );
}

function CopyRow({
  label,
  value,
  display,
}: {
  label: string;
  value: string;
  display: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 flex flex-wrap items-center gap-2 font-mono">
        <span>{display}</span>
        <Button variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </dd>
    </div>
  );
}
