import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import type {
  PayWebhook,
  PayWebhookBody,
  PayWebhookCreateResp,
  PayWebhookDeliveriesQuery,
  PayWebhookDeliveriesResp,
  PayWebhookDelivery,
  PayWebhookEvent,
  PayWebhookEventData,
  PayWebhookEventsQuery,
  PayWebhookEventsResp,
  PayWebhookRotateSecretResp,
} from "@/types/webhooks";

function mapEvents(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((event) => apiText(event)).filter(Boolean);
}

function mapWebhook(raw: unknown): PayWebhook {
  const row = asRecord(raw) ?? {};
  return {
    webhookId: apiText(row.webhook_id ?? row.webhookId),
    url: apiText(row.url),
    events: mapEvents(row.events),
    status: apiText(row.status),
    createdAt: apiText(row.created_at ?? row.createdAt),
    updatedAt: apiText(row.updated_at ?? row.updatedAt),
  };
}

function mapWebhookList(data: unknown): PayWebhook[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.list)
      ? (asRecord(data)?.list as unknown[])
      : [];
  return list.map(mapWebhook).filter((row) => row.webhookId);
}

export async function listWebhooks(): Promise<PayWebhook[]> {
  return mapWebhookList(await http<unknown>(`${PAY_API_PREFIX}/webhooks`));
}

export async function createWebhook(body: PayWebhookBody): Promise<PayWebhookCreateResp> {
  const data = asRecord(await http<unknown>(`${PAY_API_PREFIX}/webhooks`, { method: "POST", body })) ?? {};
  return {
    ...mapWebhook(data),
    secret: apiText(data.secret),
  };
}

export async function getWebhook(webhookId: string): Promise<PayWebhook> {
  return mapWebhook(await http<unknown>(`${PAY_API_PREFIX}/webhooks/${webhookId}`));
}

export async function updateWebhook(webhookId: string, body: PayWebhookBody): Promise<PayWebhook> {
  return mapWebhook(
    await http<unknown>(`${PAY_API_PREFIX}/webhooks/${webhookId}`, { method: "POST", body }),
  );
}

export function deleteWebhook(webhookId: string) {
  return http<string>(`${PAY_API_PREFIX}/webhooks/${webhookId}`, { method: "DELETE" });
}

export function enableWebhook(webhookId: string) {
  return http<string>(`${PAY_API_PREFIX}/webhooks/${webhookId}/enable`, { method: "POST" });
}

export function disableWebhook(webhookId: string) {
  return http<string>(`${PAY_API_PREFIX}/webhooks/${webhookId}/disable`, { method: "POST" });
}

export async function rotateWebhookSecret(webhookId: string): Promise<PayWebhookRotateSecretResp> {
  const data = asRecord(
    await http<unknown>(`${PAY_API_PREFIX}/webhooks/${webhookId}/rotate-secret`, { method: "POST" }),
  ) ?? {};
  return {
    secret: apiText(data.secret),
    webhookId: apiText(data.webhook_id ?? data.webhookId) || webhookId,
  };
}

function mapDelivery(raw: unknown): PayWebhookDelivery {
  const row = asRecord(raw) ?? {};
  return {
    deliveryId: apiText(row.delivery_id ?? row.deliveryId),
    webhookId: apiText(row.webhook_id ?? row.webhookId),
    eventId: apiText(row.event_id ?? row.eventId),
    url: apiText(row.url),
    status: apiNumber(row.status) ?? 0,
    httpStatus: apiNumber(row.http_status ?? row.httpStatus) ?? 0,
    errorMessage: apiText(row.error_message ?? row.errorMessage),
    createdAt: apiText(row.created_at ?? row.createdAt),
    completedAt: apiText(row.completed_at ?? row.completedAt),
  };
}

export async function listWebhookDeliveries(
  params: PayWebhookDeliveriesQuery,
): Promise<PayWebhookDeliveriesResp> {
  const data = asRecord(
    await http<unknown>(`${PAY_API_PREFIX}/webhooks/deliveries`, {
      query: {
        event_id: params.event_id,
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        webhook_id: params.webhook_id,
      },
    }),
  ) ?? {};
  const rawList = Array.isArray(data.list) ? data.list : [];
  const list = rawList.map(mapDelivery).filter((row) => row.deliveryId);
  return {
    list,
    total: apiNumber(data.total) ?? list.length,
    totalPage: Math.max(1, apiNumber(data.total_page ?? data.totalPage) ?? 1),
  };
}

function mapEventData(raw: unknown): PayWebhookEventData {
  const row = asRecord(raw) ?? {};
  return {
    linkId: apiText(row.link_id ?? row.linkId),
    outOrderNo: apiText(row.out_order_no ?? row.outOrderNo),
    paymentsId: apiText(row.payments_id ?? row.paymentsId),
    resourceId: apiText(row.resource_id ?? row.resourceId),
    sessionId: apiText(row.session_id ?? row.sessionId),
    status: apiText(row.status),
  };
}

function mapEvent(raw: unknown): PayWebhookEvent {
  const row = asRecord(raw) ?? {};
  return {
    id: apiText(row.id),
    type: apiText(row.type),
    createdAt: apiText(row.created_at ?? row.createdAt),
    data: mapEventData(row.data),
  };
}

export async function listWebhookEvents(params: PayWebhookEventsQuery): Promise<PayWebhookEventsResp> {
  const data = asRecord(
    await http<unknown>(`${PAY_API_PREFIX}/webhooks/events`, {
      query: {
        page: params.page,
        pageSize: params.pageSize,
      },
    }),
  ) ?? {};
  const rawList = Array.isArray(data.list) ? data.list : [];
  const list = rawList.map(mapEvent).filter((row) => row.id);
  return {
    list,
    total: apiNumber(data.total) ?? list.length,
    totalPage: Math.max(1, apiNumber(data.total_page ?? data.totalPage) ?? 1),
  };
}
