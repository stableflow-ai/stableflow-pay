import { createPaymentLink, getPaymentLinks } from "@/mocks/payment-links";

// TODO(api): replace mock read with TanStack Query when the backend contract is ready.
// 1. Add types in src/types/payment-links.ts from the real API (do not reuse mock-local types blindly).
// 2. Add src/api/payment-links.ts using http() and append the endpoint table in doc/api.md.
// 3. Add queryKeys.paymentLinks in src/api/query-keys.ts.
// 4. Switch this hook to useQuery ({ enabled: Boolean(token), queryFn: real api }).
// 5. Set MOCK_ENABLED.paymentLinks = false and delete src/mocks/payment-links.ts.

export function usePaymentLinks() {
  return getPaymentLinks();
}

export function useCreatePaymentLink() {
  return { create: createPaymentLink };
}
