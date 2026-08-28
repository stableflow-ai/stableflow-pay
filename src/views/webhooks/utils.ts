import type { WebhookEventType } from "@/mocks/webhooks";
import { WEBHOOK_EVENT_TYPE_LABEL } from "./config";

export function formatWebhookEvents(events: WebhookEventType[]) {
  return events.map((event) => WEBHOOK_EVENT_TYPE_LABEL[event]).join(", ");
}

export function stringifyPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

export function webhooksError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
