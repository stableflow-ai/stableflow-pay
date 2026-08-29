import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganization, updateOrganization } from "@/api/organization";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type { PayOrganizationBody } from "@/types/organization";

export function useOrganizationQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.organization.current,
    queryFn: getOrganization,
    enabled: Boolean(token),
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PayOrganizationBody) => updateOrganization(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.organization.all });
    },
  });
}
