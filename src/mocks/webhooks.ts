export const WEBHOOK_EVENT_TYPE = {
  PaymentSuccess: "payment.success",
  PaymentFailed: "payment.failed",
  PaymentAbandoned: "payment.abandoned",
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPE)[keyof typeof WEBHOOK_EVENT_TYPE];

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEventType[];
  enabled: boolean;
}

export interface WebhookEventLog {
  id: string;
  eventType: WebhookEventType;
  resourceId: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export const TEST_PAYLOAD_SUCCESS: Record<string, unknown> = {
  paymentId: "pay_test123",
  status: "SUCCESS",
  amount: "1000000",
  assetId: "usdc.near",
  payerAddress: "test-payer.near",
  recipientAddress: "test-merchant.near",
  merchantId: "test-merchant.near",
};

export const TEST_PAYLOAD_FAILED: Record<string, unknown> = {
  paymentId: "pay_test123",
  status: "FAILED",
  amount: "1000000",
  assetId: "usdc.near",
  payerAddress: "test-payer.near",
  recipientAddress: "test-merchant.near",
  merchantId: "test-merchant.near",
};

export const TEST_PAYLOAD_ABANDONED: Record<string, unknown> = {};

export const TEST_PAYLOADS: Record<WebhookEventType, Record<string, unknown>> = {
  [WEBHOOK_EVENT_TYPE.PaymentSuccess]: TEST_PAYLOAD_SUCCESS,
  [WEBHOOK_EVENT_TYPE.PaymentFailed]: TEST_PAYLOAD_FAILED,
  [WEBHOOK_EVENT_TYPE.PaymentAbandoned]: TEST_PAYLOAD_ABANDONED,
};

const ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "wh_1",
    url: "http://stargate.finance/?srcChain=base&srcToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEee...",
    events: [WEBHOOK_EVENT_TYPE.PaymentSuccess],
    enabled: true,
  },
  {
    id: "wh_2",
    url: "https://near.org/",
    events: [WEBHOOK_EVENT_TYPE.PaymentFailed],
    enabled: true,
  },
];

const EVENT_TYPES = [
  WEBHOOK_EVENT_TYPE.PaymentSuccess,
  WEBHOOK_EVENT_TYPE.PaymentFailed,
  WEBHOOK_EVENT_TYPE.PaymentAbandoned,
] as const;

const EVENT_LOGS: WebhookEventLog[] = Array.from({ length: 14 }, (_, index) => {
  const eventType = EVENT_TYPES[index % EVENT_TYPES.length];
  const paymentId = `pay_test${String(index + 1).padStart(3, "0")}`;
  return {
    id: `evt_${index + 1}`,
    eventType,
    resourceId: paymentId,
    createdAt: `2026-08-${String(14 - (index % 12)).padStart(2, "0")}T10:${String(index * 3).padStart(2, "0")}:00.000Z`,
    payload: {
      ...TEST_PAYLOADS[eventType],
      paymentId,
    },
  };
});

export function getWebhooks() {
  return {
    endpoints: ENDPOINTS.map((row) => ({ ...row, events: [...row.events] })),
    eventLogs: EVENT_LOGS.map((row) => ({ ...row, payload: { ...row.payload } })),
  };
}

export function createWebhookSecret() {
  const suffix = Math.random().toString(36).slice(2, 14);
  return `whsec_${suffix}`;
}
