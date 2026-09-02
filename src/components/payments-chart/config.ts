export const CHART_METRIC = {
  Volume: "volume",
  Transaction: "transaction",
} as const;

export type ChartMetric = (typeof CHART_METRIC)[keyof typeof CHART_METRIC];

export const CHART_METRIC_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: CHART_METRIC.Volume, label: "Volume" },
  { value: CHART_METRIC.Transaction, label: "Transaction" },
];

export const CHART_METRIC_COLOR: Record<ChartMetric, string> = {
  [CHART_METRIC.Volume]: "#6284F5",
  [CHART_METRIC.Transaction]: "#84A20F",
};
export const CHART_Y_AXIS_WIDTH = 48;
export const CHART_PLOT_RIGHT_MARGIN = 12;
export const CHART_X_TICK_CHAR_PX = 7;
export const CHART_X_TICK_GAP_PX = 16;
