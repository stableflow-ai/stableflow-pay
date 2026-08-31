import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentLink,
  deletePaymentLink,
  disablePaymentLink,
  enablePaymentLink,
  exportPaymentLinkPayments,
  getPaymentLinkStats,
  listDefaultAddresses,
  listPaymentLinkPayments,
  listPaymentLinks,
} from "@/api/payment-links";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type {
  PayPaymentLinkBody,
  PayPaymentLinkPaymentsQuery,
  PayPaymentLinksQuery,
} from "@/types/payment-links";
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

export function usePaymentLinksQuery(params: PayPaymentLinksQuery) {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.paymentLinks.list(params),
    queryFn: () => listPaymentLinks(params),
    enabled: Boolean(token),
  });
}

export function useDefaultAddressesQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.paymentLinks.defaultAddresses,
    queryFn: listDefaultAddresses,
    enabled: Boolean(token),
  });
}

export function usePaymentLinkStatsQuery(linkId: string | undefined) {
  const token = useAuthStore((state) => state.token);
  const id = linkId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.paymentLinks.stats(id),
    queryFn: () => getPaymentLinkStats(id),
    enabled: Boolean(token && id),
  });
}

export function usePaymentLinkPaymentsQuery(
  linkId: string | undefined,
  params: PayPaymentLinkPaymentsQuery,
) {
  const token = useAuthStore((state) => state.token);
  const id = linkId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.paymentLinks.payments(id, params),
    queryFn: () => listPaymentLinkPayments(id, params),
    enabled: Boolean(token && id),
  });
}

export function useExportPaymentLinkPaymentsMutation() {
  return useMutation({
    mutationFn: (linkId: string) => exportPaymentLinkPayments(linkId),
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, stampDownloadFilename(filename));
    },
  });
}

export function usePaymentLinkMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentLinks.all });

  const createMutation = useMutation({
    mutationFn: (body: PayPaymentLinkBody) => createPaymentLink(body),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (linkId: string) => deletePaymentLink(linkId),
    onSuccess: invalidate,
  });
  const enableMutation = useMutation({
    mutationFn: (linkId: string) => enablePaymentLink(linkId),
    onSuccess: invalidate,
  });
  const disableMutation = useMutation({
    mutationFn: (linkId: string) => disablePaymentLink(linkId),
    onSuccess: invalidate,
  });

  return { createMutation, deleteMutation, enableMutation, disableMutation };
}
