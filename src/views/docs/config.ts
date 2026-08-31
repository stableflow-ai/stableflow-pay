export const DOCS_TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quickstart" },
  { id: "create-checkout-session", label: "Create a Checkout Session" },
  { id: "redirect-customer", label: "Redirect the customer" },
  { id: "confirm-payment", label: "Confirm the payment" },
  { id: "receive-webhooks", label: "Receive webhooks" },
  { id: "errors-and-retries", label: "Errors and retries" },
  { id: "supported-assets", label: "Supported assets" },
  { id: "contract-notes", label: "Contract notes" },
  { id: "api-reference", label: "API reference" },
  { id: "production-checklist", label: "Go-live checklist" },
] as const;

export type DocsTocId = (typeof DOCS_TOC_ITEMS)[number]["id"];

export const DOC_CELL_VARIANT = {
  Plain: "plain",
  Code: "code",
  Strong: "strong",
} as const;

export type DocCellVariant = (typeof DOC_CELL_VARIANT)[keyof typeof DOC_CELL_VARIANT];

export type DocTableCell = {
  text: string;
  variant?: DocCellVariant;
};

export type DocTableDefinition = {
  label: string;
  columns: string;
  headers: readonly string[];
  rows: readonly (readonly DocTableCell[])[];
};

const plain = (text: string): DocTableCell => ({ text });
const code = (text: string): DocTableCell => ({ text, variant: DOC_CELL_VARIANT.Code });
const strong = (text: string): DocTableCell => ({ text, variant: DOC_CELL_VARIANT.Strong });

export const CHECKOUT_OPTIONS_TABLE: DocTableDefinition = {
  label: "StableFlow Pay integration options",
  columns: "minmax(105px,0.65fr) minmax(220px,1.8fr)",
  headers: ["Option", "Best for"],
  rows: [
    [strong("Payment Link"), plain("Create a reusable payment link in the dashboard. No code required.")],
    [strong("Checkout API"), plain("Create a new checkout for each order from your backend.")],
  ],
};

export const ENVIRONMENTS_TABLE: DocTableDefinition = {
  label: "StableFlow Pay API environments",
  columns: "minmax(105px,0.55fr) minmax(230px,1.25fr) minmax(250px,1.5fr)",
  headers: ["Environment", "Base URL", "Use"],
  rows: [
    [
      strong("Test"),
      code("https://test-api.stableflow.ai"),
      plain("Repository default for API integration. Confirm account access and whether checkout assets use mainnet."),
    ],
    [
      strong("Production"),
      plain("Confirm with StableFlow"),
      plain("Use only the production endpoint and API key issued for your production account."),
    ],
  ],
};

export const REQUIRED_FIELDS_TABLE: DocTableDefinition = {
  label: "Required Checkout Session fields",
  columns: "minmax(105px,0.65fr) minmax(220px,1.8fr)",
  headers: ["Field", "Description"],
  rows: [
    [code("amount"), plain("Amount you want to receive. Send it as a decimal string.")],
    [code("symbol"), plain("Asset you want to receive, such as USDC.")],
    [code("network"), plain("Network on which you want to receive it, such as base.")],
    [code("recipient"), plain("Your receiving address on the destination network.")],
  ],
};

export const ADDITIONAL_FIELDS_TABLE: DocTableDefinition = {
  label: "Additional Checkout Session fields",
  columns: "minmax(120px,0.65fr) minmax(240px,1.45fr) minmax(220px,1.25fr)",
  headers: ["Field", "Description", "Integration guidance"],
  rows: [
    [
      code("out_order_no"),
      plain("Your order ID. Use it to match payments to orders."),
      plain("Send it for reconciliation. Confirm uniqueness and omission behavior before production."),
    ],
    [
      code("success_url"),
      plain("Absolute HTTP or HTTPS browser return URL."),
      plain("Send it for the hosted return flow. Never use it as proof of payment."),
    ],
  ],
};

export const SESSION_STATUSES_TABLE: DocTableDefinition = {
  label: "Checkout Session statuses",
  columns: "minmax(105px,0.65fr) minmax(220px,1.8fr)",
  headers: ["Status", "Meaning"],
  rows: [
    [code("created"), plain("Waiting for the customer.")],
    [code("processing"), plain("Transaction submitted and being processed.")],
    [code("completed"), plain("Payment completed.")],
    [code("failed"), plain("Payment failed.")],
    [code("expired"), plain("Session expired before submission.")],
  ],
};

export const WEBHOOK_EVENTS_TABLE: DocTableDefinition = {
  label: "Webhook event types",
  columns: "minmax(130px,0.75fr) minmax(195px,1.8fr)",
  headers: ["Event", "Meaning"],
  rows: [
    [code("payment.success"), plain("The destination payment completed.")],
    [code("payment.failed"), plain("Payment processing failed.")],
    [
      code("payment.abandoned"),
      plain("Available in the current dashboard selector. Confirm its delivery contract before relying on it."),
    ],
  ],
};

