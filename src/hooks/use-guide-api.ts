/**
 * Guide completion mutation.
 *   POST /v1/pay/guide/complete
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeGuide } from "@/api/guide";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";

export function useCompleteGuideMutation() {
  const queryClient = useQueryClient();
  const applySession = useAuthStore((state) => state.applySession);

  return useMutation({
    mutationFn: completeGuide,
    onSuccess: () => {
      const { token, user } = useAuthStore.getState();
      if (token && user) {
        applySession(token, { ...user, guideCompleted: true });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
}
