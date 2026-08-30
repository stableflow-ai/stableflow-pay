import { differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";
import type { DateRangeValue } from "@/components/date-range-picker/utils";
import { ApiError } from "@/lib/api-error";
import type { ReportPaymentsExportQuery } from "@/types/report";
import { REPORT_AMOUNT_FILTER, REPORT_FILTER_ALL, REPORT_PAGE_SIZE } from "./config";

export function reportsError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function reportOptionalFilter(value: string): string | undefined {
  return value === REPORT_FILTER_ALL ? undefined : value;
}

export function reportOptionalApiKeyId(value: string): number | undefined {
  if (value === REPORT_FILTER_ALL) return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export function reportAmountQuery(filter: string): { min_amount?: number; max_amount?: number } {
  if (filter === REPORT_AMOUNT_FILTER.Under1k) return { min_amount: 0, max_amount: 1000 };
  if (filter === REPORT_AMOUNT_FILTER.From1kTo10k) return { min_amount: 1000, max_amount: 10000 };
  if (filter === REPORT_AMOUNT_FILTER.Over10k) return { min_amount: 10000 };
  return {};
}

export function reportPaymentsFilters(input: {
  sourceNetwork: string;
  sourceToken: string;
  destNetwork: string;
  destToken: string;
  amountFilter: string;
}): ReportPaymentsExportQuery {
  return {
    network: reportOptionalFilter(input.sourceNetwork),
    symbol: reportOptionalFilter(input.sourceToken),
    destination_network: reportOptionalFilter(input.destNetwork),
    destination_symbol: reportOptionalFilter(input.destToken),
    ...reportAmountQuery(input.amountFilter),
  };
}

export function reportPaymentsListQuery(
  page: number,
  filters: ReportPaymentsExportQuery,
): ReportPaymentsExportQuery & { page: number; pageSize: number } {
  return {
    page,
    pageSize: REPORT_PAGE_SIZE,
    ...filters,
  };
}

export function reportDailyDateKey(date: string): string {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return format(parsed, "yyyy-MM-dd");
}

export function eachDateKey(range: DateRangeValue) {
  const keys: string[] = [];
  const days = Math.max(0, differenceInCalendarDays(range.to, range.from));
  for (let i = 0; i <= days; i++) {
    keys.push(format(subDays(startOfDay(range.to), days - i), "yyyy-MM-dd"));
  }
  return keys;
}
