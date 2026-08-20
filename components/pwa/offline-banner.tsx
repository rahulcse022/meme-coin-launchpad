"use client";

import { useOffline } from "next/offline";

export default function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto w-full max-w-7xl">
        You are offline. Some blockchain functionality requires an internet
        connection.
      </div>
    </div>
  );
}
