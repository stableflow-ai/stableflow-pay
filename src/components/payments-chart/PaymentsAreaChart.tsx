import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import { cn } from "@/lib/utils";
import {
  CHART_LINE_COLOR,
  CHART_METRIC,
  CHART_METRIC_OPTIONS,
  CHART_PLOT_RIGHT_MARGIN,
  CHART_Y_AXIS_WIDTH,
  type ChartMetric,
} from "./config";
import { chartXTickMinPx, chartYTicks, evenCategoryTicks, formatChartAxis, maxCategoryTicks } from "./utils";

function ChartXTick(props: {
  x?: number;
  y?: number;
  index?: number;
  visibleTicksCount?: number;
  payload?: { value?: string };
}) {
  const { x = 0, y = 0, index = 0, visibleTicksCount = 0, payload } = props;
  const isFirst = index === 0;
  const isLast = visibleTicksCount > 0 && index === visibleTicksCount - 1;
  const anchor =
    visibleTicksCount <= 1 ? "middle" : isFirst ? "start" : isLast ? "end" : "middle";
  return (
    <text x={x} y={y} dy={12} textAnchor={anchor} fill="#aaa" fontSize={12} fontFamily="Montserrat">
      {payload?.value}
    </text>
  );
}

export function PaymentsAreaChart(props: {
  title: string;
  points: Array<{ label: string; value: number }>;
  metric: ChartMetric;
  onMetricChange: (metric: ChartMetric) => void;
  loading?: boolean;
  headerExtra?: ReactNode;
  className?: string;
}) {
  const { title, points, metric, onMetricChange, loading, headerExtra, className } = props;
  const gradientId = useId().replaceAll(":", "");
  const fillId = `paymentsAreaFill-${gradientId}`;
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const isEmpty = points.length === 0;
  const chartData = isEmpty ? [{ label: "", value: 0 }] : points;
  const maxValue = isEmpty ? 0 : chartData.reduce((max, point) => Math.max(max, point.value), 0);
  const integerTicks = metric === CHART_METRIC.Transaction;
  const yTicks = isEmpty && !integerTicks ? [0] : chartYTicks(maxValue, { integer: integerTicks });
  const domain: [number, number] = [0, isEmpty && !integerTicks ? 1 : (yTicks[yTicks.length - 1] ?? 0)];
  const lastPoint = points[points.length - 1];
  const xTicks = useMemo(() => {
    const labels = points.map((point) => point.label);
    return evenCategoryTicks(labels, maxCategoryTicks(hostWidth, chartXTickMinPx(labels)));
  }, [hostWidth, points]);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const update = () => {
      const next = el.clientWidth;
      setHostWidth((prev) => (prev === next ? prev : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <Card className={cn("flex min-h-[404px] flex-col p-4 md:p-6", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto font-montserrat text-base font-medium text-black">{title}</p>
        <div className="flex h-[30px] items-center rounded-[18px] bg-[#f2f2f2] p-0.5">
          {CHART_METRIC_OPTIONS.map((option) => {
            const selected = option.value === metric;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onMetricChange(option.value)}
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
        {headerExtra}
      </div>
      <div ref={hostRef} className="mt-6 min-h-0 min-w-0 flex-1">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="font-montserrat text-sm font-medium text-[#aaa]">Loading…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 8, right: CHART_PLOT_RIGHT_MARGIN, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_LINE_COLOR} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={CHART_LINE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eee" />
              <XAxis
                dataKey="label"
                ticks={xTicks}
                interval={0}
                minTickGap={0}
                tickLine={false}
                axisLine={false}
                tick={<ChartXTick />}
              />
              <YAxis
                ticks={yTicks}
                domain={domain}
                allowDecimals={!integerTicks}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatChartAxis(value, metric)}
                tick={{ fill: "#aaa", fontSize: 12, fontFamily: "Montserrat" }}
                width={CHART_Y_AXIS_WIDTH}
              />
              <Tooltip
                formatter={(value) => [
                  formatChartAxis(Number(value), metric),
                  metric === CHART_METRIC.Volume ? "Volume" : "Transaction",
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
                stroke={CHART_LINE_COLOR}
                strokeWidth={2}
                fill={`url(#${fillId})`}
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 5, stroke: CHART_LINE_COLOR, fill: "#fff" }}
              />
              {lastPoint ? (
                <ReferenceDot
                  x={lastPoint.label}
                  y={lastPoint.value}
                  r={5}
                  fill="#fff"
                  stroke={CHART_LINE_COLOR}
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
