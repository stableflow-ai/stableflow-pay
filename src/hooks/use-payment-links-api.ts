import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentLink,
  deletePaymentLink,
  disablePaymentLink,
  enablePaymentLink,
  listPaymentLinks,
} from "@/api/payment-links";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type { PayPaymentLinkBody } from "@/types/payment-links";

export function usePaymentLinksQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.paymentLinks.list,
    queryFn: listPaymentLinks,
    enabled: Boolean(token),
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
