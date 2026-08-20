import type { ChainFamily } from "@/config/chains";

export type TokenRules = {
  minNameLength: number;
  maxNameLength: number;
  minSymbolLength: number;
  maxSymbolLength: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;
  minDecimals: number;
  maxDecimals: number;
  defaultDecimals: number;
  maxLogoBytes: number;
  acceptedLogoTypes: readonly string[];
};

export const tokenRulesByFamily: Record<ChainFamily, TokenRules> = {
  evm: {
    minNameLength: 2,
    maxNameLength: 32,
    minSymbolLength: 2,
    maxSymbolLength: 11,
    minDescriptionLength: 10,
    maxDescriptionLength: 500,
    minDecimals: 0,
    maxDecimals: 18,
    defaultDecimals: 18,
    maxLogoBytes: 2 * 1024 * 1024,
    acceptedLogoTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
  solana: {
    minNameLength: 2,
    maxNameLength: 32,
    minSymbolLength: 2,
    maxSymbolLength: 10,
    minDescriptionLength: 10,
    maxDescriptionLength: 500,
    minDecimals: 0,
    maxDecimals: 9,
    defaultDecimals: 9,
    maxLogoBytes: 2 * 1024 * 1024,
    acceptedLogoTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
  tron: {
    minNameLength: 2,
    maxNameLength: 32,
    minSymbolLength: 2,
    maxSymbolLength: 10,
    minDescriptionLength: 10,
    maxDescriptionLength: 500,
    minDecimals: 0,
    maxDecimals: 18,
    defaultDecimals: 6,
    maxLogoBytes: 2 * 1024 * 1024,
    acceptedLogoTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  },
};

export function getTokenRules(family: ChainFamily) {
  return tokenRulesByFamily[family];
}
