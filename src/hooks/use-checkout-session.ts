import { useQuery } from "@tanstack/react-query";
import { getCheckoutSession } from "@/api/checkout";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";

export function useCheckoutSessionQuery(sessionId: string | undefined) {
  const token = useAuthStore((state) => state.token);
  const id = sessionId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.checkout.session(id),
    queryFn: () => getCheckoutSession(id, { auth: Boolean(token) }),
    enabled: Boolean(id),
  });
}
