import { getOverviewDashboard } from "@/mocks/overview";

// TODO(api): replace mock read with TanStack Query when the backend contract is ready.
// 1. Add types in src/types/overview.ts from the real API (do not reuse mock-local types blindly).
// 2. Add src/api/overview.ts using http() and append the endpoint table in doc/api.md.
// 3. Add queryKeys.overview in src/api/query-keys.ts.
// 4. Switch this hook to useQuery ({ enabled: Boolean(token), queryFn: real api }).
// 5. Set MOCK_ENABLED.overview = false and delete src/mocks/overview.ts.

export function useOverviewDashboard() {
  return getOverviewDashboard();
}
