import { useState } from "react";
import { PaymentsAreaChart } from "@/components/payments-chart/PaymentsAreaChart";
import { CHART_METRIC, type ChartMetric } from "@/components/payments-chart/config";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useOverviewPaymentsAnalyticsQuery } from "@/hooks/use-overview-api";
import type { OverviewAnalyticsPeriod } from "@/types/overview";
import { OVERVIEW_RANGE, OVERVIEW_RANGE_OPTIONS } from "../config";
import { formatOverviewChartLabel, overviewChartValue } from "../utils";

export function PaymentsChart() {
  const [metric, setMetric] = useState<ChartMetric>(CHART_METRIC.Volume);
  const [period, setPeriod] = useState<OverviewAnalyticsPeriod>(OVERVIEW_RANGE.Daily);
  const analyticsQuery = useOverviewPaymentsAnalyticsQuery(period);
  const points = (analyticsQuery.data?.list ?? []).map((point) => ({
    label: formatOverviewChartLabel(point.startAt, period),
    value: overviewChartValue(point.volume, point.transactions, metric),
  }));

  return (
    <PaymentsAreaChart
      title="Payments"
      points={points}
      metric={metric}
      onMetricChange={setMetric}
      loading={analyticsQuery.isPending}
      headerExtra={
        <Dropdown
          value={period}
          onChange={(value) => setPeriod(value as OverviewAnalyticsPeriod)}
          options={OVERVIEW_RANGE_OPTIONS}
          triggerClassName="h-[30px] w-[94px] rounded-[18px] border-black/10 bg-transparent px-2.5 text-xs shadow-none"
        />
      }
    />
  );
}
