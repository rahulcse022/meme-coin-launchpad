import type { SupportedNetwork } from "@/config/chains";
import type { TokenConfigValues } from "@/lib/tokens/schema";
import { allocationTotal, formatPercent, formatTokenAmount } from "@/lib/tokens/format";
import { formatAddress } from "@/lib/utils/format-address";

export default function TokenPreview({
  network,
  values,
  logoUrl,
  creatorAddress,
}: {
  network: SupportedNetwork;
  values: Partial<TokenConfigValues>;
  logoUrl: string | null;
  creatorAddress?: string;
}) {
  const name = values.name?.trim() || "Token name";
  const symbol = values.symbol?.trim().toUpperCase() || "SYM";
  const total = allocationTotal({
    creatorAllocation: Number(values.creatorAllocation || 0),
    liquidityAllocation: Number(values.liquidityAllocation || 0),
    communityAllocation: Number(values.communityAllocation || 0),
    burnAllocation: Number(values.burnAllocation || 0),
  });

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Token preview
      </p>
      <div className="mt-4 flex items-center gap-3">
        {logoUrl ? (
          // Preview blob URLs are local and short-lived.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${name} logo preview`}
            className="size-16 rounded-2xl object-cover"
          />
        ) : (
          <div
            className="flex size-16 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-500 dark:bg-zinc-900"
            aria-hidden="true"
          >
            {symbol.slice(0, 3)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{name}</h3>
          <p className="text-sm text-zinc-500">Symbol: {symbol}</p>
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <PreviewRow label="Network" value={network.name} />
        <PreviewRow
          label="Creator"
          value={creatorAddress ? formatAddress(creatorAddress, 4) : "Connect a wallet"}
          mono={Boolean(creatorAddress)}
        />
        <PreviewRow
          label="Initial supply"
          value={values.initialSupply ? formatTokenAmount(values.initialSupply) : "—"}
        />
        <PreviewRow
          label="Decimals"
          value={values.decimals === undefined ? "—" : String(values.decimals)}
        />
        {values.hasAllocations && (
          <>
            <PreviewRow label="Creator allocation" value={formatPercent(Number(values.creatorAllocation || 0))} />
            <PreviewRow label="Liquidity allocation" value={formatPercent(Number(values.liquidityAllocation || 0))} />
            <PreviewRow label="Community allocation" value={formatPercent(Number(values.communityAllocation || 0))} />
            <PreviewRow label="Burn allocation" value={formatPercent(Number(values.burnAllocation || 0))} />
            <PreviewRow label="Allocation total" value={formatPercent(total)} />
          </>
        )}
      </dl>

      {values.description ? (
        <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {values.description}
        </p>
      ) : null}
    </article>
  );
}

function PreviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={`max-w-[60%] break-all text-right ${mono ? "font-mono" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
