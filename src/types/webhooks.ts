export const WEBHOOK_EVENT_TYPE = {
  PaymentSuccess: "payment.success",
  PaymentFailed: "payment.failed",
  PaymentAbandoned: "payment.abandoned",
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPE)[keyof typeof WEBHOOK_EVENT_TYPE];

export const WEBHOOK_STATUS = {
  Enabled: "enabled",
  Disabled: "disabled",
} as const;

export type WebhookStatus = (typeof WEBHOOK_STATUS)[keyof typeof WEBHOOK_STATUS];

export interface PayWebhook {
  webhookId: string;
  url: string;
  events: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayWebhookBody {
  events: string[];
  url: string;
}

export interface PayWebhookCreateResp extends PayWebhook {
  secret: string;
}

export interface PayWebhookRotateSecretResp {
  secret: string;
  webhookId: string;
}

export interface PayWebhookDeliveriesQuery {
  event_id?: string;
  page: number;
  pageSize: number;
  status?: number;
  webhook_id?: string;
}

export interface PayWebhookDelivery {
  deliveryId: string;
  webhookId: string;
  eventId: string;
  url: string;
  status: number;
  httpStatus: number;
  errorMessage: string;
  createdAt: string;
  completedAt: string;
}

export interface PayWebhookDeliveriesResp {
  list: PayWebhookDelivery[];
  total: number;
  totalPage: number;
}

export interface PayWebhookEventsQuery {
  page: number;
  pageSize: number;
}

export interface PayWebhookEventData {
  linkId: string;
  outOrderNo: string;
  paymentsId: string;
  resourceId: string;
  sessionId: string;
  status: string;
}

export interface PayWebhookEvent {
  id: string;
  type: string;
  createdAt: string;
  data: PayWebhookEventData;
}

export interface PayWebhookEventsResp {
  list: PayWebhookEvent[];
  total: number;
  totalPage: number;
}
