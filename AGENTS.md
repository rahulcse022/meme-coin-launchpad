# Meme Coin Launchpad — complete AI agent context and phase prompts

**This is the only handoff file.** Copy this file plus the repo into another AI session. Do not split phases into other markdown files.

How to use it:

1. Read **Shared context** (product, rules, stack, architecture). It applies to every phase.
2. Check **Phase status**. Do not redo a Done phase unless the user explicitly asks to change it.
3. Copy the **Phase prompt** for the next undone phase into the new chat as the task.
4. Keep this file open. Each prompt assumes the agent has this file.

Run phases **in order**. Later phases depend on earlier ones.

---

# Shared context

## Product

A **multichain meme-coin launchpad** (EVM + Solana + TRON). Users connect a wallet. There is **no email/password**. The wallet **is** the identity.

Brand: **Meme Coin Launchpad**. Short name: **MemeLaunch**.

Repo package name: `meme-coin-launchpad`.

User flow when complete:

1. Connect wallet (Reown AppKit).
2. Choose chain family (EVM / Solana / TRON) then a network.
3. Configure token (name, symbol, decimals, supply, allocations, logo, socials).
4. Preview. Pay **0.1 native** creation fee to the configured treasury.
5. Wallet deploys / mints the token. Server **verifies on-chain**. Record is saved to **MongoDB**.
6. UI success only after verify + Mongo save.
7. Token appears on Dashboard, Explore, and a public detail page.
8. Optional later: add DEX liquidity on Launches.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js **16.3.1** App Router, React **19**, TypeScript, Tailwind **4** |
| Wallet | Reown AppKit (Wagmi/Viem EVM + Solana + TRON adapters) |
| Data | MongoDB Node driver in Next.js route handlers. **No NestJS in this repo.** |
| Forms | React Hook Form + Zod |
| EVM | viem + wagmi via **`@wagmi/core` v3** (never `wagmi/actions`) |
| Token contract | OpenZeppelin 5 ERC20 + Ownable, `solc@0.8.24` |
| Tests | Vitest |
| PWA | `app/manifest.ts`, `public/sw.js`, offline banner (`experimental.useOffline`) |

This is **not** classic Next.js. Before writing Next APIs, read `node_modules/next/dist/docs/` (`AGENTS.md` / `CLAUDE.md` point there).

`tsconfig` **target is ES2017**. Do not use `1n` bigint literals or `String.replaceAll`. Use `BigInt(...)` and `split`/`join`.

## Hard rules (every phase)

1. **No fake success.** Never mark a token created from a wallet hash alone. Success only after **on-chain verify + MongoDB save**.
2. **No TokenFactory.** Factory was removed on purpose. EVM tokens deploy from the connected wallet (`deployContract` of `MemeToken`).
3. **Do not mix EVM / Solana / TRON logic in React.** UI calls `getBlockchainService(family)`. Chain code lives in `lib/blockchain/{evm,solana,tron}/`.
4. **Fees and recipients live in TypeScript**, not env and not a factory: `config/creation-fees.ts`.
5. **No private keys in the frontend or git.** The user’s wallet signs create txs.
6. **Do not invent prices, volume, or liquidity.** Missing DEX → empty / Coming Soon.
7. **Form `totalSupply` is whole tokens.** On-chain amount = `scaleTokenAmount(totalSupply, decimals)` (loop multiply by `BigInt(10)`, not `10n`).
8. **Addresses in MongoDB are lowercase.** Query with `.toLowerCase()`. Solana/TRON identifiers should still be stored in a consistent canonical form (lowercase where that is valid).
9. Wallet reject copy: `Transaction rejected by wallet. Please approve the transaction in your wallet and try again.`
10. **Do not commit `.env`.** `.env*` is gitignored except `.env.example`.
11. Do not import `lib/db/mongo.ts` or `list-creator-tokens.ts` from client components. Client-safe types: `lib/tokens/creator-token.ts`.
12. EVM wallet actions: import `deployContract`, `getAccount`, `switchChain`, `waitForTransactionReceipt` from **`@wagmi/core`**, config from `@/config`.
13. If verify fails after a mined tx, **retry verify only**. Do not deploy a second token.
14. Do not reintroduce factory env vars (`NEXT_PUBLIC_FACTORY_*`), Redis, deployer keys, or NestJS unless a later phase explicitly asks.

## Architecture (current)

