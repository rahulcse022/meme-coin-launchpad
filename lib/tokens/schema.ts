import { z } from "zod";
import type { ChainFamily } from "@/config/chains";
import { getTokenRules } from "@/config/token-rules";

const optionalHttpUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "Enter a full URL starting with http:// or https://, or leave this blank.",
  )
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    "Enter a valid URL, or leave this blank.",
  );

function parseSupply(value: string) {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function createTokenConfigSchema(family: ChainFamily) {
  const rules = getTokenRules(family);

  return z
    .object({
      name: z
        .string()
        .trim()
        .min(rules.minNameLength, `Name must be at least ${rules.minNameLength} characters.`)
        .max(rules.maxNameLength, `Name must be at most ${rules.maxNameLength} characters.`),
      symbol: z
        .string()
        .trim()
        .transform((value) => value.toUpperCase())
        .pipe(
          z
            .string()
            .min(
              rules.minSymbolLength,
              `Symbol must be at least ${rules.minSymbolLength} characters.`,
            )
            .max(
              rules.maxSymbolLength,
              `Symbol must be at most ${rules.maxSymbolLength} characters.`,
            )
            .regex(
              /^[A-Z0-9]+$/,
              "Symbol can only include letters and numbers.",
            ),
        ),
      description: z
        .string()
        .trim()
        .min(
          rules.minDescriptionLength,
          `Description must be at least ${rules.minDescriptionLength} characters.`,
        )
        .max(
          rules.maxDescriptionLength,
          `Description must be at most ${rules.maxDescriptionLength} characters.`,
        ),
      website: optionalHttpUrl,
      twitter: optionalHttpUrl,
      telegram: optionalHttpUrl,
      discord: optionalHttpUrl,
      totalSupply: z
        .string()
        .trim()
        .regex(/^[0-9]+$/, "Total supply must be a whole number.")
        .refine((value) => {
          const supply = parseSupply(value);
          return supply !== null && supply > BigInt(0);
        }, "Total supply must be greater than zero."),
      decimals: z.coerce
        .number({ invalid_type_error: "Decimals must be a number." })
        .int("Decimals must be a whole number.")
        .min(
          rules.minDecimals,
          `${family.toUpperCase()} decimals must be at least ${rules.minDecimals}.`,
        )
        .max(
          rules.maxDecimals,
          `${family.toUpperCase()} decimals cannot exceed ${rules.maxDecimals}.`,
        ),
      initialSupply: z
        .string()
        .trim()
        .regex(/^[0-9]+$/, "Initial supply must be a whole number.")
        .refine((value) => {
          const supply = parseSupply(value);
          return supply !== null && supply > BigInt(0);
        }, "Initial supply must be greater than zero."),
      creatorAllocation: z.coerce
        .number({ invalid_type_error: "Creator allocation must be a number." })
        .min(0, "Creator allocation cannot be negative.")
        .max(100, "Creator allocation cannot exceed 100%."),
      liquidityAllocation: z.coerce
        .number({ invalid_type_error: "Liquidity allocation must be a number." })
        .min(0, "Liquidity allocation cannot be negative.")
        .max(100, "Liquidity allocation cannot exceed 100%."),
      communityAllocation: z.coerce
        .number({ invalid_type_error: "Community allocation must be a number." })
        .min(0, "Community allocation cannot be negative.")
        .max(100, "Community allocation cannot exceed 100%."),
      burnAllocation: z.coerce
        .number({ invalid_type_error: "Burn allocation must be a number." })
        .min(0, "Burn allocation cannot be negative.")
        .max(100, "Burn allocation cannot exceed 100%."),
    })
    .superRefine((value, context) => {
      const total =
        value.creatorAllocation +
        value.liquidityAllocation +
        value.communityAllocation +
        value.burnAllocation;

      if (Math.abs(total - 100) > 0.001) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["creatorAllocation"],
          message: `Allocations must add up to 100%. Current total is ${total}%.`,
        });
      }

      const totalSupply = parseSupply(value.totalSupply);
      const initialSupply = parseSupply(value.initialSupply);

      if (totalSupply !== null && initialSupply !== null && initialSupply > totalSupply) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialSupply"],
          message: "Initial supply cannot be greater than total supply.",
        });
      }
    });
}

export type TokenConfigInput = z.input<ReturnType<typeof createTokenConfigSchema>>;
export type TokenConfigValues = z.output<ReturnType<typeof createTokenConfigSchema>>;

export function getTokenFormDefaults(family: ChainFamily): TokenConfigInput {
  const rules = getTokenRules(family);

  return {
    name: "",
    symbol: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
    totalSupply: "1000000000",
    decimals: rules.defaultDecimals,
    initialSupply: "1000000000",
    creatorAllocation: 10,
    liquidityAllocation: 70,
    communityAllocation: 15,
    burnAllocation: 5,
  };
}

export function validateLogoFile(file: File | null, family: ChainFamily) {
  const rules = getTokenRules(family);

  if (!file) {
    return "Upload a token logo before continuing.";
  }

  if (!rules.acceptedLogoTypes.includes(file.type)) {
    return "Logo must be a PNG, JPG, WEBP, or GIF image.";
  }

  if (file.size > rules.maxLogoBytes) {
    return "Logo must be 2 MB or smaller.";
  }

  return null;
}
