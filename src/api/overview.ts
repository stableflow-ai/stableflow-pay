import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import { http } from "@/lib/http";
import type {
  OverviewAnalyticsPeriod,
  OverviewAnalyticsPoint,
  OverviewPaymentsAnalytics,
  OverviewStats,
} from "@/types/overview";

export function mapOverviewStats(raw: unknown): OverviewStats {
  const row = asRecord(raw) ?? {};
  return {
    totalRevenue: apiText(row.total_revenue ?? row.totalRevenue) || "0",
    totalTransactions: apiNumber(row.total_transactions ?? row.totalTransactions) ?? 0,
    activeLinks: apiNumber(row.active_links ?? row.activeLinks) ?? 0,
    apiKeys: apiNumber(row.api_keys ?? row.apiKeys) ?? 0,
  };
}

export function mapOverviewAnalyticsPoint(raw: unknown): OverviewAnalyticsPoint {
  const row = asRecord(raw) ?? {};
  return {
    startAt: apiText(row.start_at ?? row.startAt),
    endAt: apiText(row.end_at ?? row.endAt),
    volume: apiText(row.volume) || "0",
    transactions: apiNumber(row.transactions) ?? 0,
  };
}

export function mapOverviewPaymentsAnalytics(
  raw: unknown,
  fallbackPeriod: OverviewAnalyticsPeriod,
): OverviewPaymentsAnalytics {
  const row = asRecord(raw) ?? {};
  const periodRaw = apiText(row.period);
  const period: OverviewAnalyticsPeriod =
    periodRaw === "week" || periodRaw === "month" || periodRaw === "day" ? periodRaw : fallbackPeriod;
  const list = Array.isArray(row.list) ? row.list.map(mapOverviewAnalyticsPoint) : [];
  return { period, list };
}

export async function getOverview(): Promise<OverviewStats> {
  return mapOverviewStats(await http<unknown>(`${PAY_API_PREFIX}/overview`));
}

export async function getOverviewPaymentsAnalytics(
  period: OverviewAnalyticsPeriod,
  type?: string,
): Promise<OverviewPaymentsAnalytics> {
  return mapOverviewPaymentsAnalytics(
    await http<unknown>(`${PAY_API_PREFIX}/payments/analytics`, {
      query: { period, type, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    }),
    period,
  );
}
