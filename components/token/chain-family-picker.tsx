import { chainFamilies, type ChainFamily } from "@/config/chains";
import { cn } from "@/lib/utils/cn";

export default function ChainFamilyPicker({
  value,
  onChange,
}: {
  value: ChainFamily | null;
  onChange: (family: ChainFamily) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {chainFamilies.map((family) => {
        const selected = value === family.id;

        return (
          <button
            key={family.id}
            type="button"
            onClick={() => onChange(family.id)}
            aria-pressed={selected}
            className={cn(
              "min-h-24 rounded-2xl border p-4 text-left transition-colors",
              selected
                ? "border-[color:var(--accent)] bg-[color:var(--accent-subtle)]"
                : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900",
            )}
          >
            <span className="block text-base font-semibold">{family.name}</span>
            <span className="mt-2 block text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {family.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
