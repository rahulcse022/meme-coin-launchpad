"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import { formatAddress } from "@/lib/utils/format-address";
import { formatTokenAmount } from "@/lib/tokens/format";
import type {
  CreatorToken,
  CreatorTokenStats,
} from "@/lib/tokens/creator-token";
import ConnectButton from "@/components/wallet/connect-button";
import Button from "@/components/ui/button";

type TokensResponse = {
  tokens: CreatorToken[];
  stats: CreatorTokenStats;
};

async function fetchCreatorTokens(address: string): Promise<TokensResponse> {
  const response = await fetch(
    `/api/tokens?creator=${encodeURIComponent(address)}`,
    { cache: "no-store" },
  );
  const payload = (await response.json().catch(() => null)) as
    | TokensResponse
    | { error?: string }
    | null;

  if (!response.ok || !payload || !("tokens" in payload)) {
    throw new Error(
      (payload && "error" in payload && payload.error) ||
      "Could not load tokens for this wallet.",
    );
  }

  return payload;
}

function formatFees(fees: CreatorTokenStats["fees"]) {
  if (fees.length === 0) {
    return "0";
  }

  return fees.map((fee) => `${fee.amount} ${fee.currency}`).join(" + ");
}

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DashboardPage() {
  const { address, isConnected, status } = useAppKitAccount();
  const tokensQuery = useQuery({
    queryKey: ["creator-tokens", address],
    queryFn: () => fetchCreatorTokens(address!),
    enabled: Boolean(isConnected && address),
  });

  const tokens = tokensQuery.data?.tokens ?? [];
  const stats = tokensQuery.data?.stats;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent w-fit">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Your connected wallet is your account. Tokens appear here after they are
        verified on-chain and saved to the database.
      </p>



      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total tokens created"
          value={
            !isConnected ? "—" : tokensQuery.isLoading ? "…" : String(stats?.totalTokens ?? 0)
          }
        />
        <StatCard
          label="Platform fees paid"
          value={
            !isConnected
              ? "—"
              : tokensQuery.isLoading
                ? "…"
                : formatFees(stats?.fees ?? [])
          }
        />
        <StatCard
          label="Total liquidity"
          value="—"
          hint="Liquidity is not recorded yet."
        />
      </section>

      {tokensQuery.error instanceof Error ? (
        <p role="alert" className="mt-6 text-sm text-red-600 dark:text-red-400">
          {tokensQuery.error.message}
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <h2 className="font-semibold">My tokens</h2>
        {!isConnected ? (
          <p className="mt-2 text-sm leading-6 text-zinc-650 dark:text-zinc-400">
            Connect the wallet that deployed the token to see it here.
          </p>
        ) : tokensQuery.isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Loading tokens from the database...</p>
        ) : tokens.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-zinc-650 dark:text-zinc-400">
            No tokens yet for this wallet. Create a token and wait for
            verification to finish.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4">
            {tokens.map((token) => (
              <li key={token.id}>
                <TokenCard token={token} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </article>
  );
}

function TokenCard({ token }: { token: CreatorToken }) {
  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {token.name}{" "}
            <span className="text-sm font-medium text-zinc-500">{token.symbol}</span>
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {token.networkName} · {token.decimals} decimals · created{" "}
            {formatCreatedAt(token.createdAt)}
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Fee paid:{" "}
          <strong>
            {token.feeAmount} {token.feeCurrency}
          </strong>
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Total supply
          </dt>
          <dd className="mt-1 font-medium">{formatTokenAmount(token.totalSupply)}</dd>
        </div>
        <CopyField label="Token address" value={token.tokenAddress} href={token.explorerTokenUrl} />
        <CopyField label="Transaction" value={token.transactionHash} href={token.explorerTxUrl} />
        <CopyField label="Creator" value={token.creatorAddress} />
      </dl>
    </article>
  );
}

function CopyField({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | null;
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
      <dd className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
        <span className="break-all">{formatAddress(value, 6)}</span>
        <Button variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Explorer
          </a>
        ) : null}
      </dd>
    </div>
  );
}
