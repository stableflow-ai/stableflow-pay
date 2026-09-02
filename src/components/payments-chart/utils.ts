import { formatAmount } from "@/utils";
import {
  CHART_METRIC,
  CHART_PLOT_RIGHT_MARGIN,
  CHART_X_TICK_CHAR_PX,
  CHART_X_TICK_GAP_PX,
  CHART_Y_AXIS_WIDTH,
  type ChartMetric,
} from "./config";

export function chartYTicks(maxValue: number, options?: { integer?: boolean }): number[] {
  const niceMax = niceCeil(maxValue);
  if (options?.integer) {
    const step = Math.max(1, Math.ceil(niceMax / 5));
    const top = step * 5;
    return [0, step, 2 * step, 3 * step, 4 * step, top];
  }
  const step = niceMax / 5;
  return [0, step, 2 * step, 3 * step, 4 * step, niceMax];
}

export function formatChartAxis(value: number, metric: ChartMetric): string {
  if (metric === CHART_METRIC.Transaction) return formatAmount(value, { prefix: "", maxDecimals: 0 });
  if (value === 0) return "$0";
  if (value >= 1000) return `$${value / 1000}K`;
  return formatAmount(value, { maxDecimals: 6 });
}

export function chartXTickMinPx(labels: string[]): number {
  const longest = labels.reduce((max, label) => Math.max(max, label.length), 0);
  return longest * CHART_X_TICK_CHAR_PX + CHART_X_TICK_GAP_PX;
}

export function maxCategoryTicks(hostWidth: number, minTickPx: number): number {
  const plotWidth = hostWidth - CHART_Y_AXIS_WIDTH - CHART_PLOT_RIGHT_MARGIN;
  if (plotWidth <= 0 || minTickPx <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(2, Math.floor(plotWidth / minTickPx) + 1);
}

/**
 * Pick evenly spaced category labels, walking back from the newest point so
 * the latest date is always labelled and every gap has the same width.
 */
export function evenCategoryTicks(labels: string[], maxTicks: number): string[] {
  if (maxTicks < 2 || labels.length <= maxTicks) return labels;
  const step = Math.ceil((labels.length - 1) / (maxTicks - 1));
  const ticks: string[] = [];
  for (let i = labels.length - 1; i >= 0; i -= step) ticks.unshift(labels[i]);
  return ticks;
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}
