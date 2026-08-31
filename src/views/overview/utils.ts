import { formatAmount } from "@/utils";
import type { OverviewAnalyticsPeriod } from "@/types/overview";
import { OVERVIEW_METRIC, type OverviewMetric } from "./config";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function splitUsdAmount(value: string | number): { whole: string; fraction: string } {
  const formatted = formatAmount(value, { maxDecimals: 2, padDecimals: true });
  const dot = formatted.lastIndexOf(".");
  if (dot < 0) return { whole: formatted, fraction: "" };
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot) };
}

export function chartYTicks(maxValue: number): number[] {
  const niceMax = niceCeil(maxValue);
  const step = niceMax / 5;
  return [0, step, 2 * step, 3 * step, 4 * step, niceMax];
}

export function formatChartAxis(value: number, metric: OverviewMetric): string {
  if (metric === OVERVIEW_METRIC.Transaction) return String(value);
  if (value === 0) return "$0";
  if (value >= 1000) return `$${value / 1000}K`;
  if (value < 1) return formatAmount(value, { maxDecimals: 2, showDust: true });
  return formatAmount(value, { maxDecimals: 2, showDust: true });
}

export function formatOverviewChartLabel(iso: string, period: OverviewAnalyticsPeriod): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const month = MONTH_SHORT[date.getUTCMonth()];
  if (period === "month") return `${month} ${date.getUTCFullYear()}`;
  return `${month} ${date.getUTCDate()}`;
}

export function overviewChartValue(volume: string, transactions: number, metric: OverviewMetric): number {
  if (metric === OVERVIEW_METRIC.Transaction) return transactions;
  const parsed = Number(volume);
  return Number.isFinite(parsed) ? parsed : 0;
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}
