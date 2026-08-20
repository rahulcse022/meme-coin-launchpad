"use client";

import { useEffect, useState } from "react";
import { useIsClient } from "@/lib/utils/use-is-client";

const DISMISS_KEY = "memelaunch-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const isClient = useIsClient();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!isClient) {
    return null;
  }

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  const storedDismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isStandalone || dismissed || storedDismissed) {
    return null;
  }

  if (!deferredPrompt && !isIos) {
    return null;
  }

  async function install() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome !== "accepted") {
      window.localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="pointer-events-auto mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold">Install MemeLaunch</p>
        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {isIos
            ? 'On iPhone, tap Share, then “Add to Home Screen” for an app-like experience.'
            : "Install the Meme Coin Launchpad for a faster app-like experience."}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {deferredPrompt ? (
            <button
              type="button"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
              onClick={() => void install()}
            >
              Install
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium dark:border-zinc-800"
            onClick={dismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
