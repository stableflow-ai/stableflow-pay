import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import { ApiError } from "@/lib/api-error";
import type { PayQuoteParam, PayQuoteResp, PaySwapParam, PaySwapResp, PaySwapSubmitParam } from "@/types/pay";

function mapQuote(raw: unknown): PayQuoteResp {
  const row = asRecord(raw) ?? {};
  return {
    amountIn: apiText(row.amountIn ?? row.amount_in),
    amountInFormatted: apiText(row.amountInFormatted ?? row.amount_in_formatted),
    amountInUsd: apiText(row.amountInUsd ?? row.amount_in_usd),
    amountOut: apiText(row.amountOut ?? row.amount_out),
    amountOutFormatted: apiText(row.amountOutFormatted ?? row.amount_out_formatted),
    amountOutUsd: apiText(row.amountOutUsd ?? row.amount_out_usd),
    deadline: apiText(row.deadline),
    timeEstimate: apiNumber(row.timeEstimate ?? row.time_estimate) ?? 0,
  };
}

function mapSwap(raw: unknown): PaySwapResp {
  const quote = mapQuote(raw);
  const row = asRecord(raw) ?? {};
  return {
    ...quote,
    depositAddress: apiText(row.depositAddress ?? row.deposit_address),
    swapId: apiText(row.swapId ?? row.swap_id),
  };
}

export function payQuote(body: PayQuoteParam, options?: { auth?: boolean }) {
  return http<unknown>(`${PAY_API_PREFIX}/quote`, {
    method: "POST",
    body,
    auth: options?.auth ?? true,
  }).then(mapQuote);
}

export async function paySwapLink(
  linkId: string,
  body: PaySwapParam,
  options?: { auth?: boolean },
): Promise<PaySwapResp> {
  const swapped = mapSwap(
    await http<unknown>(`${PAY_API_PREFIX}/swap/link/${linkId}`, {
      method: "POST",
      body,
      auth: options?.auth ?? true,
    }),
  );
  if (!swapped.swapId.trim() || !swapped.depositAddress.trim()) {
    throw new ApiError("Swap did not return a deposit address", 400, "PAY_SWAP");
  }
  return swapped;
}

export async function paySwapCheckout(
  sessionId: string,
  body: PaySwapParam,
  options?: { auth?: boolean },
): Promise<PaySwapResp> {
  const swapped = mapSwap(
    await http<unknown>(`${PAY_API_PREFIX}/swap/checkout/${sessionId}`, {
      method: "POST",
      body,
      auth: options?.auth ?? true,
    }),
  );
  if (!swapped.swapId.trim() || !swapped.depositAddress.trim()) {
    throw new ApiError("Swap did not return a deposit address", 400, "PAY_SWAP");
  }
  return swapped;
}

export function paySwapSubmit(body: PaySwapSubmitParam, options?: { auth?: boolean }) {
  return http<string>(`${PAY_API_PREFIX}/swap/submit`, {
    method: "POST",
    body,
    auth: options?.auth ?? true,
  });
}