```
User wallet (Reown AppKit)
        │
        ▼
Create wizard (React) ──► getBlockchainService(family).createToken(...)
        │                         │
        │                         ├─ evm: deploy MemeToken + native fee   [DONE]
        │                         ├─ solana: throws Phase 4               [TODO]
        │                         └─ tron: throws Phase 5                 [TODO]
        ▼
POST /api/tokens/verify
        │
        ├─ verifyEvmTokenCreation (RPC) then saveVerifiedToken → Mongo `tokens`
        └─ Solana / TRON verify: not implemented
        ▼
UI success only if verified: true AND Mongo insert OK

GET /api/tokens?creator=0x...     dashboard (EVM address validation today)
GET /api/platform-fee?network=    fee quote from config
```

There is **no factory contract**. There is **no NestJS server**.

## Routes

| Path | Role | Status |
|---|---|---|
| `/` | Landing | Done (copy still mentions factories — update in Phase 9) |
| `/create` | Wizard: chain → network → form → preview/pay | Done (EVM create works; Solana/TRON fail at pay) |
| `/explore` | Token index | Stub |
| `/launches` | DEX / liquidity | Stub |
| `/dashboard` | Creator tokens from Mongo | Done for EVM wallets |
| `/token/[networkId]/[address]` | Public token page | Missing |
| `GET /api/platform-fee?network=` | Native fee quote | Done |
| `POST /api/tokens/verify` | Verify + Mongo | EVM only |
| `GET /api/tokens?creator=` | List by creator | EVM `isAddress` only |

## Important files

```
config/chains.ts                 All networks (never hardcode chains in UI)
config/creation-fees.ts          CREATION_FEE_AMOUNT + FEE_RECIPIENT_ADDRESS (EVM only today)
config/token-rules.ts            Per-family name/symbol/decimals/logo rules
config/index.ts                  AppKit adapters, wagmi config, projectId
config/evm-contracts.ts          RPC URLs only (no factory)
config/site.ts                   Brand + nav

contracts/evm/MemeToken.sol      The only Solidity contract
lib/contracts/evm/abi.ts
lib/contracts/evm/meme-token-bytecode.ts
scripts/compile-meme-token.mjs    npm run compile:evm

lib/blockchain/index.ts          getBlockchainService(family)
lib/blockchain/types.ts          BlockchainService contract
lib/blockchain/evm/create-token.ts
lib/blockchain/evm/verify-token-creation.ts
lib/blockchain/evm/scale-amount.ts
lib/blockchain/solana/index.ts   Phase 4 stub
lib/blockchain/tron/index.ts     Phase 5 stub

lib/db/mongo.ts                  Cached MongoClient
lib/tokens/schema.ts             Zod create form
lib/tokens/save-verified-token.ts
lib/tokens/list-creator-tokens.ts
lib/tokens/creator-token.ts
lib/tokens/verify-created-token.ts   client POST helper
lib/fees/get-platform-fee.ts

components/token/create-wizard.tsx
app/dashboard/page.tsx
app/layout.tsx                   hydration mitigations
```

## EVM create (already implemented — do not rebuild)

1. User picks EVM → network (Sepolia and BSC Testnet always listed via `alwaysShowInCreateFlow`).
2. Form: name, symbol, description, socials, logo file, totalSupply, decimals, initialSupply, allocations (must sum to 100%).
3. Preview + fee panel (`0.1 ETH`, `0.1 tBNB`, …).
4. Connected wallet must match creator.
5. `switchChain` to `network.evmChainId`.
6. `deployContract`: bytecode `memeTokenBytecode`; args `[name, symbol, decimals, scaledSupply, creator, feeRecipient]`; `value` = `getCreationFeeBaseUnits(networkId)`.
7. Wait for receipt. Require `contractAddress`.
8. `POST /api/tokens/verify`. On fail, Retry verification reuses `pendingHash`.
9. Success UI: token address, tx hash, copy, explorer.

`MemeToken` constructor is payable. Mints full supply to creator. Ownable owner = creator. Forwards `msg.value` to `feeRecipient_`.

After Solidity changes: `npm run compile:evm`.

Verify checks (`lib/blockchain/evm/verify-token-creation.ts`):

- Tx `from` === creator
- Tx is a contract creation (`to` null/zero)
- `value` === configured fee
- Decode deploy data: name, symbol, decimals, scaled supply, creator, fee recipient from config
- Receipt success + `contractAddress`
- On-chain token name/symbol/decimals/supply/owner match; owner === creator

## Fees

`config/creation-fees.ts`

- Amount: **`0.1` native on every network**.
- Recipient today: one EVM `FEE_RECIPIENT_ADDRESS`. If zero/unset, quotes are `active: false` and create is paused.
- Display native units, not USD.
- Solana and TRON still use this amount, but **need their own treasury addresses** in Phase 4 and 5.

Native decimals by family: EVM 18, Solana 9, TRON 6.

