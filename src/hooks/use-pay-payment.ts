import { useQuery } from "@tanstack/react-query";
import { getPayPayment } from "@/api/payout";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import { PAY_PAYMENT_STATUS, STATUS_POLL_MS } from "@/views/payer/config";

const TERMINAL_STATUSES = new Set<string>([
  PAY_PAYMENT_STATUS.Completed,
  PAY_PAYMENT_STATUS.Failed,
]);

export function usePayPaymentQuery(paymentId: string | undefined) {
  const token = useAuthStore((state) => state.token);
  const id = paymentId?.trim() ?? "";

  return useQuery({
    queryKey: queryKeys.payout.payment(id),
    queryFn: () => getPayPayment(id, { auth: Boolean(token) }),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status.trim().toLowerCase() ?? "";
      return TERMINAL_STATUSES.has(status) ? false : STATUS_POLL_MS;
    },
  });
}
