import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card/Card";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useOverviewPaymentsAnalyticsQuery } from "@/hooks/use-overview-api";
import { cn } from "@/lib/utils";
import type { OverviewAnalyticsPeriod } from "@/types/overview";
import {
  OVERVIEW_CHART_COLOR,
  OVERVIEW_METRIC,
  OVERVIEW_METRIC_OPTIONS,
  OVERVIEW_RANGE,
  OVERVIEW_RANGE_OPTIONS,
  type OverviewMetric,
} from "../config";
import { chartYTicks, formatChartAxis, formatOverviewChartLabel, overviewChartValue } from "../utils";

export function PaymentsChart() {
  const [metric, setMetric] = useState<OverviewMetric>(OVERVIEW_METRIC.Volume);
  const [period, setPeriod] = useState<OverviewAnalyticsPeriod>(OVERVIEW_RANGE.Daily);
  const analyticsQuery = useOverviewPaymentsAnalyticsQuery(period);
  const data = (analyticsQuery.data?.list ?? []).map((point) => ({
    label: formatOverviewChartLabel(point.startAt, period),
    value: overviewChartValue(point.volume, point.transactions, metric),
  }));
  // Render an empty zero-valued chart instead of a placeholder when there is
  // no data yet, so the card keeps its chart frame (axes + grid) at all times.
  const isEmpty = data.length === 0;
  const chartData = isEmpty ? [{ label: "", value: 0 }] : data;
  const maxValue = isEmpty
    ? 0
    : chartData.reduce((max, point) => Math.max(max, point.value), 0);
  const integerTicks = metric === OVERVIEW_METRIC.Transaction;
  const ticks = isEmpty && !integerTicks ? [0] : chartYTicks(maxValue, { integer: integerTicks });
  const domain: [number, number] = [0, isEmpty && !integerTicks ? 1 : (ticks[ticks.length - 1] ?? 0)];
  const lastPoint = data[data.length - 1];

  return (
    <Card className="flex min-h-[404px] flex-col p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto font-montserrat text-base font-medium capitalize text-black">
          Payments
        </p>
        <div className="flex h-[30px] items-center rounded-[18px] bg-[#f2f2f2] p-0.5">
          {OVERVIEW_METRIC_OPTIONS.map((option) => {
            const selected = option.value === metric;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMetric(option.value)}
                className={cn(
                  "h-[26px] rounded-[18px] px-3 font-montserrat text-xs font-medium text-black",
                  selected && "border border-[#e3e3e3] bg-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <Dropdown
          value={period}
          onChange={(value) => setPeriod(value as OverviewAnalyticsPeriod)}
          options={OVERVIEW_RANGE_OPTIONS}
          triggerClassName="h-[30px] w-[94px] rounded-[18px] border-black/10 bg-transparent px-2.5 text-xs shadow-none"
        />
      </div>
      <div className="mt-6 min-h-0 min-w-0 flex-1">
        {analyticsQuery.isPending ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="font-montserrat text-sm font-medium text-[#aaa]">Loading…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="overviewPaymentsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={OVERVIEW_CHART_COLOR} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={OVERVIEW_CHART_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eee" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#aaa", fontSize: 12, fontFamily: "Montserrat" }}
              />
              <YAxis
                ticks={ticks}
                domain={domain}
                allowDecimals={!integerTicks}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatChartAxis(value, metric)}
                tick={{ fill: "#aaa", fontSize: 12, fontFamily: "Montserrat" }}
                width={48}
              />
              <Tooltip
                formatter={(value) => [
                  formatChartAxis(Number(value), metric),
                  metric === OVERVIEW_METRIC.Volume ? "Volume" : "Transaction",
                ]}
                labelStyle={{ fontFamily: "Montserrat", fontSize: 12 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E0E0E0",
                  fontFamily: "Montserrat",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={OVERVIEW_CHART_COLOR}
                strokeWidth={2}
                fill="url(#overviewPaymentsFill)"
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 5, stroke: OVERVIEW_CHART_COLOR, fill: "#fff" }}
              />
              {lastPoint ? (
                <ReferenceDot
                  x={lastPoint.label}
                  y={lastPoint.value}
                  r={5}
                  fill="#fff"
                  stroke={OVERVIEW_CHART_COLOR}
                  strokeWidth={2}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