## MongoDB

Env: `MONGODB_URI` (example `mongodb://localhost:27017/meme-factory`). `client.db()` uses the DB name in the URI.

Collection: **`tokens`**

```ts
{
  networkId: string;        // e.g. "sepolia"
  chain: "evm" | "solana" | "tron";
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;      // whole tokens, not wei
  creatorAddress: string;   // lowercase
  tokenAddress: string;     // lowercase (mint/contract)
  transactionHash: string;  // lowercase
  feeAmount: string;        // "0.1"
  feeCurrency: string;      // "ETH" | "SOL" | "TRX" | ...
  feeRecipient: string;
  createdAt: Date;
}
```

Indexes:

- unique `{ networkId, transactionHash }`
- unique `{ networkId, tokenAddress }`
- `{ creatorAddress, createdAt: -1 }`

Missing fields (add in later phases, do not invent fake values): description, website, twitter, telegram, discord, logoUri, initialSupply, allocations, liquidity.

Duplicate tx that matches existing row is treated as success (`save-verified-token.ts` duplicate-key handling).

`GET /api/tokens` currently requires `viem.isAddress(creator)` — **Solana/TRON creators will fail until Phase 4/5 widen this**.

## Networks (`config/chains.ts`)

**EVM:** ethereum (1), bnb (56), polygon (137), base (8453), arbitrum (42161), sepolia (11155111), bsc-testnet (97).

**Solana:** solana, solana-devnet, solana-testnet.

**TRON:** tron, tron-shasta.

Always shown in create flow: sepolia, bsc-testnet. Other testnets need “Show additional test networks”.

Mainnet EVM RPCs have **no public fallback**. Set `EVM_RPC_*`. Sepolia/BSC testnet fall back to publicnode.

## Env (`.env.example`)

```
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=
EVM_RPC_URL=
EVM_RPC_SEPOLIA=
EVM_RPC_BSC_TESTNET=
EVM_RPC_ETHEREUM=
EVM_RPC_BNB=
EVM_RPC_POLYGON=
EVM_RPC_BASE=
EVM_RPC_ARBITRUM=
SOLANA_RPC_URL=
TRON_RPC_URL=
```

## UI conventions

- Tailwind, zinc + teal, min tap height `min-h-11`.
- Dark/light: `next-themes` `attribute="class"`.
- Connect / network: Reown `AppKitButton` / `AppKitNetworkButton`.
- Errors: `role="alert"`.
- Logo required in wizard (2 MB, png/jpeg/webp/gif) but **not uploaded anywhere yet**.

## Commands

```bash
npm run dev
npx tsc --noEmit && npx eslint . && npm test && npx next build
npm run compile:evm
```

Every implementation phase must pass that check (except `compile:evm` unless Solidity changed).

## Known non-app issues

Hydration overlays mentioning `bis_skin_checked` or `__processed_*` are **browser extensions**, not app bugs. Already mitigated: `suppressHydrationWarning`, `htmlLimitedBots: /.*/`, `lib/utils/strip-extension-attrs.ts`.

**Lit is in dev mode** is Reown AppKit in `next dev`. Ignore.

## Explicitly rejected

- TokenFactory / env factory addresses
- Marking success from wallet hash only
- Placeholder prices, fake tx, fake pools
- Private keys in the browser
- Mixing chain SDKs inside React components

## Standing prefix for every phase prompt

Paste this **above** any phase prompt if the other AI does not have this file in context:

> You are continuing the meme-coin-launchpad Next.js 16.3.1 app. Read `AGENT_CONTEXT.md` first and obey Shared context + Hard rules. Do not reintroduce a TokenFactory. Do not fake on-chain success. UI success only after verify + Mongo. Do not mix chain logic in React. Fees live in `config/creation-fees.ts`. TypeScript target ES2017 (no `1n`, no `replaceAll`). Import wagmi actions from `@wagmi/core`. Client components must not import Mongo. Read `node_modules/next/dist/docs/` before adding Next routes. Run `npx tsc --noEmit && npx eslint . && npm test && npx next build` before finishing.

---

# Phase status

| Phase | Name | Status |
|---|---|---|
| 1 | Wallet, shell, PWA, chain registry | **Done** |
| 2 | Create-token wizard UI + validation | **Done** |
| 3 | EVM deploy + verify + Mongo + dashboard | **Done** |
| 4 | Solana token creation | **Done** |
| 5 | TRON token creation | **Not started** |
| 6 | Metadata, socials, logo storage | **Done** |
| 7 | Explore + public token detail | **Not started** |
| 8 | Launches / DEX liquidity | **Not started** |
| 9 | Dashboard completeness + landing copy | **Not started** |
| 10 | Production hardening | **Not started** |

