# Product Map

Stableflow Pay v3 is a merchant dashboard for payment links, plus the same multi-chain wallet and payout capability layer as v2. There are **no admin/employee roles**. Recipients of payouts are **wallet addresses**.

Read this before adding pages or navigation. Routes marked *placeholder* are registered with the shared sidebar layout but have no product UI yet.

## Areas

| Area | Routes | Status | Notes |
| --- | --- | --- | --- |
| Auth | `/login`, `/register` | shipped | Email + password. Same API as v2. Guest forgot password in a dialog. Authed users change password from the sidebar account menu. |
| Marketing | `/howitworks` | shipped | Public. Linked from the auth shell. |
| Overview | `/` | shipped | Authenticated home. Stats from `GET /v1/pay/overview`. Payments chart from `GET /v1/pay/payments/analytics` (`period` + `type=paylink`). Volume / Transaction is client-side. A four-step guide panel sits above the stats until profile `guideCompleted` is true. |
| Guide | `/guide`, `/guide/payment-link`, `/guide/api-key`, `/guide/webhook`, `/guide/test` | shipped | Authenticated onboarding. Own layout (no sidebar). Step drawers: 600px right on desktop, bottom below 768px. Creates a payment link, API key, and webhook; Step 4 POSTs `/v1/pay/checkout/sessions` with `x-api-key`, then `POST /v1/pay/guide/complete`. Completion is profile `guideCompleted`. |
| Payment Links | `/payment-links` | shipped | Merchant payment-link list (stats, search, copy / toggle / delete). List is `GET /v1/pay/links` (`page`, `pageSize`, `q`; `revenue` / `payments`). View loads `/stats` and paginated `/payments`, plus CSV export. |
| Create Payment Link | `/payment-links/create`, `/payment-links/create/preview` | shipped | Nested on the Payment Links list. Desktop is a 600px right drawer; below 768px it is a bottom drawer. Form then preview. Overview header CTA goes here. Create calls `POST /v1/pay/links`. |
| Public payer | `/paylink/:linkId`, `/paylink/:linkId/waiting`, `/checkout`, `/checkout/waiting` | shipped | No login, no sidebar. Link detail from `GET /v1/pay/links/{linkId}`. Checkout from `GET /v1/pay/checkout/sessions/{sessionId}`. Swap `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}`, submit `POST /v1/pay/swap/submit` (`payments_id`). Both waiting pages poll `GET /v1/pay/payments/{paymentId}`. |
| API Keys | `/api-keys` | shipped | Merchant API-key list (Label, Key, Created — no Members). Create, copy, edit label, delete. Signed-in users call `/v1/pay/apiKeys`. |
| Reports | `/reports` | shipped | Report analytics charts (`GET /v1/pay/report/analytics`) plus a paginated usage table (`GET /v1/pay/report/payments`) and CSV export (`GET /v1/pay/report/payments/export`). |
| Settings | `/settings` | shipped | Organization profile (`GET` / `POST /v1/pay/organization`) and webhooks. Recipient Address is a local form only. `/webhooks` redirects here. Wallet connect stays in `WalletConnectDialog` for upcoming payment-link / payout screens. |
| Terms / Docs | `/terms`, `/docs` | placeholder | Sidebar footer links. AppLayout also shows Terms of Service at the bottom right of authenticated pages (not login, register, or public payer). |

Payout / request-payment / Near Intents **APIs, hooks, wallet adapters, and confidential helpers** live in `src/` for upcoming screens. Do not add the v2 Home / Pay / Partner page chrome.

## Auth

- Login: `email` + `password`.
- Register: `name` (max 50), `email` (max 100), `password` (8–50), confirm password must match, `inviteCode` (max 10).
- Session: Zustand `useAuthStore` with `persist` middleware. Types: `AuthUser` (`id`, `email`, `name`, `guideCompleted`). Do **not** read or write `localStorage` from feature code.
- Unauthenticated `/` redirects to `/login`. Authenticated `/login` or `/register` redirects to `/`, or to a safe `returnTo` query when present.
- After login or register, navigate to a safe `returnTo` (in-app path with search) or `/`.
- Boot: persist hydrates `{ token, user }`, then `GET /v1/pay/profile` in the background. HTTP 401 calls `logout()`. Navigation is not blocked while the profile request is in flight.
- Reset password:
  - Guest: Login `Forgot Password?` opens a dialog. Send Code calls `POST /v1/pay/reset-password/code`. Continue calls `POST /v1/pay/reset-password`.
  - Authed: sidebar three-dot menu → Change Password opens `ResetPasswordDialog` (`variant="authed"`). Continue calls `POST /v1/pay/change-password`.

Guards live in `src/router/guards.tsx`: `RequireAuth`, `RedirectIfAuthed`. Do not add admin/employee guards.

## Layout

Authenticated chrome is `AppLayout`: left sidebar (220px) + page title + **Create Payment Link** on Overview `/` only (goes to `/payment-links/create`; hidden below 768px). The content column has a bottom-right `Terms of Service` link. Login, register, `/howitworks`, `/guide`, `/paylink/:linkId`, and `/checkout` do not use this layout. Overview is the home item (`/` with `NavLink` `end`). Nested `/payment-links/*` routes keep **Payment Links** selected in the sidebar.

