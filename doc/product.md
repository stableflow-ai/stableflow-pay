# Product Map

Stableflow Pay v3 is a merchant dashboard for payment links, plus the same multi-chain wallet and payout capability layer as v2. There are **no admin/employee roles**. Recipients of payouts are **wallet addresses**.

Read this before adding pages or navigation. Routes marked *placeholder* are registered with the shared sidebar layout but have no product UI yet.

## Areas

| Area | Routes | Status | Notes |
| --- | --- | --- | --- |
| Auth | `/login`, `/register` | shipped | Email + password. Same API as v2. Guest forgot password in a dialog. Authed users change password from the sidebar account menu. After login/register, unfinished guides go to `/guide/payment-link` unless Skip All was persisted. |
| Marketing | `/howitworks` | shipped | Public. Linked from the auth shell. |
| Overview | `/` | shipped | Authenticated home. Stats from `GET /v1/pay/overview`. Payments chart from `GET /v1/pay/payments/analytics` (`period` + `type=paylink`). Volume / Transaction is client-side. A four-step guide panel sits above the stats until profile `guideCompleted` is true. Panel Create/Test opens masked drawers on `/`. |
| Guide | `/guide`, `/guide/payment-link`, `/guide/api-key`, `/guide/webhook`, `/guide/test` | shipped | Authenticated onboarding. Own layout (no sidebar). Step drawers: 600px right on desktop, bottom below 768px, no mask. Creates a payment link, API key, and webhook; Step 4 POSTs `/v1/pay/checkout/sessions` with `x-api-key`, then `POST /v1/pay/guide/complete`. Completion is profile `guideCompleted`. Skip All persists per user. |
| Payment Links | `/payment-links` | shipped | Merchant payment-link list (stats, search, copy / toggle / delete). List is `GET /v1/pay/links` (`page`, `pageSize`, `q`; `revenue` / `payments`). View loads `/stats` and paginated `/payments`, plus CSV export. |
| Create Payment Link | `/payment-links/create`, `/payment-links/create/preview` | shipped | Nested on the Payment Links list. Desktop is a 600px right drawer; below 768px it is a bottom drawer. Form then preview. Overview header CTA goes here. Create calls `POST /v1/pay/links` (`default_address`). Non-empty icon must be an http(s) URL. |
| Public payer | `/paylink/:linkId`, `/paylink/:linkId/waiting`, `/checkout`, `/checkout/waiting` | shipped | No login, no sidebar. Link detail from `GET /v1/pay/links/{linkId}`. Checkout from `GET /v1/pay/checkout/sessions/{sessionId}`. Paylink card icon is `icon` then `organization.logo`. Checkout uses `organization.logo` only. Swap `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}`, submit `POST /v1/pay/swap/submit` (`payments_id`). Both waiting pages poll `GET /v1/pay/payments/{paymentId}`. |
| API Keys | `/api-keys` | shipped | Merchant API-key list (Label, Key, Created — no Members). Create, copy, edit label, delete. Signed-in users call `/v1/pay/apiKeys`. |
| Reports | `/reports` | shipped | Report analytics charts (`GET /v1/pay/report/analytics`) plus a paginated usage table (`GET /v1/pay/report/payments`) and CSV export (`GET /v1/pay/report/payments/export`). Top and table filters include Key / Link source (`type`), API key, payment link, network, and time. |
| Settings | `/settings` | shipped | Organization profile (`GET` / `POST /v1/pay/organization`) and webhooks. Recipient Address is a local form only. `/webhooks` redirects here. Wallet connect stays in `WalletConnectDialog` for upcoming payment-link / payout screens. |
| Developer Docs | `/docs` | shipped | Authenticated merchant Checkout API guide with setup, Session creation, redirects, confirmation, webhooks, supported assets, API reference, and production checklist. |
| Privacy Transfer | `/privacy-transfer` | shipped | Authenticated. Not in the sidebar. Confidential TRANSFER or SWAP to 1–10 unique addresses. History is local to this browser. |
| Terms | `/terms` | placeholder | Sidebar footer link. AppLayout also shows Terms of Service at the bottom right of authenticated pages (not login, register, or public payer). |

Payout / request-payment / Near Intents **APIs, hooks, wallet adapters, and confidential helpers** live in `src/`. Privacy Transfer is at `/privacy-transfer`. Do not add the v2 Home / Pay / Partner page chrome.

## Auth

