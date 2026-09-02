import type { OverviewAnalyticsPeriod, OverviewStats } from "@/types/overview";

export const OVERVIEW_RANGE = {
  Daily: "day",
  Weekly: "week",
  Monthly: "month",
} as const;

export type OverviewRange = (typeof OVERVIEW_RANGE)[keyof typeof OVERVIEW_RANGE];

export const EMPTY_OVERVIEW_STATS: OverviewStats = {
  totalRevenue: "0",
  totalTransactions: 0,
  activeLinks: 0,
  apiKeys: 0,
};

export const OVERVIEW_LINK_CLASS =
  "font-montserrat text-base font-medium capitalize text-[#3f8afb] hover:text-[#3f8afb]/80";
export const OVERVIEW_MUTED_LABEL_CLASS =
  "font-montserrat text-base font-medium capitalize text-[#aaa]";
export const OVERVIEW_VALUE_CLASS = "font-montserrat text-[26px] font-medium capitalize text-black";

export const OVERVIEW_RANGE_OPTIONS: { value: OverviewAnalyticsPeriod; label: string }[] = [
  { value: OVERVIEW_RANGE.Daily, label: "Daily" },
  { value: OVERVIEW_RANGE.Weekly, label: "Weekly" },
  { value: OVERVIEW_RANGE.Monthly, label: "Monthly" },
];