`/guide` is authenticated but does **not** use `AppLayout`. It has its own logo column and a step drawer.

The sidebar user chip shows `user.name` and a three-dot control. That control opens an upward floating menu (same pattern as v2, `side="top"`): Change Password, Settings, Log out. Settings goes to `/settings`. Change Password opens `ResetPasswordDialog` (`variant="authed"`).

Sidebar footer (muted): Settings, Developer Docs, Terms of Service. There is no Support item and no Webhooks item in the main nav.

## Overview

One authenticated page at `/`. Stats come from `GET /v1/pay/overview` (`total_revenue`, `total_transactions`, `active_links`, `api_keys`). The Payments chart loads `GET /v1/pay/payments/analytics` with `period` (`day` / `week` / `month`) and `type=paylink`. Volume / Transaction only switches which series is drawn. A four-step guide panel sits 20px above the stats row until profile `guideCompleted` is true.

## Guide

Authenticated `/guide` (and nested step routes) uses a dedicated layout: logo, Get Start, four step cards, Skip All. Switching a step opens a 600px right drawer on desktop and a bottom drawer below 768px. Step 1 reuses the payment-link form. Step 2 creates an API key. Step 3 creates a webhook. Step 4 runs `POST /v1/pay/checkout/sessions` with `x-api-key`, then reports `POST /v1/pay/guide/complete`. Completion is `GET /v1/pay/profile` `guide_completed` (`AuthUser.guideCompleted`). Skip does not mark a step complete. Skip All returns to `/` and does not hide the Overview panel. Get Ready after a successful complete report navigates to `/`.

## Payment Links

Authenticated `/payment-links` lists merchant links from `GET /v1/pay/links` (`page`, `pageSize`, `q`). Rows show `revenue` and `payments`. Create is a nested overlay at `/payment-links/create` (form) then `/payment-links/create/preview` (generated URL + QR): 600px right drawer on desktop, bottom drawer below 768px. Toggle uses enable / disable. View opens a drawer: `GET /v1/pay/links/{linkId}/stats` and paginated `GET /v1/pay/links/{linkId}/payments`. Export CSV is `GET /v1/pay/links/{linkId}/payments/export`.

## Public payer

`/paylink/:linkId` is the guest checkout for a payment link. `/checkout?sessionId=` is the guest checkout for an API-key session (`GET /v1/pay/checkout/sessions/{sessionId}`). Neither uses `AppLayout` nor requires login. Both reuse the same pay and waiting UI. Preview and pay use `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}` (`EXACT_OUTPUT`, no quote). After transfer, submit is `POST /v1/pay/swap/submit` (`swapId` + `txHash`) with a retry queue; the body returns `payments_id` and `status`. Checkout uses session `status` (`created` / `processing` / `completed` / `failed` / `expired`) only to show the form vs `/checkout/waiting`. Waiting polls `GET /v1/pay/payments/{paymentId}` (`submitted` / `completed` / `failed`): checkout reads `payments_id` from the session; paylink uses `/paylink/:linkId/waiting?paymentId=`. Checkout with a `success_url` shows a 10s `Redirecting in Ns` countdown when the payment is `completed`, then opens that URL with query `amount`, `network`, `expires_at`, `created_at`, `out_order_no`, `recipient`, `session_id`, `status=success`, `symbol`, plus `destination_txHash`, `paid_at`, and `tx_hash` from the payment. `/checkout/waiting` polls `GET /v1/pay/payments/{paymentId}` when `paymentId` is present and only polls the checkout session when it is missing. Waiting Total Fees / Total Payout come from `feesUsd` and `payoutUsd` query params written at pay time until the payment API returns those fields. The public payer flow does not persist a local payer session. The Guide Step 4 test creates a checkout session with `POST /v1/pay/checkout/sessions` and `x-api-key`.

## API Keys

Authenticated `/api-keys`. Signed-in users list, create, copy, edit the label, and delete keys through `/v1/pay/apiKeys`. There is no Partner registration (`POST /v1/pay/partner`) and no Members column. The full key is shown once after create; the table always masks it. Rename does not return the key model; the submitted name is applied locally.

## Settings

Authenticated `/settings` has two cards. Profile loads and saves organization `name`, `slug`, and `logo`. Developer includes a Recipient Address field that is not persisted, plus webhook endpoints: add, enable / disable, rotate secret (shown once), send test (mocked until the test API exists), and delete. Event logs and signature verification are not on this page.

## Reports

Authenticated `/reports`. Top time / API key / network filters drive volume stats and charts (`GET /v1/pay/report/analytics`). A paginated usage table has source / destination / amount filters (`GET /v1/pay/report/payments`; no table API key filter). Export CSV is `GET /v1/pay/report/payments/export` with the same table filters (no pagination).

## Wallet and payout capability

EVM (RainbowKit + wagmi), NEAR, Solana, and Tron adapters are mounted in `WalletProvider`. `WalletConnectDialog` is the wallet connect UI for upcoming payment-link and payout screens — it is not the Settings dialog. Cross-chain transfer, quote/swap/submit, confidential receive, and commit queues stay in `src/wallet/`, `src/api/`, `src/lib/confidential/`, and related stores/hooks.
