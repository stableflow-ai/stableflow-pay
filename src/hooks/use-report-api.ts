/**
 * Reports page queries and export.
 *   GET /v1/pay/report/analytics
 *   GET /v1/pay/report/payments
 *   GET /v1/pay/report/payments/export
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { exportReportPayments, getReportAnalytics, getReportPayments } from "@/api/report";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type {
  ReportAnalyticsQuery,
  ReportPaymentsExportQuery,
  ReportPaymentsQuery,
} from "@/types/report";
import { stampDownloadFilename } from "@/utils";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useReportAnalyticsQuery(params: ReportAnalyticsQuery) {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.report.analytics(params),
    queryFn: () => getReportAnalytics(params),
    enabled: Boolean(token),
  });
}

export function useReportPaymentsQuery(params: ReportPaymentsQuery) {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.report.payments(params),
    queryFn: () => getReportPayments(params),
    enabled: Boolean(token),
  });
}

export function useExportReportPaymentsMutation() {
  return useMutation({
    mutationFn: (params: ReportPaymentsExportQuery) => exportReportPayments(params),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, stampDownloadFilename(filename));
    },
  });
}
