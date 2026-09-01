/**
 * Central query-key factory. Mutations (login, register, quotes, submits) do
 * not need keys. Add a namespace here when you introduce a `useQuery`.
 *
 *   order: {
 *     all: ["order"] as const,
 *     detail: (id: string | number) => [...queryKeys.order.all, "detail", id] as const,
 *   },
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: ["auth", "profile"] as const,
  },
  payout: {
    all: ["payout"] as const,
    pending: ["payout", "pending"] as const,
    overview: ["payout", "overview"] as const,
    volume: (period: string) => [...queryKeys.payout.all, "volume", period] as const,
    recent: ["payout", "recent"] as const,
    payments: (params: unknown) => [...queryKeys.payout.all, "payments", params] as const,
    payment: (id: string) => [...queryKeys.payout.all, "payment", id] as const,
    singleQuote: (body: unknown) => [...queryKeys.payout.all, "single-quote", body] as const,
    batchQuote: (body: unknown) => [...queryKeys.payout.all, "batch-quote", body] as const,
  },
  recipient: {
    all: ["recipient"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    month: (month: string) => [...queryKeys.analytics.all, "month", month] as const,
  },
  request: {
    all: ["request"] as const,
    payments: ["request", "payments"] as const,
    withdrawCount: ["request", "withdraw-count"] as const,
    detail: (id: number) => [...queryKeys.request.all, "detail", id] as const,
  },
  paymentLinks: {
    all: ["payment-links"] as const,
    list: (params: unknown) => [...queryKeys.paymentLinks.all, "list", params] as const,
    infinite: (params: unknown) => [...queryKeys.paymentLinks.all, "infinite", params] as const,
    overview: ["payment-links", "overview"] as const,
    detail: (id: string) => [...queryKeys.paymentLinks.all, "detail", id] as const,
    stats: (id: string) => [...queryKeys.paymentLinks.all, "stats", id] as const,
    payments: (id: string, params: unknown) => [...queryKeys.paymentLinks.all, "payments", id, params] as const,
    defaultAddresses: ["payment-links", "default-addresses"] as const,
  },
  organization: {
    all: ["organization"] as const,
    current: ["organization", "current"] as const,
  },
  webhooks: {
    all: ["webhooks"] as const,
    list: ["webhooks", "list"] as const,
  },
  apiKeys: {
    all: ["api-keys"] as const,
    list: ["api-keys", "list"] as const,
  },
  report: {
    all: ["report"] as const,
    analytics: (params: unknown) => [...queryKeys.report.all, "analytics", params] as const,
    payments: (params: unknown) => [...queryKeys.report.all, "payments", params] as const,
  },
  nearintents: {
    all: ["nearintents"] as const,
    status: (depositAddress: string) => [...queryKeys.nearintents.all, "status", depositAddress] as const,
  },
  pay: {
    all: ["pay"] as const,
    swap: (body: unknown) => [...queryKeys.pay.all, "swap", body] as const,
  },
  checkout: {
    all: ["checkout"] as const,
    session: (id: string) => [...queryKeys.checkout.all, "session", id] as const,
  },
  overview: {
    all: ["overview"] as const,
    stats: ["overview", "stats"] as const,
    analytics: (period: string) => [...queryKeys.overview.all, "analytics", period] as const,
  },
} as const;
