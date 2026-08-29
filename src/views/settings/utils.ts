import { WEBHOOK_STATUS, type WebhookEventType } from "@/types/webhooks";
import { WEBHOOK_EVENT_TYPE_LABEL } from "./config";

export function formatWebhookEvents(events: string[]) {
  return events
    .map((event) => WEBHOOK_EVENT_TYPE_LABEL[event as WebhookEventType] ?? event)
    .join(", ");
}

export function stringifyPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

export function settingsError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isWebhookEnabled(status: string) {
  const value = status.trim().toLowerCase();
  return value === WEBHOOK_STATUS.Enabled || value === "active";
}
