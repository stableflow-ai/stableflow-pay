import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "@/api/checkout";
import type { PayCheckoutSessionBody } from "@/types/pay";

export function useCreateCheckoutSessionMutation() {
  return useMutation({
    mutationFn: (input: { body: PayCheckoutSessionBody; apiKey: string }) =>
      createCheckoutSession(input.body, input.apiKey),
  });
}
