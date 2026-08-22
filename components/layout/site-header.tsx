"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { navItems } from "@/config/site";
import BrandMark from "@/components/layout/brand-mark";
import ThemeToggle from "@/components/layout/theme-toggle";
import ConnectButton from "@/components/wallet/connect-button";
import { cn } from "@/lib/utils/cn";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandMark />

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]",
                pathname === item.href
                  ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="hidden lg:block">
            <ConnectButton />
          </div>
          <button
            type="button"
            className="relative z-50 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-800 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-zinc-200/80 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden dark:border-zinc-800 dark:bg-zinc-900"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center rounded-xl px-3 text-base font-medium",
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-700 dark:text-zinc-200",
                )}
              >
                {item.href === "/create" ? "Create Token" : item.label}
              </Link>
            ))}
          </nav>



          <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-zinc-50/80 p-4 dark:border-zinc-800/60 dark:bg-zinc-900/40 space-y-4">
            {/* Wallet Connection Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Wallet Connection
                </span>
                <span className="text-xs text-zinc-500 truncate">
                  Manage your Web3 identity
                </span>
              </div>
              <div className="shrink-0">
                <ConnectButton />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/60" />

            {/* Theme Switch Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Theme Mode
                </span>
                <span className="text-xs text-zinc-500">
                  Switch between light and dark
                </span>
              </div>
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
