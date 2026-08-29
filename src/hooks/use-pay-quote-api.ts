import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { payQuote, paySwapCheckout, paySwapLink } from "@/api/pay";
import { queryKeys } from "@/api/query-keys";
import type { PayQuoteParam, PaySwapParam } from "@/types/pay";

export function usePayQuote(body: PayQuoteParam | null, options?: { auth?: boolean }) {
  const auth = options?.auth ?? true;
  return useQuery({
    queryKey: queryKeys.pay.quote({ body, auth }),
    queryFn: () => payQuote(body!, { auth }),
    enabled: Boolean(body),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}

export function usePaySwap(options?: { auth?: boolean }) {
  const auth = options?.auth ?? true;
  return useMutation({
    mutationFn: (input: { kind: "paylink" | "checkout"; id: string; body: PaySwapParam }) => {
      if (input.kind === "checkout") {
        return paySwapCheckout(input.id, input.body, { auth });
      }
      return paySwapLink(input.id, input.body, { auth });
    },
  });
}
