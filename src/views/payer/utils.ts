import { ApiError } from "@/lib/api-error";
import type { IntentsToken } from "@/stores/intents-tokens";
import type { PayCheckoutSession, PayPaymentDetail } from "@/types/pay";
import type { PayPaymentLink } from "@/types/payment-links";
import { Big, formatAmount } from "@/utils";
import {
  CHECKOUT_SUCCESS_STATUS,
  PAY_CHECKOUT_SESSION_STATUS,
  PAY_PAYMENT_STATUS,
  type PayerWaitStatus,
  PAYER_WAIT_STATUS,
} from "./config";

export interface PayerWaitDetails {
  destNetwork: string;
  destSymbol: string;
  feesUsd: string;
  originNetwork: string;
  originSymbol: string;
  paidAt: string;
  payerAddress: string;
  payoutUsd: string;
  recipientAddress: string;
  requestAmount: string;
  youPayAmount: string;
}

const USER_REJECTED_PATTERNS = [
  "user rejected",
  "user denied",
  "rejected the request",
  "request rejected",
  "action_rejected",
];

export function paymentLinkCardIconUrl(
  link: Pick<PayPaymentLink, "icon" | "organization"> | null | undefined,
): string {
  if (!link) return "";
  return link.icon.trim() || link.organization.logo.trim() || "";
}

export function payoutNetworkToken(token: IntentsToken): { network: string; token: string } {
  return { network: token.blockchain, token: token.symbol };
}

