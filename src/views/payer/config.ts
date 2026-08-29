export const PAYER_PATH_PREFIX = "/paylink";
export const CHECKOUT_PATH = "/checkout";
export const CHECKOUT_WAITING_PATH = "/checkout/waiting";
export const CHECKOUT_SESSION_QUERY = "sessionId";
export const PAYER_PAYMENT_QUERY = "paymentId";
export const CHECKOUT_SUCCESS_STATUS = "success";
export const CHECKOUT_REDIRECT_SECONDS = 10;

export const AMOUNT_MAX_DECIMALS = 6;
export const QUOTE_DEBOUNCE_MS = 900;
export const ORIGIN_BALANCE_POLL_MS = 20_000;
export const STATUS_POLL_MS = 4_000;

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

export const PAY_CHECKOUT_SESSION_STATUS = {
  Created: "created",
  Processing: "processing",
  Completed: "completed",
  Failed: "failed",
  Expired: "expired",
} as const;

export const PAY_PAYMENT_STATUS = {
  Submitted: "submitted",
  Completed: "completed",
  Failed: "failed",
} as const;

export function payerPath(id: string): string {
  return `${PAYER_PATH_PREFIX}/${id}`;
}

export function payerWaitingPath(id: string, paymentId?: string): string {
  const path = `${PAYER_PATH_PREFIX}/${id}/waiting`;
  const value = paymentId?.trim() ?? "";
  if (!value) return path;
  const params = new URLSearchParams({ [PAYER_PAYMENT_QUERY]: value });
  return `${path}?${params.toString()}`;
}

export function checkoutPath(sessionId: string): string {
  const params = new URLSearchParams({ [CHECKOUT_SESSION_QUERY]: sessionId });
  return `${CHECKOUT_PATH}?${params.toString()}`;
}

export function checkoutWaitingPath(sessionId: string): string {
  const params = new URLSearchParams({ [CHECKOUT_SESSION_QUERY]: sessionId });
  return `${CHECKOUT_WAITING_PATH}?${params.toString()}`;
}
