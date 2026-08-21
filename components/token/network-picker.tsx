import { getNetworksByFamily, type ChainFamily, type SupportedNetwork } from "@/config/chains";
import { cn } from "@/lib/utils/cn";

export default function NetworkPicker({
  family,
  value,
  showTestnets,
  onChange,
}: {
  family: ChainFamily;
  value: string | null;
  showTestnets: boolean;
  onChange: (network: SupportedNetwork) => void;
}) {
  const networks = getNetworksByFamily(family);
  const mainnets = networks.filter((network) => !network.testnet);
  const featuredTestnets = networks.filter(
    (network) => network.testnet && network.alwaysShowInCreateFlow,
  );
  const extraTestnets = networks.filter(
    (network) => network.testnet && !network.alwaysShowInCreateFlow,
  );

  return (
    <div className="space-y-6">
      <NetworkGroup title="Mainnets" networks={mainnets} value={value} onChange={onChange} />
      {showTestnets && (featuredTestnets.length > 0 || extraTestnets.length > 0) ? (
        <NetworkGroup
          title="Testnets"
          networks={[...featuredTestnets, ...extraTestnets]}
          value={value}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

function NetworkGroup({
  title,
  networks,
  value,
  onChange,
}: {
  title: string;
  networks: SupportedNetwork[];
  value: string | null;
  onChange: (network: SupportedNetwork) => void;
}) {
  if (networks.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-zinc-500">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {networks.map((network) => {
          const selected = value === network.id;

          return (
            <button
              key={network.id}
              type="button"
              onClick={() => onChange(network)}
              aria-pressed={selected}
              className={cn(
                "min-h-16 rounded-2xl border p-4 text-left transition-colors",
                selected
                  ? "border-[color:var(--accent)] bg-[color:var(--accent-subtle)]"
                  : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              )}
            >
              <span className="block font-semibold">{network.name}</span>
              <span className="mt-1 block text-sm text-zinc-500">
                {network.testnet ? "Testnet" : "Mainnet"} · {network.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
