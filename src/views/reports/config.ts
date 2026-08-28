import { PAYOUT_SYMBOLS } from "@/stores/intents-tokens";

export const REPORT_FILTER_ALL = "all";

export const REPORT_TIME_PRESET = {
  Days30: 30,
  Days7: 7,
  Days1: 1,
} as const;

export const REPORT_AMOUNT_FILTER = {
  All: "all",
  Under1k: "0-1000",
  From1kTo10k: "1000-10000",
  Over10k: "over-10000",
} as const;

export const REPORT_AMOUNT_OPTIONS = [
  { value: REPORT_AMOUNT_FILTER.All, label: "All" },
  { value: REPORT_AMOUNT_FILTER.Under1k, label: "0-1,000" },
  { value: REPORT_AMOUNT_FILTER.From1kTo10k, label: "1,000-10,000" },
  { value: REPORT_AMOUNT_FILTER.Over10k, label: ">10,000" },
] as const;

export const REPORT_TOKENS = PAYOUT_SYMBOLS;

export const REPORT_PAGE_SIZE = 12;

export const REPORT_VOLUME_CHART_COLOR = "#4DA0FF";
export const REPORT_TX_CHART_COLOR = "#9BA84A";

export const REPORT_TABLE_COLUMNS =
  "minmax(72px,0.6fr) minmax(140px,1.1fr) 28px minmax(88px,0.7fr) minmax(150px,1.2fr) minmax(130px,1fr) minmax(130px,1fr) minmax(140px,1fr)";