Optional later (not required to complete the product): extract APIs into NestJS. Mongo already lives in Next.js because the user required all data in MongoDB from this app.

---

# Phase 1 — Wallet, shell, PWA, chain registry

**Status: Done. Do not reimplement.**

## Context

This phase made the app a real wallet-connected PWA with a chain registry. Networks come from `config/chains.ts`, not from hardcoded UI lists.

Delivered:

- Reown AppKit: `config/index.ts`, `lib/reown/provider.tsx`
- Wagmi + Solana + TRON adapters
- Header, footer, theme toggle, landing, nav: Create / Explore / Launches / Dashboard
- PWA: `app/manifest.ts`, `public/sw.js`, install prompt, offline banner
- Env: `NEXT_PUBLIC_PROJECT_ID`, `NEXT_PUBLIC_APP_URL`
- Hydration mitigations for browser extensions

## Files

`app/layout.tsx`, `app/page.tsx`, `app/manifest.ts`, `config/index.ts`, `config/chains.ts`, `config/site.ts`, `lib/reown/provider.tsx`, `components/layout/*`, `components/wallet/*`, `components/pwa/*`, `next.config.ts`

## Phase 1 prompt (only if asked to extend shell / PWA)

```
Read AGENT_CONTEXT.md. Phase 1 is DONE. Do not rebuild AppKit, layout, or PWA from scratch.

Task: only the shell/PWA change the user just described. Keep Reown AppKit as wallet identity. Keep networks in config/chains.ts. Do not add email login. Do not mix chain SDKs in React. Do not fake wallet connection.

Acceptance:
- Wallet still connects via AppKitButton
- New UI matches existing Tailwind zinc/teal, min-h-11
- tsc, eslint, vitest, next build pass
```

---

# Phase 2 — Create-token wizard UI

**Status: Done. Do not reimplement.**

## Context

Wizard steps: Blockchain → Network → Configure → Preview.

Validation: `lib/tokens/schema.ts` + `config/token-rules.ts`.

Rules:

- Allocations (creator / liquidity / community / burn) must sum to 100%
- Initial supply ≤ total supply
- Per-family decimals (EVM default 18 max 18; Solana default 9 max 9; TRON default 6 max 18)
- Symbol uppercase alphanumeric
- Logo file required client-side; not uploaded
- Description and social URLs validated; **not persisted yet** (Phase 6)

Fee panel reads `/api/platform-fee?network=`.

Tests: `lib/tokens/schema.test.ts`.

**Allocations are UI-only.** `MemeToken` mints 100% to creator. Do not pretend on-chain vesting exists.

## Files

`components/token/*`, `lib/tokens/schema.ts`, `config/token-rules.ts`, `app/create/page.tsx`, `app/api/platform-fee/route.ts`, `lib/fees/get-platform-fee.ts`

## Phase 2 prompt (only if asked to change the form)

```
Read AGENT_CONTEXT.md. Phase 2 is DONE. Do not rebuild the create wizard.

Task: only the form/validation change the user just described. Keep createTokenConfigSchema family-aware. Allocations must still sum to 100%. Logo rules stay in token-rules.ts. Do not wire IPFS here unless Phase 6 is explicitly in scope. Do not mix chain logic in the wizard; keep getBlockchainService.

Acceptance:
- Existing schema tests still pass; add tests for new rules
- tsc, eslint, vitest, next build pass
```

---

# Phase 3 — EVM create, verify, Mongo, dashboard

**Status: Done. Do not reimplement. Do not bring the factory back.**

## Context

Originally this phase used a TokenFactory. The user rejected the factory. Current flow is **direct wallet deploy** of `MemeToken` with `msg.value` = 0.1 native to `FEE_RECIPIENT_ADDRESS`.

Then:

1. `POST /api/tokens/verify`
2. Insert Mongo `tokens`
3. Dashboard `GET /api/tokens?creator=`

If Mongo save fails, API returns 500 and UI must not show success.

Dashboard stats:

- Total tokens created: count
- Platform fees paid: summed native fees (`0.1 ETH`), not USD
- Total liquidity: **—** until Phase 8

`getTokenBalance` still throws.

## Files

`contracts/evm/MemeToken.sol`, `lib/blockchain/evm/*`, `lib/contracts/evm/*`, `lib/db/mongo.ts`, `lib/tokens/save-verified-token.ts`, `app/api/tokens/verify/route.ts`, `app/api/tokens/route.ts`, `app/dashboard/page.tsx`

## Phase 3 prompt (only if asked to fix EVM create)

