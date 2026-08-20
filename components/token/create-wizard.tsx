"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  getNetworkById,
  type ChainFamily,
  type SupportedNetwork,
} from "@/config/chains";
import { getBlockchainService } from "@/lib/blockchain";
import type { TransactionStatus } from "@/lib/blockchain/types";
import {
  createTokenConfigSchema,
  getTokenFormDefaults,
  validateLogoFile,
  type TokenConfigInput,
  type TokenConfigValues,
} from "@/lib/tokens/schema";
import Button from "@/components/ui/button";
import ConnectButton from "@/components/wallet/connect-button";
import ChainFamilyPicker from "@/components/token/chain-family-picker";
import NetworkPicker from "@/components/token/network-picker";
import TokenFormFields from "@/components/token/token-form-fields";
import TokenPreview from "@/components/token/token-preview";
import CreateFeePanel from "@/components/token/create-fee-panel";
import CreateSuccess from "@/components/token/create-success";
import { verifyCreatedToken } from "@/lib/tokens/verify-created-token";
import { cn } from "@/lib/utils/cn";

const steps = ["Blockchain", "Network", "Configure", "Preview"] as const;
type Step = 0 | 1 | 2 | 3;

export default function CreateWizard() {
  const { address, isConnected } = useAppKitAccount();
  const [step, setStep] = useState<Step>(0);
  const [family, setFamily] = useState<ChainFamily | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [showTestnets, setShowTestnets] = useState(false);
  const [draft, setDraft] = useState<TokenConfigValues | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | undefined>();
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<{
    tokenAddress: string;
    transactionHash: string;
  } | null>(null);
  const [pendingHash, setPendingHash] = useState<string | null>(null);

  const network = networkId ? getNetworkById(networkId) : undefined;

  function selectFamily(next: ChainFamily) {
    setFamily(next);
    setNetworkId(null);
    setDraft(null);
    setLogoFile(null);
    setCreatedToken(null);
    setPendingHash(null);
    setStatus(null);
    setActionError(null);
  }

  function goToConfigure() {
    if (family && networkId) {
      setStep(2);
    }
  }

  async function payAndCreate() {
    setActionError(null);

    if (!family || !network || !draft) {
      setActionError("Finish configuring the token before paying the platform fee.");
      return;
    }

    if (!isConnected || !address) {
      setActionError(
        "Connect a wallet before paying the platform fee. Your wallet is the creator identity.",
      );
      return;
    }

    setCreatedToken(null);
    setStatus("preparing");

    try {
      let transactionHash = pendingHash;

      if (!transactionHash) {
        setStatus("waiting_for_wallet");
        const submitted = await getBlockchainService(family).createToken({
          name: draft.name,
          symbol: draft.symbol,
          decimals: draft.decimals,
          totalSupply: BigInt(draft.totalSupply),
          creatorAddress: address,
          networkId: network.id,
        });

        if (!submitted.transactionHash) {
          throw new Error(
            "The wallet did not return a transaction hash. Token creation was not marked successful.",
          );
        }

        transactionHash = submitted.transactionHash;
        setPendingHash(transactionHash);
      }

      setStatus("processing");
      const verified = await verifyCreatedToken({
        networkId: network.id,
        transactionHash,
        creatorAddress: address,
        name: draft.name,
        symbol: draft.symbol,
        totalSupply: draft.totalSupply,
        decimals: draft.decimals,
      });

      setCreatedToken(verified);
      setPendingHash(null);
      setStatus("success");
    } catch (error) {
      setStatus("failed");
      setActionError(
        error instanceof Error
          ? error.message
          : "The wallet rejected or could not start token creation.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Create token steps">
        {steps.map((label, index) => (
          <li
            key={label}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm",
              step === index
                ? "border-teal-500 font-semibold"
                : "border-zinc-200 text-zinc-500 dark:border-zinc-800",
            )}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Choose blockchain</h2>
          <ChainFamilyPicker value={family} onChange={selectFamily} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={!family} onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 1 && family ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Select network</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use the checkbox below if you want to deploy to test networks for
            testing purposes.
          </p>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5"
              checked={showTestnets}
              onChange={(event) => setShowTestnets(event.target.checked)}
            />
            Show test networks
          </label>
          <NetworkPicker
            family={family}
            value={networkId}
            showTestnets={showTestnets}
            onChange={(selected) => {
              setNetworkId(selected.id);
              setPendingHash(null);
              setCreatedToken(null);
              setStatus(null);
              setActionError(null);
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button disabled={!networkId} onClick={goToConfigure}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 && family && network ? (
        <ConfigureStep
          family={family}
          network={network}
          defaults={draft ?? getTokenFormDefaults(family)}
          logoError={logoError}
          logoUrl={logoUrl}
          creatorAddress={address}
          onLogoChange={(file) => {
            setLogoFile(file);
            setLogoError(undefined);
            setLogoUrl((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }
              return file ? URL.createObjectURL(file) : null;
            });
          }}
          onBack={() => setStep(1)}
          onContinue={(values) => {
            const logoMessage = validateLogoFile(logoFile, family);
            if (logoMessage) {
              setLogoError(logoMessage);
              return;
            }
            setDraft(values);
            setStep(3);
          }}
        />
      ) : null}

      {step === 3 && family && network && draft ? (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review and pay</h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Confirm every value before signing. The connected wallet deploys
              the token and pays the network fee to the configured treasury.
              Success is shown only after on-chain verification and a MongoDB
              save.
            </p>
            <div className="flex flex-col gap-3 sm:max-w-xs">
              <ConnectButton />
            </div>
            {createdToken && status === "success" ? (
              <CreateSuccess
                network={network}
                tokenAddress={createdToken.tokenAddress}
                transactionHash={createdToken.transactionHash}
                symbol={draft.symbol}
                decimals={draft.decimals}
                logoUrl={logoUrl}
              />
            ) : (
              <CreateFeePanel
                network={network}
                disabled={!isConnected}
                status={status}
                error={actionError}
                retryVerify={Boolean(pendingHash)}
                onPay={() => void payAndCreate()}
              />
            )}
            <Button
              variant="secondary"
              disabled={
                status === "success" ||
                status === "processing" ||
                status === "waiting_for_wallet" ||
                Boolean(pendingHash)
              }
              onClick={() => setStep(2)}
            >
              Back and edit
            </Button>
          </div>
          <TokenPreview
            network={network}
            values={draft}
            logoUrl={logoUrl}
            creatorAddress={address}
          />
        </section>
      ) : null}
    </div>
  );
}

function ConfigureStep({
  family,
  network,
  defaults,
  logoError,
  logoUrl,
  creatorAddress,
  onLogoChange,
  onBack,
  onContinue,
}: {
  family: ChainFamily;
  network: SupportedNetwork;
  defaults: TokenConfigInput;
  logoError?: string;
  logoUrl: string | null;
  creatorAddress?: string;
  onLogoChange: (file: File | null) => void;
  onBack: () => void;
  onContinue: (values: TokenConfigValues) => void;
}) {
  const schema = useMemo(() => createTokenConfigSchema(family), [family]);
  const form = useForm<TokenConfigInput, unknown, TokenConfigValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onBlur",
  });
  const values = useWatch({ control: form.control });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((data) => onContinue(data))}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <TokenFormFields
          family={family}
          register={form.register}
          errors={form.formState.errors}
          logoError={logoError}
          onLogoChange={onLogoChange}
        />
        <div className="lg:sticky lg:top-24">
          <TokenPreview
            network={network}
            values={values}
            logoUrl={logoUrl}
            creatorAddress={creatorAddress}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to preview</Button>
      </div>
    </form>
  );
}
