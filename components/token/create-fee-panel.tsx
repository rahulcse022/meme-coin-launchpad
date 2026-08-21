"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppKitNetwork } from "@reown/appkit/react";
import type { SupportedNetwork } from "@/config/chains";
import {
  formatPlatformFee,
  getPlatformFee,
} from "@/lib/fees/get-platform-fee";
import type { TransactionStatus } from "@/lib/blockchain/types";
import { formatAddress } from "@/lib/utils/format-address";
import Button from "@/components/ui/button";

const statusCopy: Record<TransactionStatus, string> = {
  preparing: "Preparing token creation...",
  waiting_for_wallet: "Waiting for wallet and network confirmation...",
  waiting_for_confirmation: "Waiting for the transaction to confirm...",
  processing: "Verifying the transaction on the backend...",
  success: "Verified on-chain",
  failed: "Creation failed",
};

const busyStatuses: TransactionStatus[] = [
  "preparing",
  "waiting_for_wallet",
  "waiting_for_confirmation",
  "processing",
];

export default function CreateFeePanel({
  network,
  disabled,
  status,
  error,
  retryVerify = false,
  onPay,
}: {
  network: SupportedNetwork;
  disabled: boolean;
  status: TransactionStatus | null;
  error: string | null;
  retryVerify?: boolean;
  onPay: () => void;
}) {
  const { caipNetwork, switchNetwork } = useAppKitNetwork();
  const isCorrectNetwork = caipNetwork?.id === network.appKitNetwork.id;

  const feeQuery = useQuery({
    queryKey: ["platform-fee", network.id],
    queryFn: () => getPlatformFee(network.id),
  });

  const handleSwitchNetwork = async () => {
    try {
      if (switchNetwork) {
        await switchNetwork(network.appKitNetwork);
      }
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <h2 className="text-lg font-semibold">Token creation fee</h2>
      {feeQuery.isLoading ? (
        <p className="mt-3 text-sm text-zinc-500">Loading current platform fee...</p>
      ) : null}
      {feeQuery.error instanceof Error ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {feeQuery.error.message}
        </p>
      ) : null}
      {feeQuery.data ? (
        <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Platform fee for {network.name}:{" "}
            <strong className="text-zinc-950 dark:text-white">
              {formatPlatformFee(feeQuery.data)}
            </strong>
          </p>
          <p>
            Fee recipient:{" "}
            <strong className="font-mono text-zinc-950 dark:text-white">
              {formatAddress(feeQuery.data.recipient, 6)}
            </strong>
          </p>
        </div>
      ) : null}
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        The connected wallet deploys the token. The native fee is sent to the
        treasury wallet in config/creation-fees.ts. Success is shown only after
        on-chain verification and a MongoDB save.
      </p>
      {status ? (
        <p className="mt-3 text-sm font-medium" aria-live="polite">
          {statusCopy[status]}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {!isCorrectNetwork && !disabled ? (
        <Button
          variant="gradient"
          className="mt-5 w-full"
          onClick={handleSwitchNetwork}
        >
          Switch Network to {network.name}
        </Button>
      ) : (
        <Button
          variant="gradient"
          className="mt-5 w-full"
          disabled={
            disabled ||
            feeQuery.isLoading ||
            Boolean(feeQuery.error) ||
            status === "success" ||
            (status !== null && busyStatuses.includes(status))
          }
          onClick={onPay}
        >
          {status === "success"
            ? "Token created"
            : retryVerify
              ? "Retry verification"
              : "Pay & Create Token"}
        </Button>
      )}
    </section>
  );
}