- Login: `email` + `password`.
- Register: `name` (max 50), `email` (max 100), `password` (8–50), confirm password must match, `inviteCode` (max 10).
- Session: Zustand `useAuthStore` with `persist` middleware. Types: `AuthUser` (`id`, `email`, `name`, `guideCompleted`). Do **not** read or write `localStorage` from feature code. `SessionBootstrap` listens for the `storage` event on `stableflow-pay.session`, clears the Query cache, and `persist.rehydrate()`s so another tab's login or logout is applied here.
- Unauthenticated `/` redirects to `/login`. Authenticated `/login` or `/register` redirects via `postAuthPath`: a safe `returnTo` when present, else `/guide/payment-link` when `guideCompleted` is false and the user has not Skip-All'd, else `/`.
- After login, navigate the same way (`postAuthPath`). After register, `returnTo` is ignored so a leftover query from the previous session cannot skip onboarding. Session restore and refresh on `/` do **not** auto-send the user to `/guide`.
- Manual log out (sidebar) goes to `/login` with no `returnTo`. HTTP 401 still sends `/login?returnTo=` of the current page so the same user can resume.
- A lone `/` is not a valid `returnTo`.
- Boot: persist hydrates `{ token, user }`, then `GET /v1/pay/profile` in the background. HTTP 401 calls `logout()`. Navigation is not blocked while the profile request is in flight.
- Reset password:
  - Guest: Login `Forgot Password?` opens a dialog. Send Code calls `POST /v1/pay/reset-password/code`. Continue calls `POST /v1/pay/reset-password`.
  - Authed: sidebar three-dot menu → Change Password opens `ResetPasswordDialog` (`variant="authed"`). Continue calls `POST /v1/pay/change-password`.

Guards live in `src/router/guards.tsx`: `RequireAuth`, `RedirectIfAuthed`. Do not add admin/employee guards.

## Layout

Dashboard chrome is `AppLayout`: left sidebar (220px) + page title + **Create Payment Link** on Overview `/` only (goes to `/payment-links/create`; hidden below 768px). The content column has a bottom-right `Terms of Service` link. All routes inside this layout, including `/docs` and `/privacy-transfer`, are authenticated. `/privacy-transfer` is not in the sidebar. Login, register, `/howitworks`, `/guide`, `/paylink/:linkId`, and `/checkout` do not use this layout. Overview is the home item (`/` with `NavLink` `end`). Nested `/payment-links/*` routes keep **Payment Links** selected in the sidebar.

`/guide` is authenticated but does **not** use `AppLayout`. It has its own logo column and a step drawer.

The sidebar user chip shows `user.name` and a three-dot control. That control opens an upward floating menu (same pattern as v2, `side="top"`): Change Password, Settings, Log out. Settings goes to `/settings`. Change Password opens `ResetPasswordDialog` (`variant="authed"`).

Sidebar footer (muted): Settings, Developer Docs, Terms of Service. There is no Support item and no Webhooks item in the main nav.

Developer Docs at `/docs` uses the authenticated AppLayout and documents the Checkout API. It is static product documentation and does not call the backend.

`/privacy-transfer` uses AppLayout but is **not** a sidebar item. Open it by URL. The page title is Privacy Transfer.

## Privacy Transfer

Authenticated `/privacy-transfer`. A merchant sends one amount to 1–10 unique destination addresses through a confidential Intents account.

- Mode is derived after the funding route: same `assetId` → `TRANSFER`, otherwise `SWAP`. There is no mode switch.
- Funding is the connected source-chain wallet **or** an existing confidential balance. Linking (the Intents account) is a connected NEAR / EVM / Solana / Tron wallet. Zcash cannot link; it may be the origin or the destination.
- Recipients are typed in. They must be unique. Preview hides per-recipient shares (±20% split is applied at execute time). Preview shows total, expected total out, minimum total out, mode, route (`DIRECT` / `SAME_CHAIN_SWAP` / `CROSS_CHAIN_SWAP`), expiry, and fee (product fee is 0 bps).
- This release only quotes a **DIRECT** registered source deposit. Unregistered SAME_CHAIN / CROSS_CHAIN funding swaps throw.
- Wallet deposits go through 1Click quote + `transferToDepositAddress`, then indexer `POST /v3/private/withdraws`. Balance funding signs and `POST /v1/nearintents/submit-intent`.
- Execution snapshots persist in Zustand (`stableflow-pay:privacy-transfer-execution:v1`). Failed transfers are not resumed; Retry from balance opens a new order whose recipients must be a subset of the original addresses.
- Quote activates a 1Click User-Session through `activateConfidentialAccount` (`POST /v0/auth/authenticate`, Vite-proxied in `pnpm dev`). Empty-intents wallet signing happens once per linking account; later quotes reuse the access/refresh tokens until they expire. Access-token refresh does not prompt the wallet. Switching linking wallet, closing the tab, or a failed refresh signs again. When a signature is needed, EVM linking switches onto the source (or destination) token chain first. The private indexer is `VITE_PRIVATE_INDEXER_URL` (dev Vite proxies `/v3/private`). Production CORS still needs a backend proxy. How it works is unchanged.

