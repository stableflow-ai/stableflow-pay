import { CHART_METRIC, type ChartMetric } from "@/components/payments-chart/config";
import type { OverviewAnalyticsPeriod } from "@/types/overview";
import { formatAmount } from "@/utils";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function splitUsdAmount(value: string | number): { whole: string; fraction: string } {
  const formatted = formatAmount(value, { maxDecimals: 2, padDecimals: true });
  const dot = formatted.lastIndexOf(".");
  if (dot < 0) return { whole: formatted, fraction: "" };
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot) };
}

export function formatOverviewChartLabel(iso: string, period: OverviewAnalyticsPeriod): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = MONTH_SHORT[date.getMonth()];
  if (period === "month") return `${month} ${date.getFullYear()}`;
  return `${month} ${date.getDate()}`;
}

export function overviewChartValue(volume: string, transactions: number, metric: ChartMetric): number {
  if (metric === CHART_METRIC.Transaction) return transactions;
  const parsed = Number(volume);
  return Number.isFinite(parsed) ? parsed : 0;
}
