import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paySwapCheckout, paySwapLink } from "@/api/pay";
import { queryKeys } from "@/api/query-keys";
import type { PaySwapParam } from "@/types/pay";

export type PaySwapSource = {
  kind: "paylink" | "checkout";
  id: string;
  body: PaySwapParam | null;
};

export function usePaySwapQuery(source: PaySwapSource, options?: { auth?: boolean }) {
  const auth = options?.auth ?? true;
  const enabled = Boolean(source.id && source.body);
  return useQuery({
    queryKey: queryKeys.pay.swap({ kind: source.kind, id: source.id, body: source.body, auth }),
    queryFn: () => {
      const body = source.body!;
      if (source.kind === "checkout") {
        return paySwapCheckout(source.id, body, { auth });
      }
      return paySwapLink(source.id, body, { auth });
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
