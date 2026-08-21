"use client";
import type React from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { formatAddress } from "@/lib/utils/format-address";

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => void open({ view: "Account" })}
        aria-label={`Wallet connected: ${formatAddress(address, 4)}. Open account menu.`}
        className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-850"
      >
        {/* Signature: address-derived gradient avatar, unique per wallet */}
        <span className="relative flex size-8 shrink-0">
          <span
            className="size-8 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
            style={{ backgroundImage: addressToGradient(address) }}
          />
          {/* Live connection indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
            <span className="size-2 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-500" />
            <span className="absolute size-2 animate-ping rounded-full bg-emerald-500/60" />
          </span>
        </span>

        <span className="font-mono text-xs tracking-tight tabular-nums">
          {formatAddress(address, 4)}
        </span>

        <ChevronIcon className="size-3.5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-y-0.5 dark:text-zinc-500" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void open({ view: "Connect" })}
      className="group inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      <WalletIcon className="size-4 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
      Connect Wallet
    </button>
  );
}

/**
 * Deterministic two-tone gradient derived from the wallet address.
 * Gives each connected wallet a stable, unique visual identity
 * instead of a generic icon — same idea as Rainbow/MetaMask avatars,
 * but done in pure CSS with no extra dependency.
 */
function addressToGradient(address: string): string {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < address.length; i++) {
    const code = address.charCodeAt(i);
    h1 = (h1 * 31 + code) % 360;
    h2 = (h2 * 17 + code) % 360;
  }
  return `linear-gradient(135deg, hsl(${h1}, 75%, 60%), hsl(${h2}, 80%, 50%))`;
}

function ChevronIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M16 12h3" />
    </svg>
  );
}