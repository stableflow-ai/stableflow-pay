import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiText, asRecord } from "@/api/map";
import type { PayCheckoutSession, PayCheckoutSessionBody } from "@/types/pay";

export function mapCheckoutSession(raw: unknown): PayCheckoutSession {
  const row = asRecord(raw) ?? {};
  return {
    amount: apiText(row.amount),
    createdAt: apiText(row.created_at ?? row.createdAt),
    expiresAt: apiText(row.expires_at ?? row.expiresAt),
    network: apiText(row.network),
    outOrderNo: apiText(row.out_order_no ?? row.outOrderNo),
    paymentsId: apiText(row.payments_id ?? row.paymentsId),
    recipient: apiText(row.recipient),
    sessionId: apiText(row.session_id ?? row.sessionId),
    status: apiText(row.status),
    successUrl: apiText(row.success_url ?? row.successUrl),
    symbol: apiText(row.symbol),
  };
}

export async function createCheckoutSession(
  body: PayCheckoutSessionBody,
  apiKey: string,
): Promise<unknown> {
  return http<unknown>(`${PAY_API_PREFIX}/checkout/sessions`, {
    method: "POST",
    body,
    apiKey,
    sameOrigin: import.meta.env.DEV,
  });
}

export async function getCheckoutSession(
  sessionId: string,
  options?: { auth?: boolean },
): Promise<PayCheckoutSession> {
  return mapCheckoutSession(
    await http<unknown>(`${PAY_API_PREFIX}/checkout/sessions/${sessionId}`, {
      auth: options?.auth ?? true,
    }),
  );
}
