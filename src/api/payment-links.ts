import { http, httpBlob } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { mapPaymentDetail } from "@/api/payout";
import { apiNumber, apiText, asRecord, mapOrganizationLogo } from "@/api/map";
import type { PayPaymentDetail } from "@/types/pay";
import type {
  PayDefaultAddress,
  PayPaymentLink,
  PayPaymentLinkBody,
  PayPaymentLinkPaymentsQuery,
  PayPaymentLinksQuery,
  PayPaymentLinksResp,
} from "@/types/payment-links";

export function mapPaymentLink(raw: unknown): PayPaymentLink {
  const row = asRecord(raw) ?? {};
  return {
    linkId: apiText(row.link_id ?? row.linkId),
    title: apiText(row.title),
    description: apiText(row.description),
    icon: apiText(row.icon),
    amount: apiText(row.amount),
    symbol: apiText(row.symbol),
    network: apiText(row.network),
    recipient: apiText(row.recipient),
    status: apiText(row.status),
    createdAt: apiText(row.created_at ?? row.createdAt),
    revenue: apiText(row.revenue),
    payments: apiNumber(row.payments ?? row.transactions) ?? 0,
    organization: mapOrganizationLogo(row.organization),
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

export async function listPaymentLinks(query: PayPaymentLinksQuery): Promise<PayPaymentLinksResp> {
  const data = asRecord(await http<unknown>(`${PAY_API_PREFIX}/links`, {
    query: {
      page: query.page,
      pageSize: query.pageSize,
      q: query.q?.trim() || undefined,
    },
  })) ?? {};
  const list = mapPaymentLinkList(data.list ?? data);
  return {
    total: apiNumber(data.total) ?? list.length,
    totalPage: Math.max(1, apiNumber(data.total_page ?? data.totalPage) ?? 1),
    list,
  };
}

export async function createPaymentLink(body: PayPaymentLinkBody): Promise<PayPaymentLink> {
  return mapPaymentLink(
    await http<unknown>(`${PAY_API_PREFIX}/links`, {
      method: "POST",
      body: {
        title: body.title,
        description: body.description,
        icon: body.icon,
        amount: body.amount,
        symbol: body.symbol,
        network: body.network,
        recipient: body.recipient,
        default_address: body.defaultAddress,
      },
    }),
  );
}

export function mapDefaultAddress(raw: unknown): PayDefaultAddress {
  const row = asRecord(raw) ?? {};
  return {
    network: apiText(row.network),
    recipient: apiText(row.recipient),
  };
}

export async function listDefaultAddresses(): Promise<PayDefaultAddress[]> {
  const data = await http<unknown>(`${PAY_API_PREFIX}/links/default-addresses`);
  const nested = asRecord(data)?.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(nested)
      ? nested
      : [];
  return list.map(mapDefaultAddress).filter((row) => row.network && row.recipient);
}

export async function getPaymentLink(linkId: string, options?: { auth?: boolean }): Promise<PayPaymentLink> {
  return mapPaymentLink(
    await http<unknown>(`${PAY_API_PREFIX}/links/${linkId}`, {
      auth: options?.auth ?? true,
    }),
  );
}

export async function getPaymentLinkStats(linkId: string): Promise<PayPaymentLink> {
  return mapPaymentLink(await http<unknown>(`${PAY_API_PREFIX}/links/${linkId}/stats`));
}

export async function listPaymentLinkPayments(
  linkId: string,
  query: PayPaymentLinkPaymentsQuery,
): Promise<{ total: number; totalPage: number; list: PayPaymentDetail[] }> {
  const data = asRecord(await http<unknown>(`${PAY_API_PREFIX}/links/${linkId}/payments`, {
    query: {
      page: query.page,
      pageSize: query.pageSize,
    },
  })) ?? {};
  const rawList = Array.isArray(data.list) ? data.list : [];
  const list = rawList.map(mapPaymentDetail);
  return {
    total: apiNumber(data.total) ?? list.length,
    totalPage: Math.max(1, apiNumber(data.total_page ?? data.totalPage) ?? 1),
    list,
  };
}

const LINK_PAYMENTS_EXPORT_FILENAME = "payment-link-transactions.csv";

export function exportPaymentLinkPayments(linkId: string) {
  return httpBlob(`${PAY_API_PREFIX}/links/${linkId}/payments/export`, {
    fallbackFilename: LINK_PAYMENTS_EXPORT_FILENAME,
  });
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
