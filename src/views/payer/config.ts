export const PAYER_PATH_PREFIX = "/p";

export const AMOUNT_MAX_DECIMALS = 6;
export const QUOTE_DEBOUNCE_MS = 900;
export const ORIGIN_BALANCE_POLL_MS = 20_000;
export const STATUS_POLL_MS = 4_000;

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
} as const;

export type PayerWaitStatus = (typeof PAYER_WAIT_STATUS)[keyof typeof PAYER_WAIT_STATUS];

export const ONE_CLICK_STATUS = {
  PendingDeposit: "PENDING_DEPOSIT",
  KnownDepositTx: "KNOWN_DEPOSIT_TX",
  Processing: "PROCESSING",
  IncompleteDeposit: "INCOMPLETE_DEPOSIT",
  Success: "SUCCESS",
  Refunded: "REFUNDED",
  Failed: "FAILED",
} as const;

export function payerPath(id: string): string {
  return `${PAYER_PATH_PREFIX}/${id}`;
}

export function payerWaitingPath(id: string): string {
  return `${PAYER_PATH_PREFIX}/${id}/waiting`;
}