```
Read AGENT_CONTEXT.md. Phase 3 is DONE.

Task: only the EVM create/verify/Mongo/dashboard fix the user just described.

Do not add a TokenFactory. Keep deployContract from the connected wallet. Keep verifyEvmTokenCreation checks (from, contract-creation tx, fee value, decoded constructor, on-chain token fields, owner === creator). Keep success only after Mongo save. Duplicate tx matching existing row is success. Import wagmi helpers from @wagmi/core. If verify fails after a mined hash, retry verify only.

Acceptance:
- No fake success
- tsc, eslint, vitest, next build pass
- If Solidity changed: npm run compile:evm
```

---

# Phase 4 — Solana token creation

**Status: Not started. This is the next implementation phase.**

## Context

`lib/blockchain/solana/index.ts` throws `Solana createToken is not available yet. Token creation ships in Phase 4.`

Wizard already lets users pick Solana + a network. Pay currently fails at `createToken`.

You must implement the **same product contract as EVM**:

1. Connected Solana wallet creates the token (no server private key).
2. User pays **0.1 SOL** to a **Solana** treasury (extend `config/creation-fees.ts`; do not send SOL to the EVM `FEE_RECIPIENT_ADDRESS`).
3. Server verifies the Solana tx on `SOLANA_RPC_URL` (or a per-network RPC you add to config).
4. Save to existing Mongo `tokens` with `chain: "solana"`.
5. UI success only after verify + save.
6. Dashboard must list Solana tokens. Today `GET /api/tokens` rejects non-EVM addresses via `viem.isAddress` — **fix that**.

Start on **solana-devnet**. Mainnet should work through the same code path once RPC + treasury are set.

Do not put `@solana/web3.js` calls in React components. Put them in `lib/blockchain/solana/`.

Wizard already has `pendingHash` retry — reuse it.

`tokenAddress` for Solana = mint address. `transactionHash` = signature. Store both in a canonical lowercase form if the encoding allows; be consistent.

`getCreationFeeBaseUnits` uses 9 decimals for Solana (0.1 SOL = 100_000_000 lamports).

Extend `POST /api/tokens/verify` to branch on `network.family` instead of returning “Only EVM…”.

Extend `CreatedTokenDocument.feeRecipient` so Solana recipient is stored (today save always uses EVM `getFeeRecipientAddress()` — that will break Solana).

Implement `getTransactionStatus` / `verifyTransaction` for Solana. `getTokenBalance` may still throw until Phase 9.

Do not fake Raydium pools. Do not mark success from a signature alone.

## Deliverables

- `FEE_RECIPIENT_SOLANA` (or equivalent) in `config/creation-fees.ts`
- `createSolanaToken` behind `solanaBlockchainService.createToken`
- `verifySolanaTokenCreation` + verify API branch
- Mongo save with `chain: "solana"`
- `GET /api/tokens` accepts Solana pubkeys
- Fee panel already works if recipient + active are correct per family
- Tests for fee recipient selection and any pure helpers
- Update `.env.example` if new RPC keys are added (no secrets)

## Acceptance

- Devnet create: wallet mints/creates token, 0.1 SOL paid to treasury, verify reads chain, Mongo row appears, dashboard shows it when that Solana wallet is connected
- Wallet reject uses the standard message
- Insufficient SOL: cover 0.1 SOL + fees
- Retry verify does not create a second mint
- Hard rules still hold
- `tsc`, eslint, tests, `next build` pass

## Phase 4 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 4 in full. Implement Phase 4: Solana token creation.

Do not touch EVM deploy/factory. Do not fake success. Do not mix Solana RPC in React. Use getBlockchainService("solana").

Implement:
1. Per-family fee recipients in config/creation-fees.ts. Add a Solana treasury address constant. 0.1 SOL. Quotes must be active only when that recipient is set.
2. lib/blockchain/solana createToken: connected wallet creates the SPL token (or Token-2022 if you document why), mints supply to creator, pays 0.1 SOL to the Solana treasury in the same user-signed flow or an atomic/clear multi-tx flow that verify can prove. No server private key.
3. Server verify: tx/signature exists, sender is creator, fee paid, mint metadata/decimals/supply match the form, then saveVerifiedToken with chain "solana".
4. POST /api/tokens/verify must accept solana networkIds. GET /api/tokens must accept Solana creator addresses (stop using only viem.isAddress).
5. saveVerifiedToken must persist the Solana fee recipient, not the EVM one.
6. If verify fails after a signature exists, create-wizard retries verify only (pendingHash already exists).
7. Prefer solana-devnet. Use SOLANA_RPC_URL. Add per-network RPC mapping if needed, similar to config/evm-contracts.ts.
8. Dashboard must list Solana tokens for the connected Solana wallet.

