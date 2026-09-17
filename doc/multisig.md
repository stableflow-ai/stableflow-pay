# Multisig proposals

When a connected wallet is a Safe, Trezu / SputnikDAO, or Squads treasury, Pay proposes instead of broadcasting an EOA transaction. Two product behaviors are required for every chain adapter. Implement them before calling the chain live.

Code: `src/wallet/multisig/` (contract), `src/wallet/evm/safe/`, `src/wallet/near/multisig/`, `src/wallet/solana/multisig/`. UI: `src/components/multisig/multisig-proposal-toast.tsx` (confirm toast), `src/views/payer/WaitingView.tsx` (execution watch).

## 1. Confirm toast (before the wallet SDK returns)

Show a persistent `info` toast as soon as Pay is clicked and the origin wallet is a known multisig. Do not wait for `txs.send` / Trezu / Squads to resolve.

- Title / queue link: `resolveMultisigConfirmToast(chainKind)` (`src/wallet/multisig/confirm.ts`). The proposal id is unknown, so the URL is the queue list (`safeQueueUrl`, `trezuRequestsUrl(daoId)`, `squadsQueueUrl`).
- `duration: false`. Close when the user clicks the link, clicks X, or the wallet SDK returns success / failure / reject.
- Closing the toast must not abort later watchers or submit.

Copy:

- Safe: `Confirm this transaction in your Safe` / `Review it in your Safe queue`
- Trezu: `Confirm this transaction in your Trezu treasury` / `Review it in your Trezu queue`
- Squads: `Confirm this transaction in your Squads treasury` / `Review it in your Squads queue`

`ToastContainer` lives in `App.tsx`, so the confirm toast survives a navigate to waiting. Toast 1 itself is created from `PayView`.

## 2. Execution watch (after the proposal exists)

`transferToDepositAddress` returns `pending-multisig`. Navigate to waiting and put the proposal on the **URL query** (not `location.state` as the only source). Refreshing the same waiting URL continues the watch. Closing the tab discards it.

Query keys (next to `sessionId` / `paymentId`): `swapId`, `msKind=evm|near|solana`, plus `msSafe` / `msTx` / `msChain`, `msDao` / `msProposal`, or `msVault` / `msPda` / `msIndex`. Helpers: `src/views/payer/config.ts`, `src/views/payer/multisig-query.ts`.

Waiting stays if it has `paymentId` **or** a valid multisig query (paylink no longer depends on `awaitingSubmit` state alone).

Implement `watch*` so it reports:

```ts
type MultisigWatchSnapshot = {
  signed: number | null;
  required: number | null;
  status: "pending" | "success" | "failed";
  txHash: string | null;
};
```

Then register it in `watchMultisigProposal` (`src/wallet/multisig/index.ts`). Hide n/m when either count is `null`.

Waiting copy:

- Title: `Waiting for multisig result...` (no n/m)
- Subtitle: `n / m signed` when known; empty until the first snapshot
- After submit: title `Waiting for Payment...`, subtitle `This can take 0-3 minutes`

On **success**, always `POST /v1/pay/swap/submit` with `txHash` set to the on-chain hash or `""`. Then `replace` the URL with `paymentId` and drop `ms*` / `swapId`, and poll `GET /payments/{id}`. `txHash` is optional on the backend; empty string is allowed. On **failed**, show the failed waiting card and do not submit.

SquadsX has no vault transaction index: skip the watch, submit `txHash: ""` immediately after landing on waiting.

There is no listen toast on v3; Waiting is Toast 2. Confirm toast (Toast 1) may still be visible while waiting.

## Chain capability

| Chain | n / m | On-chain `txHash` | Notes |
| --- | --- | --- | --- |
| Safe | `confirmations.length` / `confirmationsRequired` on Client Gateway details | Yes, after `SUCCESS` | Same GET the watcher already uses |
| NEAR Trezu | `vote_counts[role][0]` / `parseDaoInfo` threshold | Usually none | RoleWeight payment DAOs. Hide n/m if policy parse fails |
| Squads SDK | `proposal.approved.length` / `multisig.threshold` | Usually none | Create does not auto-approve, so n often starts at 0 |
| SquadsX | No | No | Submit empty hash after wrap |

Safe `AWAITING_EXECUTION` stays pending. Squads `Approved` stays pending until `Executed`. NEAR `Approved` is success.

## New chain checklist

1. Detect the wallet and return `pending-multisig` from transfer.
2. Add queue URL + confirm copy to `resolveMultisigConfirmToast`.
3. Implement `watch*` → `MultisigWatchSnapshot` and branch in `watchMultisigProposal`.
4. Add URL serialize / parse fields in `applyWaitingMultisig` / `parseWaitingMultisig`.
5. If the proposal cannot be watched per-item, submit `txHash: ""` after create, same as SquadsX.
