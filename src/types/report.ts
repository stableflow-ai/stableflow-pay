export type ReportPaymentType = "api_key" | "link";

export interface ReportAnalyticsQuery {
  start_time?: number;
  end_time?: number;
  api_key_id?: number;
  link_id?: string;
  network?: string;
  type?: ReportPaymentType;
  timezone?: string;
}

export interface ReportAnalyticsDailyItem {
  date: string;
  volume: string;
  transactions: number;
}

export interface ReportAnalyticsResp {
  totalVolume: string;
  transactions: number;
  dailyStats: ReportAnalyticsDailyItem[];
}

export interface ReportPaymentsQuery {
  page: number;
  pageSize: number;
  type?: ReportPaymentType;
  api_key_id?: number;
  link_id?: string;
  network?: string;
  symbol?: string;
  destination_network?: string;
  destination_symbol?: string;
  min_amount?: number;
  max_amount?: number;
}

export type ReportPaymentsExportQuery = Omit<ReportPaymentsQuery, "page" | "pageSize">;

export interface ReportPaymentItem {
  id: number;
  paymentsId: string;
  userId: number;
  payer: string;
  recipient: string;
  amount: string;
  /** Mapped from API `symbol` for table UI. */
  token: string;
  network: string;
  destinationAmount: string;
  /** Mapped from API `destination_symbol` for table UI. */
  destinationToken: string;
  destinationNetwork: string;
  destinationTxHash: string;
  txHash: string;
  status: string;
  submittedAt: string;
  paidAt: string;
}

export interface ReportPaymentsResp {
  total: number;
  totalPage: number;
  list: ReportPaymentItem[];
}
