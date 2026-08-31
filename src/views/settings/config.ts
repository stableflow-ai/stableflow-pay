import { WEBHOOK_EVENT_TYPE, type WebhookEventType } from "@/types/webhooks";

export const ORGANIZATION_NAME_MAX_LENGTH = 50;
export const ORGANIZATION_SLUG_MAX_LENGTH = 50;
export const LOGO_URL_MAX_LENGTH = 500;
export const RECIPIENT_ADDRESS_MAX_LENGTH = 200;
export const WEBHOOK_URL_MAX_LENGTH = 500;

export const WEBHOOK_EVENT_TYPE_LABEL: Record<WebhookEventType, string> = {
  [WEBHOOK_EVENT_TYPE.PaymentSuccess]: "Payment Success",
  [WEBHOOK_EVENT_TYPE.PaymentFailed]: "Payment Failed",
  [WEBHOOK_EVENT_TYPE.PaymentAbandoned]: "Payment Abandoned",
};

export const WEBHOOK_EVENT_OPTIONS: { value: WebhookEventType; label: string }[] = [
  {
    value: WEBHOOK_EVENT_TYPE.PaymentSuccess,
    label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentSuccess],
  },
  {
    value: WEBHOOK_EVENT_TYPE.PaymentFailed,
    label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentFailed],
  },
  // {
  //   value: WEBHOOK_EVENT_TYPE.PaymentAbandoned,
  //   label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentAbandoned],
  // },
];

export const WEBHOOK_SIGNING_SECRET_SUBTITLE =
  "Copy this secret now. For security reasons, please save it carefully.";

export const TEST_PAYLOAD_SUCCESS: Record<string, unknown> = {
  payments_id: "pay_test123",
  status: "success",
  session_id: "cs_test123",
  out_order_no: "order_test123",
};

export const TEST_PAYLOAD_FAILED: Record<string, unknown> = {
  payments_id: "pay_test123",
  status: "failed",
  session_id: "cs_test123",
  out_order_no: "order_test123",
};

export const TEST_PAYLOAD_ABANDONED: Record<string, unknown> = {};

export const TEST_PAYLOADS: Record<WebhookEventType, Record<string, unknown>> = {
  [WEBHOOK_EVENT_TYPE.PaymentSuccess]: TEST_PAYLOAD_SUCCESS,
  [WEBHOOK_EVENT_TYPE.PaymentFailed]: TEST_PAYLOAD_FAILED,
  [WEBHOOK_EVENT_TYPE.PaymentAbandoned]: TEST_PAYLOAD_ABANDONED,
};
