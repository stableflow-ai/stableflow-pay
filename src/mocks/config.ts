export const MOCK_ENABLED = {
  overview: true,
  paymentLinks: true,
  webhooks: true,
} as const;

export type MockDomain = keyof typeof MOCK_ENABLED;
