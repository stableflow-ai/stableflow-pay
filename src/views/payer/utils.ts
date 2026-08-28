import { ApiError } from "@/lib/api-error";
import type { IntentsToken } from "@/stores/intents-tokens";
import { Big, formatAmount } from "@/utils";
import { ONE_CLICK_STATUS, type PayerWaitStatus, PAYER_WAIT_STATUS } from "./config";

const USER_REJECTED_PATTERNS = [
  "user rejected",
  "user denied",
  "rejected the request",
  "request rejected",
  "action_rejected",
];

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

export function waitStatusFromOneClick(status: string | undefined): PayerWaitStatus {
  const value = String(status || "").toUpperCase();
  if (value === ONE_CLICK_STATUS.Success) return PAYER_WAIT_STATUS.Success;
  if (
    value === ONE_CLICK_STATUS.Failed
    || value === ONE_CLICK_STATUS.Refunded
    || value === ONE_CLICK_STATUS.IncompleteDeposit
  ) {
    return PAYER_WAIT_STATUS.Failed;
  }
  return PAYER_WAIT_STATUS.Pending;
}
