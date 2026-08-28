import { WEBHOOK_EVENT_TYPE, type WebhookEventType } from "@/mocks/webhooks";

export const WEBHOOK_EVENT_TYPE_LABEL: Record<WebhookEventType, string> = {
  [WEBHOOK_EVENT_TYPE.PaymentSuccess]: "Payment Success",
  [WEBHOOK_EVENT_TYPE.PaymentFailed]: "Payment Failed",
  [WEBHOOK_EVENT_TYPE.PaymentAbandoned]: "Payment Abandoned",
};

export const WEBHOOK_EVENT_OPTIONS: { value: WebhookEventType; label: string }[] = [
  { value: WEBHOOK_EVENT_TYPE.PaymentSuccess, label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentSuccess] },
  { value: WEBHOOK_EVENT_TYPE.PaymentFailed, label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentFailed] },
  { value: WEBHOOK_EVENT_TYPE.PaymentAbandoned, label: WEBHOOK_EVENT_TYPE_LABEL[WEBHOOK_EVENT_TYPE.PaymentAbandoned] },
];

export const EVENT_LOGS_PAGE_SIZE = 10;

export const EVENT_LOGS_TABLE_COLUMNS =
  "minmax(160px,1.1fr) minmax(140px,1fr) minmax(170px,1.1fr) minmax(220px,1.4fr)";

export const WEBHOOK_SIGNING_SECRET_SUBTITLE =
  "Copy this secret now. For security reasons, it will not be shown again.";

export const SIGNATURE_VERIFICATION_CODE = `const crypto = require('crypto');

function verifySignature(payload, timestamp, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${payload}\`)
    .digest('hex');
  return signature === expected;
}

// Express.js middleware example
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-ping-signature'];
  const timestamp = req.headers['x-ping-timestamp'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, timestamp, signature, YOUR_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});`;
