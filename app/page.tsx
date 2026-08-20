import Link from "next/link";
import { chainFamilies, supportedNetworks } from "@/config/chains";

const steps = [
  { title: "Connect wallet", body: "Use Reown AppKit. Your wallet is your identity." },
  { title: "Choose a chain", body: "Pick EVM, Solana, or TRON, then a specific network." },
  { title: "Configure token", body: "Set name, symbol, supply, and socials. Preview before you pay." },
  { title: "Create and launch", body: "Pay the platform fee, confirm on-chain, then add liquidity." },
];

const faqs = [
  {
    q: "Do I need an account?",
    a: "No. Connect a wallet. There is no email or password signup.",
  },
  {
    q: "Which chains are supported?",
    a: "EVM networks (Ethereum, BNB Chain, Polygon, Base, Arbitrum), Solana, and TRON. More can be added through configuration.",
  },
  {
    q: "Is token deployment live yet?",
    a: "Wallet connection is live. Token factories and on-chain creation ship in later phases. This app will never show a fake successful transaction.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes. The app is mobile-first and installable as a PWA from supported browsers.",
  },
];

export default function Home() {
  const mainnets = supportedNetworks.filter((network) => !network.testnet);

  return (
    <div className="flex flex-1 flex-col">
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
            Multichain launchpad
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Create Your Meme Coin in Minutes
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
            Launch your own meme coin across EVM, Solana and TRON with no coding
            required.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
            >
              Create Meme Coin
            </Link>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold dark:border-zinc-800"
            >
              Explore Tokens
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-10 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-lg font-semibold">Supported blockchains</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chainFamilies.map((family) => (
              <article
                key={family.id}
                className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
              >
                <h3 className="text-base font-semibold">{family.name}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {family.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
                  {mainnets
                    .filter((network) => network.family === family.id)
                    .map((network) => network.name)
                    .join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Tokens created", "0"],
            ["Networks live", String(mainnets.length)],
            ["Platform fees collected", "$0"],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
          <EmptyList title="Recently created tokens" />
          <EmptyList title="Trending tokens" />
          <EmptyList title="Featured launches" />
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <dl className="mt-6 space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <dt className="font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

function EmptyList({ title }: { title: string }) {
  return (
    <article className="rounded-2xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        No tokens yet. Tokens appear here after on-chain creation is verified.
      </p>
    </article>
  );
}