## Overview

One authenticated page at `/`. Stats come from `GET /v1/pay/overview` (`total_revenue`, `total_transactions`, `active_links`, `api_keys`). The Payments chart loads `GET /v1/pay/payments/analytics` with `period` (`day` / `week` / `month`) and `type=paylink`. Volume / Transaction only switches which series is drawn. A four-step guide panel sits 20px above the stats row until profile `guideCompleted` is true. Create / Test (and completed-row clicks) open the same guide step drawers on `/` with a mask; they do not navigate to `/guide`. Clicking the mask closes the drawer.

## Guide

Authenticated `/guide` (and nested step routes) uses a dedicated layout: logo, Get Start, four step cards, Skip All. Switching a step opens a 600px right drawer on desktop and a bottom drawer below 768px, **without** a mask. Step 1 reuses the payment-link form. Step 2 creates an API key. Step 3 creates a webhook; the preview shows the signing secret once with a Copy button. Step 4 runs `POST /v1/pay/checkout/sessions` with `x-api-key`, then reports `POST /v1/pay/guide/complete`. Completion is `GET /v1/pay/profile` `guide_completed` (`AuthUser.guideCompleted`). Skip does not mark a step complete. Skip All returns to `/`, does not hide the Overview panel, and records the user id in the persisted guide store (`skippedAllUserIds`) so the next login does not auto-open `/guide/payment-link`. Payment link / API key / webhook drafts in that store are keyed by user id so they do not leak across accounts. Get Ready after a successful complete report navigates to `/` (on Overview it only closes the drawer). Login also reads `user.guide_completed` from `POST /v1/pay/auth/login` and sends unfinished, non-skipped users to `/guide/payment-link`.

## Payment Links

Authenticated `/payment-links` lists merchant links from `GET /v1/pay/links` (`page`, `pageSize`, `q`). Rows show `revenue` and `payments`. Create is a nested overlay at `/payment-links/create` (form) then `/payment-links/create/preview` (generated URL + QR): 600px right drawer on desktop, bottom drawer below 768px. A non-empty Icon URL must be `http:` or `https:`. Save as default is sent as `default_address` on create and stores that network's recipient; the next create loads `GET /v1/pay/links/default-addresses` and fills Recipient Address when the selected token's network matches. Toggle uses enable / disable. View opens a drawer: `GET /v1/pay/links/{linkId}/stats` and paginated `GET /v1/pay/links/{linkId}/payments`. Export CSV is `GET /v1/pay/links/{linkId}/payments/export`.

## Public payer

