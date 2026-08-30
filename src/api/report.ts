import { http, httpBlob } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import type {
  ReportAnalyticsQuery,
  ReportAnalyticsResp,
  ReportPaymentItem,
  ReportPaymentsExportQuery,
  ReportPaymentsQuery,
  ReportPaymentsResp,
} from "@/types/report";

function mapAnalyticsDailyItem(raw: unknown): ReportAnalyticsResp["dailyStats"][number] {
  const row = asRecord(raw) ?? {};
  return {
    date: apiText(row.date),
    volume: apiText(row.volume),
    transactions: apiNumber(row.transactions) ?? 0,
  };
}

export async function getReportAnalytics(params: ReportAnalyticsQuery): Promise<ReportAnalyticsResp> {
  const data =
    asRecord(
      await http<unknown>(`${PAY_API_PREFIX}/report/analytics`, {
        query: {
          api_key_id: params.api_key_id,
          network: params.network,
          start_time: params.start_time,
          end_time: params.end_time,
        },
      }),
    ) ?? {};
  const daily = Array.isArray(data.daily_stats ?? data.dailyStats)
    ? ((data.daily_stats ?? data.dailyStats) as unknown[])
    : [];
  return {
    totalVolume: apiText(data.total_volume ?? data.totalVolume),
    transactions: apiNumber(data.transactions) ?? 0,
    dailyStats: daily.map(mapAnalyticsDailyItem),
  };
}

function mapReportPaymentItem(raw: unknown): ReportPaymentItem {
  const row = asRecord(raw) ?? {};
  return {
    id: apiNumber(row.id) ?? 0,
    paymentsId: apiText(row.payments_id ?? row.paymentsId),
    userId: apiNumber(row.user_id ?? row.userId) ?? 0,
    payer: apiText(row.payer),
    recipient: apiText(row.recipient),
    amount: apiText(row.amount),
    token: apiText(row.symbol ?? row.token),
    network: apiText(row.network),
    destinationAmount: apiText(row.destination_amount ?? row.destinationAmount),
    destinationToken: apiText(row.destination_symbol ?? row.destinationSymbol ?? row.destinationToken),
    destinationNetwork: apiText(row.destination_network ?? row.destinationNetwork),
    destinationTxHash: apiText(
      row.destination_txHash ?? row.destination_tx_hash ?? row.destinationTxHash,
    ),
    txHash: apiText(row.tx_hash ?? row.txHash),
    status: apiText(row.status).toLowerCase(),
    submittedAt: apiText(row.submitted_at ?? row.submittedAt),
    paidAt: apiText(row.paid_at ?? row.paidAt),
  };
}

function paymentsQueryParams(params: ReportPaymentsQuery | ReportPaymentsExportQuery) {
  return {
    network: params.network,
    symbol: params.symbol,
    destination_network: params.destination_network,
    destination_symbol: params.destination_symbol,
    min_amount: params.min_amount,
    max_amount: params.max_amount,
  };
}

export async function getReportPayments(params: ReportPaymentsQuery): Promise<ReportPaymentsResp> {
  const data =
    asRecord(
      await http<unknown>(`${PAY_API_PREFIX}/report/payments`, {
        query: {
          page: params.page,
          pageSize: params.pageSize,
          ...paymentsQueryParams(params),
        },
      }),
    ) ?? {};
  const rawList = Array.isArray(data.list)
    ? data.list
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.payments)
        ? data.payments
        : [];
  const list = rawList.map(mapReportPaymentItem).filter((row) => row.id > 0);
  return {
    total: apiNumber(data.total) ?? list.length,
    totalPage: Math.max(1, apiNumber(data.total_page ?? data.totalPage) ?? 1),
    list,
  };
}

const REPORT_PAYMENTS_EXPORT_FILENAME = "report-payments.csv";

export function exportReportPayments(params: ReportPaymentsExportQuery) {
  return httpBlob(`${PAY_API_PREFIX}/report/payments/export`, {
    query: paymentsQueryParams(params),
    fallbackFilename: REPORT_PAYMENTS_EXPORT_FILENAME,
  });
}