ES2017: no 1n, no replaceAll. Read Next 16 docs before new routes.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 5 — TRON token creation

**Status: Not started. Depends on Phase 4 patterns (verify branch + non-EVM creator query). Can start after Phase 4.**

## Context

`lib/blockchain/tron/index.ts` throws Phase 5.

Same product contract as EVM/Solana:

1. Connected TronLink (AppKit TRON adapter) creates the TRC-20 (or equivalent) from the user wallet.
2. Pay **0.1 TRX** to a **TRON** treasury in `config/creation-fees.ts`.
3. Verify on `TRON_RPC_URL` / TronGrid.
4. Mongo `chain: "tron"`.
5. Success only after verify + save.
6. Dashboard lists TRON tokens for the connected TRON address.

Start on **tron-shasta**.

Do not put TronWeb in React. Use `lib/blockchain/tron/`.

`GET /api/tokens` must accept TRON addresses (Base58 `T…`). Do not force EVM checksum.

Fee decimals for TRON are 6.

Do not send TRX to the EVM fee recipient.

## Deliverables

- `FEE_RECIPIENT_TRON` (or equivalent)
- `createTronToken` + verify + API branch
- Mongo save
- Explorer links via existing `config/chains.ts` helpers (extend if TRON token URLs differ)
- Tests for helpers
- `.env.example` for TRON RPC if new vars are needed

## Acceptance

- Shasta create works end-to-end: pay 0.1 TRX, verify, Mongo, dashboard
- Retry verify only
- Hard rules
- `tsc`, eslint, tests, `next build` pass

## Phase 5 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 5 in full. Implement Phase 5: TRON token creation.

Phase 4 Solana patterns should already exist (family-aware fees, verify API branching, GET /api/tokens accepting non-EVM creators). Reuse those. Do not mix TronWeb in React. Use getBlockchainService("tron").

Implement:
1. TRON treasury in config/creation-fees.ts. 0.1 TRX. Active only when recipient is set.
2. lib/blockchain/tron createToken: user wallet deploys/creates the token, supply to creator, pays 0.1 TRX to treasury. No server private key.
3. Server verify on TRON_RPC_URL: sender, fee, token fields, then saveVerifiedToken chain "tron".
4. POST /api/tokens/verify accepts tron / tron-shasta. Dashboard lists TRON tokens.
5. Retry verify only if a tx id already exists.
6. Prefer tron-shasta first.

No fake success. ES2017. Next 16 docs before new routes.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 6 — Metadata, socials, logo storage

**Status: Not started. Can run after Phase 3; better after 4–5 so all chains persist the same fields.**

## Context

The create form already collects:

- description (required)
- website, twitter, telegram, discord (optional URLs)
- logo `File` (required, 2 MB, png/jpeg/webp/gif)

None of this is written to Mongo. `CreateTokenParams.metadataUri` is unused on EVM. Preview uses an object URL only.

Goal: persist real metadata. Prefer **IPFS** (or S3 if IPFS is not practical — document the choice). Do not store raw files in Mongo.

Also persist allocations and initialSupply as **form snapshots**. They are not on-chain. Label them as off-chain config so the UI does not imply vesting.

Do not fake a logo if upload fails. Block success or show a clear error; token may already be on-chain — if so, allow retry of metadata save without redeploying.

## Deliverables

- Upload API or server action for logo → URI
- Extend `CreatedTokenDocument` + `CreatorToken` + verify payload
- Dashboard / future Explore show logo + description
- `.env.example` for pin/storage keys (no secrets committed)
- Wizard: after on-chain verify, save metadata; retry metadata if needed

## Acceptance

- New tokens have logoUri + description + socials in Mongo
- Old tokens without those fields still list
- No fake IPFS hashes
- `tsc`, eslint, tests, `next build` pass

## Phase 6 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 6 in full. Implement Phase 6: persist token metadata, socials, and logo.

The create form already validates these fields. They are not in Mongo. Add logo upload (IPFS preferred, otherwise S3/compatible — document in code comments, not a new markdown file). Store a URI, not the file, on the tokens document.

Also persist description, website, twitter, telegram, discord, initialSupply, and allocation percents as off-chain fields. Do not claim they are enforced on-chain.

Extend CreatedTokenDocument, saveVerifiedToken, verify client payload, CreatorToken, dashboard cards. Client components must not import the Mongo driver.

If the token is already verified on-chain and metadata save fails, allow retry of metadata without deploying a second token.

Do not invent URLs. Do not commit storage secrets. Update .env.example only.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 7 — Explore + public token detail

