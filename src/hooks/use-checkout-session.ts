import { useQuery } from "@tanstack/react-query";
import { getCheckoutSession } from "@/api/checkout";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import { PAY_CHECKOUT_SESSION_STATUS, STATUS_POLL_MS } from "@/views/payer/config";

const SESSION_POLL_STOP = new Set<string>([
  PAY_CHECKOUT_SESSION_STATUS.Completed,
  PAY_CHECKOUT_SESSION_STATUS.Failed,
  PAY_CHECKOUT_SESSION_STATUS.Expired,
]);

export function useCheckoutSessionQuery(sessionId: string | undefined, options?: { poll?: boolean }) {
  const token = useAuthStore((state) => state.token);
  const id = sessionId?.trim() ?? "";

  return useQuery({
    queryKey: queryKeys.checkout.session(id),
    queryFn: () => getCheckoutSession(id, { auth: Boolean(token) }),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!options?.poll) return false;
      const session = query.state.data;
      if (!session) return STATUS_POLL_MS;
      if (session.paymentsId.trim()) return false;
      const status = session.status.trim().toLowerCase();
      return SESSION_POLL_STOP.has(status) ? false : STATUS_POLL_MS;
    },
  });
}