export const PAYMENT_STATUSES_TABLE: DocTableDefinition = {
  label: "Payment statuses",
  columns: "minmax(105px,0.65fr) minmax(220px,1.8fr)",
  headers: ["Status", "Meaning"],
  rows: [
    [code("submitted"), plain("The source transaction was submitted for processing.")],
    [code("completed"), plain("The destination payment completed.")],
    [code("failed"), plain("Payment processing failed.")],
  ],
};

export const RETRY_GUIDANCE_TABLE: DocTableDefinition = {
  label: "StableFlow Pay retry guidance",
  columns: "minmax(150px,0.75fr) minmax(260px,1.55fr) minmax(220px,1.25fr)",
  headers: ["Situation", "Action", "Reason"],
  rows: [
    [
      strong("Status GET fails"),
      plain("Retry with exponential backoff and a maximum wait time."),
      plain("Reads do not create another Checkout Session."),
    ],
    [
      strong("Session POST times out"),
      plain("Do not retry automatically. Confirm a manual recovery path before production."),
      plain("A timeout does not prove that the server rejected the request."),
    ],
    [
      strong("400 or 401"),
      plain("Fix the request or API key before retrying."),
      plain("Repeating the same request will not resolve validation or authentication errors."),
    ],
    [
      strong("Webhook is missing"),
      plain("Query the Session as a recovery path."),
      plain("The supplied contract describes one delivery attempt."),
    ],
  ],
};

export const CONTRACT_NOTES_TABLE: DocTableDefinition = {
  label: "Checkout API contract items to confirm before production",
  columns: "minmax(150px,0.7fr) minmax(260px,1.7fr)",
  headers: ["Area", "Confirm before production"],
  rows: [
    [strong("API environment"), plain("Production base URL, credentials, quotas, and rate limits.")],
    [strong("Support"), plain("A published support destination and manual recovery process for ambiguous requests.")],
    [
      strong("Session creation"),
      plain("Whether out_order_no is unique or idempotent, and whether out_order_no and success_url may be omitted."),
    ],
    [
      strong("Amounts"),
      plain("Minimum, maximum, precision, rounding, fees, exchange-rate timing, and expiry behavior."),
    ],
    [
      strong("Status lookups"),
      plain("Production authentication policy, polling limits, status finality, and retention period."),
    ],
    [
      strong("Webhooks"),
      plain("Delivery timeout, retry or replay process, timestamp tolerance, and payment.abandoned semantics."),
    ],
    [
      strong("Errors"),
      plain("Complete error schema, 404/409/429 behavior, and which failures are safe to retry."),
    ],
    [
      strong("Browser return"),
      plain("Redirect timing, stable query parameters, existing-query preservation, and HTTPS requirements."),
    ],
  ],
};

export const API_REFERENCE_TABLE: DocTableDefinition = {
  label: "StableFlow Pay API endpoints",
  columns: "80px 280px 140px 260px",
  headers: ["Method", "Endpoint", "Authentication", "Purpose"],
  rows: [
    [code("GET"), code("/tokens"), plain("No"), plain("List supported assets.")],
    [code("POST"), code("/checkout/sessions"), code("x-api-key"), plain("Create a Checkout Session.")],
    [
      code("GET"),
      code("/checkout/sessions/{sessionId}"),
      plain("No API key (test)"),
      plain("Get the current Session status."),
    ],
    [
      code("GET"),
      code("/payments/{paymentId}"),
      plain("No API key (test)"),
      plain("Get source and destination transaction details."),
    ],
  ],
};

export const COMMON_ERRORS_TABLE: DocTableDefinition = {
  label: "Common API errors",
  columns: "minmax(105px,0.65fr) minmax(220px,1.8fr)",
  headers: ["HTTP status", "Meaning"],
  rows: [
    [code("400"), plain("Invalid request, amount, asset, network, or URL.")],
    [code("401"), plain("API key is missing, invalid, or deleted.")],
    [code("500"), plain("Unexpected server or provider error.")],
  ],
};

export const ENVIRONMENT_CODE = `export BASE_URL="https://test-api.stableflow.ai"
export STABLEFLOW_API_KEY="your-server-side-api-key"
export RECEIVE_SYMBOL="USDC"
export RECEIVE_NETWORK="base"
export RECIPIENT_ADDRESS="your-address-on-the-receive-network"
export SUCCESS_URL="https://your-domain.example/payment/success"`;

export const CREATE_SESSION_CODE = `curl -X POST "\${BASE_URL}/v1/pay/checkout/sessions" \\
  -H "x-api-key: \${STABLEFLOW_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "10.50",
    "symbol": "'"\${RECEIVE_SYMBOL}"'",
    "network": "'"\${RECEIVE_NETWORK}"'",
    "recipient": "'"\${RECIPIENT_ADDRESS}"'",
    "out_order_no": "order-10001",
    "success_url": "'"\${SUCCESS_URL}"'"
  }'`;

