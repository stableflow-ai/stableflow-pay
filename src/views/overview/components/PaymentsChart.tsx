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
import { cn } from "@/lib/utils";
import {
  OVERVIEW_METRIC,
  OVERVIEW_RANGE,
  type OverviewChartPoint,
  type OverviewMetric,
  type OverviewRange,
} from "@/mocks/overview";
import {
  OVERVIEW_CHART_COLOR,
  OVERVIEW_METRIC_OPTIONS,
  OVERVIEW_RANGE_OPTIONS,
} from "../config";
import { chartYTicks, formatChartAxis } from "../utils";

export function PaymentsChart({ chart }: { chart: OverviewChartPoint[] }) {
  const [metric, setMetric] = useState<OverviewMetric>(OVERVIEW_METRIC.Volume);
  const [range, setRange] = useState<OverviewRange>(OVERVIEW_RANGE.Daily);
  const data = chart.map((point) => ({
    label: point.label,
    value: metric === OVERVIEW_METRIC.Volume ? point.volume : point.transactions,
  }));
  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0);
  const ticks = chartYTicks(maxValue);
  const lastPoint = data[data.length - 1];

  return (
    <Card className="flex min-h-[404px] flex-col p-5 md:p-6">
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
          value={range}
          onChange={(value) => setRange(value as OverviewRange)}
          options={OVERVIEW_RANGE_OPTIONS}
          triggerClassName="h-[30px] w-[81px] rounded-[18px] border-black/10 bg-transparent px-2.5 text-xs shadow-none"
        />
      </div>
      <div className="mt-6 min-h-0 min-w-0 flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              domain={[0, ticks[ticks.length - 1] ?? 0]}
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
      </div>
    </Card>
  );
}
