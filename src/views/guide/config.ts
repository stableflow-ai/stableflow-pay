export const GUIDE_PATH = "/guide";

export const GUIDE_STEP = {
  PaymentLink: "payment-link",
  ApiKey: "api-key",
  Webhook: "webhook",
  Test: "test",
} as const;

export type GuideStepId = (typeof GUIDE_STEP)[keyof typeof GUIDE_STEP];

export const GUIDE_STEP_PATH = {
  paymentLink: `${GUIDE_PATH}/payment-link`,
  paymentLinkPreview: `${GUIDE_PATH}/payment-link/preview`,
  apiKey: `${GUIDE_PATH}/api-key`,
  apiKeyPreview: `${GUIDE_PATH}/api-key/preview`,
  webhook: `${GUIDE_PATH}/webhook`,
  webhookPreview: `${GUIDE_PATH}/webhook/preview`,
  test: `${GUIDE_PATH}/test`,
} as const;

export type GuideStepDef = {
  id: GuideStepId;
  number: number;
  title: string;
  description: string;
  actionLabel: string;
  formPath: string;
  previewPath: string;
  drawerTitle: string;
};

export const GUIDE_STEPS: readonly GuideStepDef[] = [
  {
    id: GUIDE_STEP.PaymentLink,
    number: 1,
    title: "Create Payment Link",
    description: "Set the amount, token, and recipient address to generate payment link.",
    actionLabel: "Create",
    formPath: GUIDE_STEP_PATH.paymentLink,
    previewPath: GUIDE_STEP_PATH.paymentLinkPreview,
    drawerTitle: "Step 1. Create Payment Link",
  },
  {
    id: GUIDE_STEP.ApiKey,
    number: 2,
    title: "Create API Key",
    description: "Generate a test key for server-side requests",
    actionLabel: "Create",
    formPath: GUIDE_STEP_PATH.apiKey,
    previewPath: GUIDE_STEP_PATH.apiKeyPreview,
    drawerTitle: "Step 2. Create API Key",
  },
  {
    id: GUIDE_STEP.Webhook,
    number: 3,
    title: "Set Up Webhook",
    description: "Configure an endpoint to receive payment notifications",
    actionLabel: "Create",
    formPath: GUIDE_STEP_PATH.webhook,
    previewPath: GUIDE_STEP_PATH.webhookPreview,
    drawerTitle: "Step 3. Set Up Webhook",
  },
  {
    id: GUIDE_STEP.Test,
    number: 4,
    title: "Test",
    description: "Run prefilled code with your link ID and API key.",
    actionLabel: "Test",
    formPath: GUIDE_STEP_PATH.test,
    previewPath: GUIDE_STEP_PATH.test,
    drawerTitle: "Step 4. Test your integration",
  },
];

export const GUIDE_TEST_SAMPLE = {
  amount: "1",
  network: "near",
  recipient: "stableflow.near",
  successUrl: "https://app.stableflow.ai",
  symbol: "USDC",
  outOrderNo: "your_order_no",
} as const;

export const GUIDE_TEST_LANG = {
  Node: "node",
  Curl: "curl",
  Python: "python",
} as const;

export type GuideTestLang = (typeof GUIDE_TEST_LANG)[keyof typeof GUIDE_TEST_LANG];

export const GUIDE_TEST_LANG_OPTIONS: { value: GuideTestLang; label: string; fileName: string }[] = [
  { value: GUIDE_TEST_LANG.Node, label: "Node.js", fileName: "server.js" },
  { value: GUIDE_TEST_LANG.Curl, label: "cURL", fileName: "request.sh" },
  { value: GUIDE_TEST_LANG.Python, label: "Python", fileName: "main.py" },
];

export const GUIDE_URL_PREVIEW_MAX = 28;

export function activeWebhookEndpointsCopy(count: number): string {
  return `${count} Active webhook endpoints`;
}