`/paylink/:linkId` is the guest checkout for a payment link. `/checkout?sessionId=` is the guest checkout for an API-key session (`GET /v1/pay/checkout/sessions/{sessionId}`). Neither uses `AppLayout` nor requires login. Both reuse the same pay and waiting UI. Preview and pay use `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}` (`EXACT_OUTPUT`, no quote). Pay / Send aborts and refetches the swap when `deadline` has passed, so the payer does not transfer to an expired deposit address. Zcash swap sends the shielded Unified address (`u1`) as `payer` and the transparent address (`t1` / `t3`) as `refundTo`; missing either blocks the swap. You Pay Balance and Send use Noir `available` (spendable; falls back to `spendable` then `shielded`). Confirming inbound ZEC is not spendable: Send toasts **ZEC is still confirming in Noir Wallet. Wait until it is spendable, then retry.** and does not open the wallet. After transfer, PayView awaits one `POST /v1/pay/swap/submit` (`swapId` + `txHash`); success puts `payments_id` on the waiting URL, and failure is swallowed with no retry. A connected Safe (Safe App iframe, or Safe{Wallet} over WalletConnect) or Trezu Wallet / SputnikDAO proposes to its queue instead of producing a `txHash`. A connected SquadsX wallet wraps the origin transfer into a Squads v4 vault proposal. Any other Solana wallet (Phantom, Solflare, Ledger, WalletConnect, and similar) stays an EOA until the payer turns on **Pay from Squad** and pastes a Squads vault or Squad (multisig) address. A pasted vault binds immediately; a pasted Squad opens a vault selector (index 0 is preselected and must be confirmed). Quote `payer` / `refundTo`, origin balance, and the deposit transfer all use the vault; the connected wallet only signs the outer `vaultTransactionCreate` + `proposalCreate` transaction. Binding fails immediately if that wallet is not a member or lacks Initiate (Proposer). The binding is persisted per member and re-checked on restore. PayView stays on the pay page, shows a persistent toast with a Safe, Trezu, or Squads queue link (`https://app.squads.so/squads/{vaultAddress}/transactions`), and does not call `paySwapSubmit`. The toast closes when the queue link is clicked, the toast is dismissed, or the proposal reaches a terminal state (executed / rejected / cancelled / expired). The consumed-swap marker still applies so the same deposit is never paid twice. Final state is the backend polling `GET /v1/nearintents/status` by `depositAddress`. A DAO account cannot produce a NEP-413 signature, so Trezu is rejected for message signing. SquadsX cannot sign Intents messages either; a Phantom / other keypair wallet still can. Checkout shows the pay form when the session has no `payments_id` and is not expired. Session `status` (including `processing`) does not hide the form. Waiting polls `GET /v1/pay/payments/{paymentId}` (`submitted` / `completed` / `failed`): checkout reads `payments_id` from the session; paylink uses `/paylink/:linkId/waiting?paymentId=`. Checkout with a `success_url` shows a 10s `Redirecting in Ns` countdown when the payment is `completed`, then opens that URL with query `amount`, `network`, `expires_at`, `created_at`, `out_order_no`, `recipient`, `session_id`, `status=success`, `symbol`, plus `destination_txHash`, `paid_at`, and `tx_hash` from the payment. `/checkout/waiting` polls `GET /v1/pay/payments/{paymentId}` when `paymentId` is present and only polls the checkout session when it is missing. Waiting Total Fees / Total Payout come from `GET /v1/pay/payments/{paymentId}`: Total Payout is `destination_volume` (`amountOutUsd`); Total Fees is `usdFee(volume, destination_volume)` (`amountInUsd` minus `amountOutUsd`). The public payer flow does not persist a local payer session. The Guide Step 4 test creates a checkout session with `POST /v1/pay/checkout/sessions` and `x-api-key`. Paylink payloads include `icon` and `organization.logo`; `/paylink` (including waiting) shows `icon` above the card, then `organization.logo` if `icon` is empty (`PayerLayout` `iconUrl`). Checkout sessions still use `organization.logo` only. An empty `iconUrl` is not rendered.

## API Keys

Authenticated `/api-keys`. Signed-in users list, create, copy, edit the label, and delete keys through `/v1/pay/apiKeys`. There is no Partner registration (`POST /v1/pay/partner`) and no Members column. The full key is shown once after create; the table always masks it. Rename does not return the key model; the submitted name is applied locally.

## Settings

Authenticated `/settings` has two cards. Profile loads and saves organization `name`, `slug`, and `logo`. A non-empty logo must be an `http:` or `https:` URL. Developer includes a Recipient Address field that is not persisted, plus webhook endpoints: add, enable / disable, rotate secret (shown once), send test (`POST /v1/pay/dev/simulateWebhook`; default payload is checkout webhook `data`: `payments_id`, `status`, `session_id`, `out_order_no`), and delete. Event logs and signature verification are not on this page.

## Reports

Authenticated `/reports`. Top Key / Link, API key or payment link, network, and time filters drive volume stats and charts (`GET /v1/pay/report/analytics` with `type`, `api_key_id`, `link_id`). A paginated usage table has Key / Link, API key or payment link, source / destination / amount filters (`GET /v1/pay/report/payments`). Export CSV is `GET /v1/pay/report/payments/export` with the same table filters (no pagination).

## Wallet and payout capability

EVM (RainbowKit + wagmi), NEAR (`@hot-labs/near-connect`: HOT Wallet, Meteor Wallet, Intear Wallet, OKX Wallet, Ledger, NEAR Mobile, Nightly Wallet, Wallet Connect, Trezu Wallet), Solana (Phantom, Solflare, SquadsX, or **Pay from Squad** on a keypair wallet), Tron, and Zcash (Noir Wallet via `@rhea-finance/zcash-wallet-adapter`) adapters are mounted in `WalletProvider`. Zcash is payer-enabled and not a batch origin. The connected **shielded** Unified address (`u1`) is the display address and swap `payer`. Swap `refundTo` is the transparent address (`t1` / `t3`). You Pay and Send read spendable ZEC (`getBalance.available`, then `spendable`, then `shielded`) so confirming inbound notes cannot pass the balance gate or open Noir. `usePaymentWallet` exposes `quotePayer` / `quoteRefundTo`; a missing Zcash pair blocks the swap quote. `WalletConnectDialog` is the wallet connect UI for upcoming payment-link and payout screens — it is not the Settings dialog. Cross-chain transfer, quote/swap/submit, confidential receive, and commit queues stay in `src/wallet/`, `src/api/`, `src/lib/confidential/`, and related stores/hooks.
