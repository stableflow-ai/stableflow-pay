# Product Map

Stableflow Pay v3 is a merchant dashboard for payment links, plus the same multi-chain wallet and payout capability layer as v2. There are **no admin/employee roles**. Recipients of payouts are **wallet addresses**.

Read this before adding pages or navigation. Routes marked *placeholder* are registered with the shared sidebar layout but have no product UI yet.

## Areas

| Area | Routes | Status | Notes |
| --- | --- | --- | --- |
| Auth | `/login`, `/register` | shipped | Email + password. Same API as v2. Guest forgot password in a dialog. Authed users change password from the sidebar account menu. |
| Marketing | `/howitworks` | shipped | Public. Linked from the auth shell. |
| Overview | `/` | shipped (mock) | Authenticated home. Figma Overview layout. Organization card, stats, payments chart, top revenue links. Data from `src/mocks/overview.ts` until the API contract exists. |
| Payment Links | `/payment-links` | shipped (mock) | Merchant payment-link list (stats, search, copy / toggle / delete). View opens a payments drawer. Data from `src/mocks/payment-links.ts` until the API contract exists. |
| Create Payment Link | `/payment-links/create`, `/payment-links/create/preview` | shipped (mock) | Form then preview. Sidebar stays on Payment Links. Overview header CTA goes here. Create is mocked until the merchant-link API exists. |
| Public payer | `/p/:id`, `/p/:id/waiting` | shipped (mock detail) | No login, no sidebar. Opening a payment-link URL. Link detail from `src/mocks/payment-links.ts`. Quote / swap / submit and 1Click status are real APIs (guest `auth: Boolean(token)`). |
| API Keys | `/api-keys` | shipped | Merchant API-key list (Label, Key, Created — no Members). Create, copy, edit label, delete. Signed-in users call `/v1/pay/partner/keys` directly; no Partner registration. |
| Webhooks | `/webhooks` | shipped (mock) | Merchant webhook endpoints (enable / rotate secret / send test / delete), event logs, and signature verification snippet. Data from `src/mocks/webhooks.ts` until the API contract exists. |
| Reports | `/reports` | shipped | Partner analytics stats and charts (`GET /v1/pay/partner/analytics`) plus a paginated usage table (`GET /v1/pay/partner/payments`). No Partner registration. |
| Settings | — | shipped | Global `SettingsDialog` (organization name + logo URL). Opened from the sidebar account menu and the Overview organization card. Not a route. Wallet connect stays in `WalletConnectDialog` for upcoming payment-link / payout screens. |
| Support / Terms / Docs | `/support`, `/terms`, `/docs` | placeholder | Sidebar footer links. |

Payout / request-payment / Near Intents **APIs, hooks, wallet adapters, and confidential helpers** live in `src/` for upcoming screens. Do not add the v2 Home / Pay / Partner page chrome.

## Auth

- Login: `email` + `password`.
- Register: `name` (max 50), `email` (max 100), `password` (8–50), confirm password must match, `inviteCode` (max 10).
- Session: Zustand `useAuthStore` with `persist` middleware. Types: `AuthUser` (`id`, `email`, `name`). Do **not** read or write `localStorage` from feature code.
- Unauthenticated `/` redirects to `/login`. Authenticated `/login` or `/register` redirects to `/`, or to a safe `returnTo` query when present.
- After login or register, navigate to a safe `returnTo` (in-app path with search) or `/`.
- Boot: persist hydrates `{ token, user }`, then `GET /v1/pay/profile` in the background. HTTP 401 calls `logout()`. Navigation is not blocked while the profile request is in flight.
- Reset password:
  - Guest: Login `Forgot Password?` opens a dialog. Send Code calls `POST /v1/pay/reset-password/code`. Continue calls `POST /v1/pay/reset-password`.
  - Authed: sidebar three-dot menu → Change Password opens `ResetPasswordDialog` (`variant="authed"`). Continue calls `POST /v1/pay/change-password`.

Guards live in `src/router/guards.tsx`: `RequireAuth`, `RedirectIfAuthed`. Do not add admin/employee guards.

## Layout

Authenticated chrome is `AppLayout`: left sidebar (220px) + page title + **Create Payment Link** on Overview `/` only (goes to `/payment-links/create`; hidden below 768px). Overview is the home item (`/` with `NavLink` `end`). Nested `/payment-links/*` routes keep **Payment Links** selected in the sidebar.

The sidebar user chip shows `user.name` and a three-dot control. That control opens an upward floating menu (same pattern as v2, `side="top"`): Change Password, Settings, Log out. Settings opens the global organization dialog. Change Password opens `ResetPasswordDialog` (`variant="authed"`).

## Overview

One authenticated page at `/`. Mock dashboard until `/v1/pay` overview for this product exists. Follow [mocks.md](mocks.md). Do not invent `src/types/overview.ts` or query keys in the mock phase.

## Payment Links

Authenticated `/payment-links` is mocked until the merchant-link API exists. Follow [mocks.md](mocks.md). Do not invent `src/types/payment-links.ts` or query keys in this phase. Create Payment Link is `/payment-links/create` (form) then `/payment-links/create/preview` (generated URL + QR).

## Public payer

`/p/:id` is the guest checkout for a payment link. It does **not** use `AppLayout` and does **not** require login. Fixed links show a read-only amount; Open Amount links let the payer edit the amount (max 6 decimals). After swap + on-chain transfer, `/p/:id/waiting` polls `GET /v1/nearintents/status` until success or failure.

## API Keys

Authenticated `/api-keys`. Signed-in users list, create, copy, edit the label, and delete keys through `/v1/pay/partner/keys`. There is no Partner registration (`POST /v1/pay/partner`) and no Members column. The full key is shown once after create; the table always masks it.

## Webhooks

Authenticated `/webhooks` is mocked until the merchant webhook API exists. Follow [mocks.md](mocks.md). Do not invent `src/types/webhooks.ts` or query keys in this phase. Merchants add endpoints, toggle them, rotate the signing secret (shown once), send a test event, and inspect event logs.

## Reports

Authenticated `/reports`. Top time / API key / network filters drive volume stats and charts (`GET /v1/pay/partner/analytics`). A paginated usage table has its own API key / source / destination / amount filters (`GET /v1/pay/partner/payments`). There is no Partner registration gate. Export CSV is not implemented yet.

## Wallet and payout capability

EVM (RainbowKit + wagmi), NEAR, Solana, and Tron adapters are mounted in `WalletProvider`. `WalletConnectDialog` is the wallet connect UI for upcoming payment-link and payout screens — it is not the Settings dialog. Cross-chain transfer, quote/swap/submit, confidential receive, and commit queues stay in `src/wallet/`, `src/api/`, `src/lib/confidential/`, and related stores/hooks.
