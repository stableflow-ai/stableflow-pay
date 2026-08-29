import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiText, asRecord } from "@/api/map";
import type { PayPaymentLink, PayPaymentLinkBody } from "@/types/payment-links";

export function mapPaymentLink(raw: unknown): PayPaymentLink {
  const row = asRecord(raw) ?? {};
  return {
    linkId: apiText(row.link_id ?? row.linkId),
    title: apiText(row.title),
    description: apiText(row.description),
    amount: apiText(row.amount),
    symbol: apiText(row.symbol),
    network: apiText(row.network),
    recipient: apiText(row.recipient),
    status: apiText(row.status),
    createdAt: apiText(row.created_at ?? row.createdAt),
  };
}

function mapPaymentLinkList(data: unknown): PayPaymentLink[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.list)
      ? (asRecord(data)?.list as unknown[])
      : [];
  return list.map(mapPaymentLink).filter((row) => row.linkId);
}

export async function listPaymentLinks(): Promise<PayPaymentLink[]> {
  return mapPaymentLinkList(await http<unknown>(`${PAY_API_PREFIX}/links`));
}

export async function createPaymentLink(body: PayPaymentLinkBody): Promise<PayPaymentLink> {
  return mapPaymentLink(await http<unknown>(`${PAY_API_PREFIX}/links`, { method: "POST", body }));
}

export async function getPaymentLink(linkId: string, options?: { auth?: boolean }): Promise<PayPaymentLink> {
  return mapPaymentLink(
    await http<unknown>(`${PAY_API_PREFIX}/links/${linkId}`, {
      auth: options?.auth ?? true,
    }),
  );
}

export function deletePaymentLink(linkId: string) {
  return http<string>(`${PAY_API_PREFIX}/links/${linkId}`, { method: "DELETE" });
}

export function enablePaymentLink(linkId: string) {
  return http<string>(`${PAY_API_PREFIX}/links/${linkId}/enable`, { method: "POST" });
}

export function disablePaymentLink(linkId: string) {
  return http<string>(`${PAY_API_PREFIX}/links/${linkId}/disable`, { method: "POST" });
}
