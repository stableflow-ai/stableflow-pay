# Stableflow Pay

A crypto payment gateway supporting multi-currency cross-chain payments

The public payer flow (`/paylink/pl_xxx` and `checkout?sessionId=cs_xxx`) does not require login. Authenticated merchants get Overview, Payment Links, API Keys, Webhooks, and Reports.

## Stack

Vite 8 (Rolldown) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · TanStack Query · react-router-dom

Wallets: EVM (RainbowKit + wagmi), NEAR, Solana, Tron.

## Setup

Requires [pnpm](https://pnpm.io/) 10.

```bash
pnpm install
cp .env.example .env.local
pnpm dev        # http://127.0.0.1:5200
```

Fill `.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Backend origin (no Vite proxy). Default `https://test-api.stableflow.ai` |
| `VITE_WALLETCONNECT_PROJECT_ID` | for wallets | WalletConnect Cloud ID (RainbowKit + Tron) |
| `VITE_RPC_PROXY_HOST` / `VITE_RPC_SECRET_KEY` | optional | HMAC-signed RPC proxy |
| `VITE_AMOUNT_MAX_DECIMALS` | optional | Amount input precision (default `6`) |
| `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_API_KEY` / `VITE_GOOGLE_APP_ID` | optional | Google Sheets import |

## Scripts

```bash
pnpm dev        # http://127.0.0.1:5200
pnpm check      # tsc -b
pnpm test       # vitest
pnpm build
pnpm preview
```

## Routes

| Path | Who | Notes |
| --- | --- | --- |
| `/login`, `/register` | guest | Email + password |
| `/howitworks` | public | Marketing |
| `/` | merchant | Overview (mock until the overview API exists) |
| `/payment-links` | merchant | Link list API |
| `/payment-links/create` | merchant | Create + preview |
| `/paylink/:linkId` | payer | Checkout; no login, no sidebar |
| `/checkout?sessionId=cs_xxx` | payer | Checkout session; no login, no sidebar |
| `/checkout/waiting` | payer | Checkout waiting |
| `/api-keys` | merchant | API keys API |
| `/settings` | merchant | Organization profile + webhooks |
| `/reports` | merchant | Analytics + payments APIs |
| `/terms`, `/docs` | merchant | Placeholder |

Overview still uses fixtures in `src/mocks/` until that backend contract exists. Payment Links, API Keys, Reports, and Settings call the live API. Webhook test send is still mocked.

## Docs for contributors

Agent and coding rules live under [`doc/`](doc/):

- [conventions.md](doc/conventions.md) — language, icons, state, styling
- [product.md](doc/product.md) — areas, routes, constraints
- [project-structure.md](doc/project-structure.md) — folder map
- [api.md](doc/api.md) — HTTP client, query keys, endpoints
- [mocks.md](doc/mocks.md) — fixtures while an API is missing
- [components/README.md](doc/components/README.md) — public UI
