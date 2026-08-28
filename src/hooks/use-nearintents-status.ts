import { useQuery } from "@tanstack/react-query";
import { nearintentsStatus } from "@/api/nearintents";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";

const STATUS_POLL_MS = 4_000;
const TERMINAL_STATUSES = new Set(["SUCCESS", "FAILED", "REFUNDED", "INCOMPLETE_DEPOSIT"]);

export function useNearintentsStatusQuery(depositAddress: string | null) {
  const token = useAuthStore((state) => state.token);
  const auth = Boolean(token);
  const address = depositAddress?.trim() || "";

  return useQuery({
    queryKey: queryKeys.nearintents.status(address),
    queryFn: () => nearintentsStatus(address, { auth }),
    enabled: Boolean(address),
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || "").toUpperCase();
      return TERMINAL_STATUSES.has(status) ? false : STATUS_POLL_MS;
    },
  });
}