**Status: Not started. Needs Mongo tokens (Phase 3+). Better after Phase 6 so cards have logos.**

## Context

`/explore` is a dashed empty state. `/launches` is DEX Coming Soon — **do not implement DEX here**.

Build a real index of **verified Mongo tokens only**. No CoinGecko fake prices. No fake volume. Show name, symbol, network, supply, createdAt, logo if present, explorer links.

Add `/token/[networkId]/[address]` (or equivalent) as the public page. Dashboard cards should link there.

Add `GET /api/tokens` list-all with pagination + network/search filters. Keep `?creator=` for dashboard.

Do not require a connected wallet to view Explore or token pages (on-chain data is public).

## Deliverables

- Explore page with filters (family, network, search)
- Pagination
- Token detail page
- API list endpoint(s)
- Empty state only when Mongo has no rows

## Acceptance

- Creating an EVM token makes it appear on Explore after verify
- No placeholder charts
- `tsc`, eslint, tests, `next build` pass

## Phase 7 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 7 in full. Implement Phase 7: Explore and public token detail.

Replace the /explore stub with a list of verified tokens from Mongo. Add a public token detail route using networkId + tokenAddress. Link from dashboard and explore.

Add a paginated list API (search, network filter). Keep GET /api/tokens?creator= for the dashboard.

Show only real Mongo fields. No fake prices, volume, or liquidity. If a field is missing, omit it or show — .

Do not build DEX pools (that is Phase 8). Do not import Mongo in client components.

Match existing Tailwind zinc/teal, min-h-11, dark mode.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 8 — Launches / DEX liquidity

**Status: Not started. Depends on tokens existing on-chain (Phase 3+). Per-chain adapters.**

## Context

`/launches` says Uniswap, PancakeSwap, Raydium, and TRON DEX will land later. Dashboard **Total liquidity** is "—".

Implement **real** pool creation or keep Coming Soon **per network**. Never simulate a pool.

Suggested mapping (adjust only if a network’s canonical DEX differs, and document in code):

- Ethereum / Sepolia: Uniswap
- BNB / BSC Testnet: PancakeSwap
- Polygon / Base / Arbitrum: Uniswap (or the chain’s standard v3) — pick one and stick to it
- Solana: Raydium
- TRON: SunSwap or equivalent

User wallet provides liquidity. No server private key.

After a real pool tx:

1. Server verifies the pool/tx
2. Save liquidity fields on the token (or a `liquidity` collection)
3. Dashboard Total liquidity can show a real number or still "—" if you only store pool address without a price oracle — **do not invent USD**. Native pair reserves are OK if read on-chain.

If a DEX cannot be supported yet, UI: `Coming Soon` for that network only.

Allocations’ “liquidity %” is still off-chain unless you actually transfer that percent into the pool. If you do not move tokens, do not imply the allocation happened.

## Deliverables

- Launches UI: pick a verified token you created, add liquidity
- Per-family modules under `lib/blockchain/*/liquidity.ts` (or similar)
- Verify + Mongo
- Dashboard metric uses real data or em dash
- No fake TVL

## Acceptance

- At least one testnet DEX path works end-to-end OR that network stays Coming Soon with no fake pool
- Hard rules
- `tsc`, eslint, tests, `next build` pass

## Phase 8 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 8 in full. Implement Phase 8: Launches and DEX liquidity.

Replace the /launches stub with a flow to add liquidity for a verified token the user created. Chain-specific DEX code stays in lib/blockchain/{evm,solana,tron}, not in React.

User wallet signs. Server verifies the pool/tx then persists real fields (pool address, tx, token amounts). Dashboard Total liquidity may use on-chain reserves or stay — . Never invent USD prices or fake volume.

If a DEX is not implemented for a network, show Coming Soon for that network only.

Do not mark liquidity success from a wallet hash alone. Retry verify only.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 9 — Dashboard completeness + landing copy

**Status: Not started. Best after Phases 4–8 so all chains and liquidity exist.**

## Context

Dashboard works for a single EVM address from `useAppKitAccount()`. Solana and TRON accounts are different strings. When multiple adapters are connected, list tokens for **all** connected addresses.

`getTokenBalance` still throws on every family. Wire it and show creator balance per token. If RPC fails, show an error, not `0` fake.

Landing FAQ still says token factories ship later — **update copy** to match reality (EVM live; Solana/TRON per actual status).

Multi-wallet: do not assume one address equals all chains.

## Deliverables

- Query tokens for every connected adapter address
- `getTokenBalance` implemented per family already supported
- Landing FAQ / “is deployment live” accurate
- Liquidity stat only if Phase 8 stored data
- Empty states remain honest

## Acceptance

