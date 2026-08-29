import { useQuery } from "@tanstack/react-query";
import { getPaymentLink } from "@/api/payment-links";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";

export function usePaymentLinkQuery(linkId: string | undefined) {
  const token = useAuthStore((state) => state.token);
  const id = linkId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.paymentLinks.detail(id),
    queryFn: () => getPaymentLink(id, { auth: Boolean(token) }),
    enabled: Boolean(id),
  });
}
