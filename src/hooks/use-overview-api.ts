/**
 * Overview dashboard queries.
 *   GET /v1/pay/overview
 *   GET /v1/pay/payments/analytics
 */
import { useQuery } from "@tanstack/react-query";
import { getOverview, getOverviewPaymentsAnalytics } from "@/api/overview";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type { OverviewAnalyticsPeriod } from "@/types/overview";
import { OVERVIEW_ANALYTICS_TYPE } from "@/views/overview/config";

export function useOverviewQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.overview.stats,
    queryFn: getOverview,
    enabled: Boolean(token),
  });
}

export function useOverviewPaymentsAnalyticsQuery(period: OverviewAnalyticsPeriod) {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.overview.analytics(period),
    queryFn: () => getOverviewPaymentsAnalytics(period, OVERVIEW_ANALYTICS_TYPE),
    enabled: Boolean(token),
  });
}
