export interface OverviewStats {
  totalRevenue: string;
  totalTransactions: number;
  activeLinks: number;
  apiKeys: number;
}

export type OverviewAnalyticsPeriod = "day" | "week" | "month";

export interface OverviewAnalyticsPoint {
  startAt: string;
  endAt: string;
  volume: string;
  transactions: number;
}

export interface OverviewPaymentsAnalytics {
  period: OverviewAnalyticsPeriod;
  list: OverviewAnalyticsPoint[];
}