export function parsePositiveDecimal(raw: string, maxDecimals = 6): string | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const pattern = new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${maxDecimals}})?$`);
  if (!pattern.test(cleaned)) return null;
  try {
    if (Big(cleaned).lte(0)) return null;
  } catch {
    return null;
  }
  return cleaned;
}

export function isDryQuoteStale(input: {
  amountForQuote: string | null;
  debouncedAmountForQuote: string | null;
  isPlaceholderData: boolean;
  isPending: boolean;
  isFetching: boolean;
}): boolean {
  if (!input.amountForQuote) return false;
  const awaitingFirstFetch = input.isPending && input.isFetching;
  return (
    input.amountForQuote !== input.debouncedAmountForQuote
    || input.isPlaceholderData
    || awaitingFirstFetch
  );
}

function extractEmbeddedMessage(text: string): string | null {
  const start = text.indexOf("{");
  if (start >= 0) {
    try {
      const parsed = JSON.parse(text.slice(start)) as { message?: unknown };
      if (typeof parsed.message === "string" && parsed.message) return parsed.message;
      if (Array.isArray(parsed.message) && parsed.message.length > 0) {
        return parsed.message.map(String).join("; ");
      }
    } catch {
      // Truncated JSON
    }
  }
  const match = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (match) {
    try {
      return JSON.parse(`"${match[1]}"`) as string;
    } catch {
      return match[1];
    }
  }
  return null;
}

export function formatQuoteErrorMessage(error: unknown, decimals = 6): string {
  const raw = error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : String(error ?? "");
  const text = raw || "Quote failed";
  const message = extractEmbeddedMessage(text) || text;
  const lower = message.toLowerCase();
  if (USER_REJECTED_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return "User rejected transaction";
  }
  const amountTooLow = message.match(/Amount is too low for bridge,\s*try at least\s+(\d+(?:\.\d+)?)/i);
  if (amountTooLow) {
    try {
      const humanAmount = Big(amountTooLow[1]).div(Big(10).pow(decimals)).toFixed();
      return `Amount is too low for bridge, try at least ${humanAmount}`;
    } catch {
      return "Amount is too low for bridge";
    }
  }
  if (/No liquidity available/i.test(message)) return "No liquidity available";
  if (message.length > 80 || /Cross-chain quote failed/i.test(message)) return "Quote failed";
  return message;
}

export function formatCouponAmount(amount: string): { whole: string; fraction: string } {
  const formatted = formatAmount(amount, { prefix: "", maxDecimals: 2, padDecimals: true });
  const [whole, fraction = ""] = formatted.split(".");
  return { whole, fraction };
}

export function usdFee(amountInUsd: string, destAmount: string): string | null {
  try {
    const fee = Big(amountInUsd).minus(destAmount);
    if (fee.lte(0)) return null;
    return fee.toFixed();
  } catch {
    return null;
  }
}

export function waitStatusFromPayment(status: string | undefined): PayerWaitStatus {
  const value = String(status || "").trim().toLowerCase();
  if (value === PAY_PAYMENT_STATUS.Completed) return PAYER_WAIT_STATUS.Success;
  if (value === PAY_PAYMENT_STATUS.Failed) return PAYER_WAIT_STATUS.Failed;
  return PAYER_WAIT_STATUS.Pending;
}

export function isCheckoutOpenAmount(session: Pick<PayCheckoutSession, "amount">) {
  return !session.amount.trim();
}

function isCheckoutExpired(session: Pick<PayCheckoutSession, "expiresAt">) {
  const expiresAt = session.expiresAt.trim();
  if (!expiresAt) return false;
  const expiresMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresMs)) return false;
  return expiresMs <= Date.now();
}

export function isCheckoutPayable(session: PayCheckoutSession) {
  if (session.paymentsId.trim()) return false;
  return !isCheckoutExpired(session);
}

export function shouldCheckoutShowForm(session: PayCheckoutSession) {
  return isCheckoutPayable(session);
}

export function isCheckoutSuspended(session: PayCheckoutSession) {
  const status = session.status.trim().toLowerCase();
  if (status === PAY_CHECKOUT_SESSION_STATUS.Expired) return true;
  if (session.paymentsId.trim()) return false;
  return isCheckoutExpired(session);
}

export function isCheckoutFailedWithoutPayment(session: PayCheckoutSession) {
  if (session.paymentsId.trim()) return false;
  return session.status.trim().toLowerCase() === PAY_CHECKOUT_SESSION_STATUS.Failed;
}

export function payerWaitDetailsFromSources(input: {
  checkout?: PayCheckoutSession | null;
  payment?: PayPaymentDetail | null;
  fallbackRecipient?: string;
  fallbackAmount?: string;
  fallbackSymbol?: string;
  fallbackNetwork?: string;
  feesUsd?: string;
  payoutUsd?: string;
}): PayerWaitDetails {
  const checkout = input.checkout;
  const payment = input.payment;
  return {
    recipientAddress: payment?.recipient.trim() || checkout?.recipient.trim() || input.fallbackRecipient?.trim() || "",
    requestAmount: payment?.destinationAmount.trim()
      || checkout?.amount.trim()
      || input.fallbackAmount?.trim()
      || "",
    destSymbol: payment?.destinationSymbol.trim() || checkout?.symbol.trim() || input.fallbackSymbol?.trim() || "",
    destNetwork: payment?.destinationNetwork.trim() || checkout?.network.trim() || input.fallbackNetwork?.trim() || "",
    youPayAmount: payment?.amount.trim() || "",
    originSymbol: payment?.symbol.trim() || "",
    originNetwork: payment?.network.trim() || "",
    payerAddress: payment?.payer.trim() || "",
    paidAt: payment?.paidAt.trim() || "",
    feesUsd: input.feesUsd?.trim() || "",
    payoutUsd: input.payoutUsd?.trim() || "",
  };
}

export function buildCheckoutSuccessUrl(
  snapshot: PayCheckoutSession,
  payment?: Pick<PayPaymentDetail, "destinationTxHash" | "paidAt" | "txHash"> | null,
): string | null {
  const base = snapshot.successUrl.trim();
  if (!base) return null;
  try {
    const url = new URL(base, window.location.origin);
    url.searchParams.set("amount", snapshot.amount);
    url.searchParams.set("network", snapshot.network);
    url.searchParams.set("expires_at", snapshot.expiresAt);
    url.searchParams.set("created_at", snapshot.createdAt);
    url.searchParams.set("out_order_no", snapshot.outOrderNo);
    url.searchParams.set("recipient", snapshot.recipient);
    url.searchParams.set("session_id", snapshot.sessionId);
    url.searchParams.set("status", CHECKOUT_SUCCESS_STATUS);
    url.searchParams.set("symbol", snapshot.symbol);
    url.searchParams.set("destination_txHash", payment?.destinationTxHash.trim() ?? "");
    url.searchParams.set("paid_at", payment?.paidAt.trim() ?? "");
    url.searchParams.set("tx_hash", payment?.txHash.trim() ?? "");
    return url.toString();
  } catch {
    return null;
  }
}