- Switching wallets reloads the list
- No fake balances
- `tsc`, eslint, tests, `next build` pass

## Phase 9 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 9 in full. Implement Phase 9: dashboard completeness and accurate landing copy.

useAppKitAccount is one address. Also collect connected Solana and TRON accounts from AppKit adapters and load GET /api/tokens for each. Merge results in the dashboard.

Implement BlockchainService.getTokenBalance for families that already have create/verify. Show the connected wallet's token balance. On RPC failure, show an error, not a fake zero unless the chain truly returned zero.

Update app/page.tsx FAQ and any copy that still says factories are coming or that creation is not live. Match actual phase status. Do not add fake market stats on the landing page.

Total liquidity: use Phase 8 data or keep —.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Phase 10 — Production hardening

**Status: Not started. Do this before mainnet marketing.**

## Context

Gaps:

- Verify rate limit is an in-memory `Map` (useless across serverless instances)
- Mainnets need paid RPCs (`EVM_RPC_*`, `SOLANA_RPC_URL`, `TRON_RPC_URL`)
- `FEE_RECIPIENT_ADDRESS` must be a real treasury (not a test wallet) before mainnet
- 0.1 ETH on Ethereum is expensive by design of the current product — do not silently change amounts; if you change fees, change `CREATION_FEE_AMOUNT` / per-network overrides in config and tests
- Mongo should be Atlas (or equivalent) with backups; indexes already defined
- No admin UI; pause is only “recipient unset”
- PWA / security headers already exist in `next.config.ts`

Do not add Redis unless you actually use it for rate limits. Do not add NestJS unless the user asks (optional split below).

## Deliverables

- Durable rate limit (Mongo TTL, Upstash, or similar) for `/api/tokens/verify`
- Per-network fee `active` flags if needed
- README or `.env.example` comments for production RPC + treasury (no new extra agent files)
- Health check for Mongo + RPC optional
- Confirm `.gitignore` still blocks `.env`

## Acceptance

- Verify works across multiple serverless instances without losing replay protection (unique indexes already help)
- No secrets in git
- `tsc`, eslint, tests, `next build` pass

## Phase 10 prompt (copy this)

```
Read AGENT_CONTEXT.md Shared context and Phase 10 in full. Implement Phase 10: production hardening.

Replace the in-memory verify rate limiter with something that works across serverless instances. Keep unique Mongo indexes as replay protection.

Do not change the 0.1 native fee unless the user asked. Keep recipients in config/creation-fees.ts. Update .env.example for production RPC vars only. Do not commit secrets. Do not add a TokenFactory. Do not add NestJS unless the user asked.

Optional: simple admin pause via config flags per network. Optional: GET health route that checks Mongo without leaking internals.

Done when: npx tsc --noEmit && npx eslint . && npm test && npx next build
```

---

# Optional — NestJS API split

**Not required.** User asked to store everything in Mongo from this Next app. Only do this if they explicitly want a separate API.

If asked:

- Move `/api/tokens`, `/api/tokens/verify`, `/api/platform-fee` to NestJS
- Next.js remains UI + AppKit
- Same verify-then-Mongo rules
- Do not lower the security bar
- Keep chain modules portable (`lib/blockchain` should move with the API)

## Optional NestJS prompt

```
Read AGENT_CONTEXT.md. Extract token APIs into NestJS only because the user asked.

Move verify, list, platform-fee, and Mongo access to NestJS. Next.js calls that API. Keep verify-then-save. Keep no factory, no fake success, no keys in the browser. Update env example (API URL). Do not break EVM create. Port Solana/TRON verify if those phases are already done.

Done when both apps typecheck and the existing create → dashboard flow still works.
```

---

# What “application complete” means

The product is complete when all of this is true:

1. EVM create + verify + Mongo + dashboard (Phase 3) — **already true**
2. Solana create + verify + Mongo (Phase 4)
3. TRON create + verify + Mongo (Phase 5)
4. Metadata + logo persisted (Phase 6)
5. Explore + public token page (Phase 7)
6. Launches: real DEX or honest Coming Soon per network (Phase 8)
7. Dashboard balances + multi-chain accounts + honest landing copy (Phase 9)
8. Production RPC, treasury, durable rate limit (Phase 10)

Until then, ship testnet slices. Never fake the missing slice.

---

# How to start the next chat

1. Attach this repo and `AGENT_CONTEXT.md`.
2. Paste the **Standing prefix**.
3. Paste the **Phase 4 prompt** (or whichever is the first Not started phase).
4. After a phase lands, the next chat pastes the next phase prompt. Do not skip Solana/TRON if the goal is a complete multichain launchpad.
