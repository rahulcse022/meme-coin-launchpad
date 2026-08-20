"use client";

import { useState } from "react";
import {
  getExplorerTokenUrl,
  getExplorerTxUrl,
  type SupportedNetwork,
} from "@/config/chains";
import { formatAddress } from "@/lib/utils/format-address";
import Button from "@/components/ui/button";

export default function CreateSuccess({
  network,
  tokenAddress,
  transactionHash,
}: {
  network: SupportedNetwork;
  tokenAddress: string;
  transactionHash: string;
}) {
  return (
    <section
      className="rounded-2xl border border-teal-500/40 bg-teal-50 p-5 dark:bg-teal-950/30"
      role="status"
    >
      <h2 className="text-lg font-semibold">Token created</h2>
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
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950"
        >
          View token
        </a>
        <a
          href={getExplorerTxUrl(network, transactionHash)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950"
        >
          View transaction
        </a>
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
