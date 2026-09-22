import {
  PAY_CHECKOUT_SESSION_STATUS,
  PAY_PAYMENT_STATUS,
} from "@/types/pay";
import type { PendingMultisigBroadcast } from "@/wallet/types";

export { PAY_CHECKOUT_SESSION_STATUS, PAY_PAYMENT_STATUS };

export const PAYER_PATH_PREFIX = "/paylink";
export const CHECKOUT_PATH = "/checkout";
export const CHECKOUT_WAITING_PATH = "/checkout/waiting";
export const CHECKOUT_SESSION_QUERY = "sessionId";
export const PAYER_PAYMENT_QUERY = "paymentId";
export const PAYER_SWAP_QUERY = "swapId";
export const PAYER_MS_KIND_QUERY = "msKind";
export const PAYER_MS_SAFE_QUERY = "msSafe";
export const PAYER_MS_TX_QUERY = "msTx";
export const PAYER_MS_CHAIN_QUERY = "msChain";
export const PAYER_MS_DAO_QUERY = "msDao";
export const PAYER_MS_PROPOSAL_QUERY = "msProposal";
export const PAYER_MS_VAULT_QUERY = "msVault";
export const PAYER_MS_PDA_QUERY = "msPda";
export const PAYER_MS_INDEX_QUERY = "msIndex";
export const PAYER_DEADLINE_QUERY = "deadline";
export const CHECKOUT_SUCCESS_STATUS = "success";
export const CHECKOUT_REDIRECT_SECONDS = 10;

export const AMOUNT_MAX_DECIMALS = 6;
export const QUOTE_DEBOUNCE_MS = 900;
export const ORIGIN_BALANCE_POLL_MS = 20_000;
export const STATUS_POLL_MS = 4_000;
export const SPENT_QUOTE_MESSAGE = "This quote was already used. Refreshing the quote.";
export const QUOTE_EXPIRED_MESSAGE = "Quote expired. Refreshing.";

export const PAYER_KIND = {
  Paylink: "paylink",
  Checkout: "checkout",
} as const;

export type PayerKind = (typeof PAYER_KIND)[keyof typeof PAYER_KIND];

export const PAYER_WAITING_STATE = {
  awaitingSubmit: true,
} as const;

export const PAYER_CARD_STATE = {
  Loading: "loading",
  Pay: "pay",
  Unavailable: "unavailable",
} as const;

export type PayerCardState = (typeof PAYER_CARD_STATE)[keyof typeof PAYER_CARD_STATE];

export const PAYER_WAIT_STATUS = {
  Pending: "pending",
  Success: "success",
  Failed: "failed",
  Suspended: "suspended",
} as const;

export type PayerWaitStatus = (typeof PAYER_WAIT_STATUS)[keyof typeof PAYER_WAIT_STATUS];

export function payerPath(id: string): string {
  return `${PAYER_PATH_PREFIX}/${id}`;
}

export interface PayerWaitingQuery {
  paymentId?: string;
  swapId?: string;
  proposal?: PendingMultisigBroadcast;
  deadline?: string;
}

export function applyWaitingMultisig(
  params: URLSearchParams,
  input: { swapId: string; proposal: PendingMultisigBroadcast; deadline?: string },
) {
  params.set(PAYER_SWAP_QUERY, input.swapId);
  params.set(PAYER_MS_KIND_QUERY, input.proposal.chainKind);
  const deadline = input.deadline?.trim() ?? "";
  if (deadline) params.set(PAYER_DEADLINE_QUERY, deadline);
  if (input.proposal.chainKind === "evm") {
    params.set(PAYER_MS_SAFE_QUERY, input.proposal.safeAddress);
    params.set(PAYER_MS_TX_QUERY, input.proposal.safeTxHash);
    params.set(PAYER_MS_CHAIN_QUERY, String(input.proposal.chainId));
    return;
  }
  if (input.proposal.chainKind === "near") {
    params.set(PAYER_MS_DAO_QUERY, input.proposal.daoId);
    params.set(PAYER_MS_PROPOSAL_QUERY, String(input.proposal.proposalId));
    return;
  }
  params.set(PAYER_MS_VAULT_QUERY, input.proposal.vaultAddress);
  if (input.proposal.multisigPda) params.set(PAYER_MS_PDA_QUERY, input.proposal.multisigPda);
  if (input.proposal.transactionIndex != null) {
    params.set(PAYER_MS_INDEX_QUERY, input.proposal.transactionIndex.toString());
  }
}

function applyWaitingQuery(params: URLSearchParams, query?: PayerWaitingQuery) {
  const paymentId = query?.paymentId?.trim() ?? "";
  if (paymentId) params.set(PAYER_PAYMENT_QUERY, paymentId);
  const swapId = query?.swapId?.trim() ?? "";
  if (swapId && query?.proposal) {
    applyWaitingMultisig(params, {
      swapId,
      proposal: query.proposal,
      deadline: query.deadline,
    });
  }
}

export function payerWaitingPath(id: string, query?: PayerWaitingQuery): string {
  const path = `${PAYER_PATH_PREFIX}/${id}/waiting`;
  const params = new URLSearchParams();
  applyWaitingQuery(params, query);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function checkoutPath(sessionId: string): string {
  const params = new URLSearchParams({ [CHECKOUT_SESSION_QUERY]: sessionId });
  return `${CHECKOUT_PATH}?${params.toString()}`;
}

export function checkoutWaitingPath(sessionId: string, query?: PayerWaitingQuery): string {
  const params = new URLSearchParams({ [CHECKOUT_SESSION_QUERY]: sessionId });
  applyWaitingQuery(params, query);
  return `${CHECKOUT_WAITING_PATH}?${params.toString()}`;
}
