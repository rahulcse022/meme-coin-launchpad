import Link from "next/link";
import { navItems, siteConfig } from "@/config/site";
import { chainFamilies } from "@/config/chains";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {siteConfig.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-3 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-zinc-600 dark:text-zinc-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Networks</p>
          <ul className="mt-3 space-y-2">
            {chainFamilies.map((family) => (
              <li key={family.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                {family.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Wallet identity</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            No email signup. Your connected wallet is your account.
          </p>
        </div>
      </div>
    </footer>
  );
}
