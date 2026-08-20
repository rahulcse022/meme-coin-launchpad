"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ChainFamily } from "@/config/chains";
import { getTokenRules } from "@/config/token-rules";
import type { TokenConfigInput } from "@/lib/tokens/schema";
import Field, { inputClassName } from "@/components/ui/field";

export default function TokenFormFields({
  family,
  register,
  errors,
  logoError,
  onLogoChange,
}: {
  family: ChainFamily;
  register: UseFormRegister<TokenConfigInput>;
  errors: FieldErrors<TokenConfigInput>;
  logoError?: string;
  onLogoChange: (file: File | null) => void;
}) {
  const rules = getTokenRules(family);
  const accept = rules.acceptedLogoTypes.join(",");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic information</h2>
        <Field label="Token name" htmlFor="name" error={errors.name?.message}>
          <input
            id="name"
            autoComplete="off"
            className={inputClassName}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>
        <Field
          label="Token symbol"
          htmlFor="symbol"
          hint="Letters and numbers only. It will be saved in uppercase."
          error={errors.symbol?.message}
        >
          <input
            id="symbol"
            autoComplete="off"
            className={inputClassName}
            aria-invalid={Boolean(errors.symbol)}
            {...register("symbol")}
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={4}
            className={`${inputClassName} py-3`}
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>
        <Field label="Token logo" htmlFor="logo" error={logoError}>
          <input
            id="logo"
            type="file"
            accept={accept}
            className="min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-zinc-100 file:px-4 file:font-medium dark:file:bg-zinc-900"
            onChange={(event) => onLogoChange(event.target.files?.[0] ?? null)}
          />
        </Field>
        <Field label="Website" htmlFor="website" error={errors.website?.message}>
          <input
            id="website"
            type="url"
            inputMode="url"
            placeholder="https://"
            className={inputClassName}
            {...register("website")}
          />
        </Field>
        <Field label="Twitter / X" htmlFor="twitter" error={errors.twitter?.message}>
          <input
            id="twitter"
            type="url"
            inputMode="url"
            placeholder="https://x.com/..."
            className={inputClassName}
            {...register("twitter")}
          />
        </Field>
        <Field label="Telegram" htmlFor="telegram" error={errors.telegram?.message}>
          <input
            id="telegram"
            type="url"
            inputMode="url"
            placeholder="https://t.me/..."
            className={inputClassName}
            {...register("telegram")}
          />
        </Field>
        <Field label="Discord" htmlFor="discord" error={errors.discord?.message}>
          <input
            id="discord"
            type="url"
            inputMode="url"
            placeholder="https://discord.gg/..."
            className={inputClassName}
            {...register("discord")}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tokenomics</h2>
        <Field
          label="Total supply"
          htmlFor="totalSupply"
          error={errors.totalSupply?.message}
        >
          <input
            id="totalSupply"
            inputMode="numeric"
            className={inputClassName}
            {...register("totalSupply")}
          />
        </Field>
        <Field
          label="Decimals"
          htmlFor="decimals"
          hint={`${family.toUpperCase()} range: ${rules.minDecimals}–${rules.maxDecimals}`}
          error={errors.decimals?.message}
        >
          <input
            id="decimals"
            inputMode="numeric"
            className={inputClassName}
            {...register("decimals")}
          />
        </Field>
        <Field
          label="Initial supply"
          htmlFor="initialSupply"
          error={errors.initialSupply?.message}
        >
          <input
            id="initialSupply"
            inputMode="numeric"
            className={inputClassName}
            {...register("initialSupply")}
          />
        </Field>
        <Field
          label="Creator allocation (%)"
          htmlFor="creatorAllocation"
          error={errors.creatorAllocation?.message}
        >
          <input
            id="creatorAllocation"
            inputMode="decimal"
            className={inputClassName}
            {...register("creatorAllocation")}
          />
        </Field>
        <Field
          label="Liquidity allocation (%)"
          htmlFor="liquidityAllocation"
          error={errors.liquidityAllocation?.message}
        >
          <input
            id="liquidityAllocation"
            inputMode="decimal"
            className={inputClassName}
            {...register("liquidityAllocation")}
          />
        </Field>
        <Field
          label="Community allocation (%)"
          htmlFor="communityAllocation"
          error={errors.communityAllocation?.message}
        >
          <input
            id="communityAllocation"
            inputMode="decimal"
            className={inputClassName}
            {...register("communityAllocation")}
          />
        </Field>
        <Field
          label="Burn allocation (%)"
          htmlFor="burnAllocation"
          error={errors.burnAllocation?.message}
        >
          <input
            id="burnAllocation"
            inputMode="decimal"
            className={inputClassName}
            {...register("burnAllocation")}
          />
        </Field>
      </section>
    </div>
  );
}
