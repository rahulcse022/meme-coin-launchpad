import Image from "next/image";
import Link from "next/link";
import { chainFamilies, supportedNetworks } from "@/config/chains";

const steps = [
  { title: "Connect Wallet", body: "Use Reown AppKit. Your wallet serves as your decentralized identity." },
  { title: "Choose Network", body: "Pick EVM, Solana, or TRON, then select your desired target chain." },
  { title: "Configure Token", body: "Set name, symbol, total supply, and social metadata with real-time preview." },
  { title: "Launch On-Chain", body: "Pay the platform fee, confirm the transaction, and instantly seed liquidity." },
];

const faqs = [
  {
    q: "Do I need an account?",
    a: "No. Connect your Web3 wallet directly. There are no email logins, passwords, or KYC requirements.",
  },
  {
    q: "Which chains are supported?",
    a: "EVM networks (Ethereum, BNB Chain, Polygon, Base, Arbitrum), Solana, and TRON. Additional networks are added continuously.",
  },
  {
    q: "Is token deployment live yet?",
    a: "Wallet connection is fully live. Token deployment contracts roll out gradually. The app will never fake or simulate on-chain transactions.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes. The UI is fully mobile-optimized and acts as an installable Progressive Web App (PWA).",
  },
];

export default function Home() {
  const mainnets = supportedNetworks.filter((network) => !network.testnet);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 opacity-40 blur-[120px] dark:opacity-20"
        style={{ background: "radial-gradient(ellipse at top, var(--accent, #6366f1), transparent 70%)" }}
      />

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* Left: Headline & CTA */}
            <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "var(--accent, #6366f1)" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent, #6366f1)" }} />
                </span>
                <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-400">
                  Multichain Launchpad Engine
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-6xl/tight">
                Create & Launch <br />
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Meme Coins
                </span> in Minutes
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
                Deploy custom tokens across EVM, Solana, and TRON natively. Zero coding needed, instant liquidity setup, and low protocol fees.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
                <Link
                  href="/create"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Create Meme Coin
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white/50 px-7 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/80"
                >
                  Explore Tokens
                </Link>
              </div>
            </div>

            {/* Right: Graphic */}
            <div className="flex justify-center lg:col-span-5">
              <HeroGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* Blockchains Supported Section */}
      <section className="border-y border-zinc-200/80 bg-white/60 px-4 py-16 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/40 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent w-fit mx-auto">Supported Blockchains</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Launch seamlessly across top layer-1s and scaling solutions.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chainFamilies.map((family) => (
              <div
                key={family.id}
                className="group relative rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <h3 className="text-lg font-bold">{family.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {family.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {mainnets
                    .filter((network) => network.family === family.id)
                    .map((network) => (
                      <span key={network.name} className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {network.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent w-fit mx-auto">How It Works</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Four straightforward steps to bring your token live on-chain.</p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Tokens Created", "0"],
            ["Networks Live", String(mainnets.length)],
            ["Platform Fees Collected", "$0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Token Lists Grid */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
          <EmptyList title="Recently Created Tokens" />
          <EmptyList title="Trending Tokens" />
          <EmptyList title="Featured Launches" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent w-fit mx-auto">Frequently Asked Questions</h2>
          </div>
          <dl className="mt-10 space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <dt className="text-base font-bold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
    <div className="flex min-h-[160px] flex-col justify-between rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
      <h3 className="font-bold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        No tokens deployed yet. Verified tokens will automatically appear here once launched on-chain.
      </p>
    </div>
  );
}

function HeroGraphic() {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 360, height: 360 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(0deg) translateX(136px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(136px) rotate(-360deg); }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(360deg) translateX(92px) rotate(-360deg); }
          to   { transform: rotate(0deg) translateX(92px) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.2); }
        }
        @keyframes spin-gears {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-gears-rev {
          to { transform: rotate(-360deg); }
        }
        .animate-orbit-cw { animation: orbit-cw 16s linear infinite; }
        .animate-orbit-ccw { animation: orbit-ccw 12s linear infinite; }
        .animate-float { animation: float 4.5s ease-in-out infinite; }
        .animate-gears { animation: spin-gears 25s linear infinite; }
        .animate-gears-rev { animation: spin-gears-rev 20s linear infinite; }
      `}</style>

      {/* Glow Backdrop */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-3xl" />

      {/* Orbital laser beam vectors */}
      <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 360 360" fill="none">
        {/* Outer dash rail */}
        <circle cx="180" cy="180" r="136" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/40" strokeWidth="1" strokeDasharray="6 6" />
        {/* Inner solid rail */}
        <circle cx="180" cy="180" r="92" stroke="currentColor" className="text-zinc-200/40 dark:text-zinc-800/30" strokeWidth="1" />

        {/* Glowing laser lines traveling paths */}
        <circle cx="180" cy="180" r="136" stroke="url(#laser-gradient)" strokeWidth="2.2" strokeDasharray="60 300" className="animate-gears" style={{ transformOrigin: "180px 180px" }} />
        <circle cx="180" cy="180" r="92" stroke="url(#laser-gradient-rev)" strokeWidth="2" strokeDasharray="45 200" className="animate-gears-rev" style={{ transformOrigin: "180px 180px" }} />

        <defs>
          <linearGradient id="laser-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="laser-gradient-rev" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting Icons: Outer track (SOL, BNB, TRX) */}
      {[
        { label: "SOL", emblem: "◎", delay: "0s", color: "#14F195" },
        { label: "BNB", emblem: "♦", delay: "-5.33s", color: "#F3BA2F" },
        { label: "TRX", emblem: "▼", delay: "-10.66s", color: "#FF000F" },
      ].map(({ label, emblem, delay, color }) => (
        <div
          key={label}
          className="animate-orbit-cw absolute flex items-center justify-center"
          style={{ animationDelay: delay }}
        >
          <div
            className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/90 shadow-md backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 transition-transform duration-300 hover:scale-110"
            style={{
              boxShadow: `0 0 10px ${color}20, inset 0 0 6px rgba(255,255,255,0.05)`,
            }}
          >
            <span className="text-base font-bold leading-none" style={{ color }}>{emblem}</span>
            <span className="mt-0.5 text-[8.5px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
          </div>
        </div>
      ))}

      {/* Orbiting Icons: Inner track (ETH, BASE, ARB) */}
      {[
        { label: "ETH", emblem: "⟠", delay: "0s", color: "#627EEA" },
        { label: "BASE", emblem: "●", delay: "-4s", color: "#0052FF" },
        { label: "ARB", emblem: "▲", delay: "-8s", color: "#28A0F0" },
      ].map(({ label, emblem, delay, color }) => (
        <div
          key={label}
          className="animate-orbit-ccw absolute flex items-center justify-center"
          style={{ animationDelay: delay }}
        >
          <div
            className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-zinc-200/85 bg-white/90 shadow-sm backdrop-blur-md dark:border-zinc-800/85 dark:bg-zinc-900/90 transition-transform duration-300 hover:scale-110"
            style={{
              boxShadow: `0 0 8px ${color}15, inset 0 0 4px rgba(255,255,255,0.03)`,
            }}
          >
            <span className="text-sm font-semibold leading-none" style={{ color }}>{emblem}</span>
            <span className="mt-0.5 text-[8px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
          </div>
        </div>
      ))}

      {/* Rotating technical gear lines around central coin */}
      <div className="animate-gears absolute rounded-full border border-dashed border-zinc-300/40 dark:border-zinc-700/30" style={{ width: 156, height: 156 }} />
      <div className="animate-gears-rev absolute rounded-full border border-zinc-200/30 dark:border-zinc-800/20" style={{ width: 144, height: 144 }} />

      {/* Central Hero Core */}
      <div className="animate-float relative flex h-32 w-32 items-center justify-center">
        {/* Neon outer glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-md animate-pulse" />
        
        {/* Glossy Coin Border & Image Crop */}
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-zinc-200 bg-zinc-100 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 ring-1 ring-black/5 dark:ring-white/10">
          <Image
            src="/icons/logo.png"
            alt="MemeLaunch Logo"
            width={128}
            height={128}
            className="size-full object-cover scale-110"
          />
          {/* Glass glare effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
        </div>
      </div>

      {/* Floating Particles */}
      {[
        { top: "12%", left: "15%", delay: "0s" },
        { top: "84%", left: "22%", delay: "1.5s" },
        { top: "25%", left: "82%", delay: "0.7s" },
        { top: "78%", left: "75%", delay: "2.2s" },
      ].map((pt, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full shadow-sm"
          style={{
            top: pt.top,
            left: pt.left,
            background: "var(--accent, #6366f1)",
            boxShadow: "0 0 6px var(--accent, #6366f1)",
            animation: "twinkle 3s ease-in-out infinite",
            animationDelay: pt.delay,
          }}
        />
      ))}
    </div>
  );
}