export const CREATE_SESSION_RESPONSE_CODE = `{
  "code": 200,
  "data": {
    "session_id": "cs_rOGsr6knI-CEb6vy9UA87",
    "session_url": "https://checkout.example.com/checkout?sessionId=cs_rOGsr6knI-CEb6vy9UA87",
    "status": "created",
    "expires_at": "2026-08-30T12:30:00Z"
  }
}`;

export const CREATE_SESSION_BACKEND_CODE = `export async function createStableFlowCheckout({
  amount,
  orderId,
}) {
  const response = await fetch(
    \`\${process.env.BASE_URL}/v1/pay/checkout/sessions\`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.STABLEFLOW_API_KEY,
      },
      body: JSON.stringify({
        amount,
        symbol: process.env.RECEIVE_SYMBOL,
        network: process.env.RECEIVE_NETWORK,
        recipient: process.env.RECIPIENT_ADDRESS,
        out_order_no: orderId,
        success_url: process.env.SUCCESS_URL,
      }),
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.code !== 200 || !payload?.data?.session_url) {
    throw new Error(
      payload?.message || \`StableFlow request failed: \${response.status}\`,
    );
  }

  return payload.data;
}`;

export const STRING_AMOUNT_CODE = `{ "amount": "10.50" }`;
export const FLOAT_AMOUNT_CODE = `{ "amount": 10.50 }`;
export const REDIRECT_CODE = `window.location.assign(checkoutUrl);`;
export const SESSION_VALUES_CODE = `export SESSION_ID="<data.session_id>"
export SESSION_URL="<data.session_url>"`;
export const SESSION_STATUS_CODE = `curl -sS "\${BASE_URL}/v1/pay/checkout/sessions/\${SESSION_ID}"`;
export const SESSION_STATUS_RESPONSE_CODE = `{
  "code": 200,
  "data": {
    "session_id": "cs_rOGsr6knI-CEb6vy9UA87",
    "status": "created"
  }
}`;

export const WEBHOOK_EVENT_CODE = `{
  "id": "evt_2Krf7BpZ2YmyqMrP1F0w",
  "type": "payment.success",
  "created_at": "2026-08-30T12:00:00Z",
  "data": {
    "payments_id": "pay_2Krf7BpZ2YmyqMrP1F0wr8",
    "status": "completed",
    "session_id": "cs_rOGsr6knI-CEb6vy9UA87",
    "out_order_no": "order-10001"
  }
}`;

export const WEBHOOK_HEADERS_CODE = `x-stableflowpay-timestamp: 1788080400
x-stableflowpay-signature: 7d78f1d7f5fdbcc6...`;

export const VERIFY_WEBHOOK_CODE = `import crypto from "node:crypto";

export function verifyStableFlowWebhook(
  rawBody,
  timestamp,
  signature,
  secret
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp)
    .update(".")
    .update(rawBody)
    .digest("hex");

  const expectedBytes = Buffer.from(expected, "hex");
  const signatureBytes = Buffer.from(signature, "hex");

  return (
    expectedBytes.length === signatureBytes.length &&
    crypto.timingSafeEqual(expectedBytes, signatureBytes)
  );
}`;

export const WEBHOOK_HANDLER_CODE = `app.post(
  "/webhooks/stableflow",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const rawBody = request.body;
    const timestamp = request.get("x-stableflowpay-timestamp") || "";
    const signature = request.get("x-stableflowpay-signature") || "";

    if (!verifyStableFlowWebhook(
      rawBody,
      timestamp,
      signature,
      process.env.STABLEFLOW_WEBHOOK_SECRET,
    )) {
      return response.sendStatus(401);
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    await processStableFlowEventOnce(event); // Enforce a unique event.id.
    return response.sendStatus(204);
  },
);`;

export const TOKENS_ENDPOINT_CODE = `GET /v1/pay/tokens`;
export const TOKENS_CURL_CODE = `curl "\${BASE_URL}/v1/pay/tokens"`;
export const TOKENS_RESPONSE_CODE = `{
  "code": 200,
  "data": [
    {
      "symbol": "USDC",
      "network": "base",
      "decimals": 6,
      "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      "support_payment": true,
      "support_receive": true
    }
  ]
}`;
export const API_BASE_PATH_CODE = `{BASE_URL}/v1/pay`;

export const SUCCESS_RESPONSE_CODE = `{
  "code": 200,
  "data": {}
}`;

export const API_KEY_HEADER_CODE = `x-api-key: your-api-key`;

export const RESPONSE_PARSER_CODE = `const response = await fetch(url, options);
const payload = await response.json().catch(() => null);

if (!response.ok || payload?.code !== 200) {
  throw new Error(
    payload?.message || \`StableFlow request failed: \${response.status}\`,
  );
}

return payload.data;`;
