import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiKey, deleteApiKey, listApiKeys, updateApiKey } from "@/api/api-keys";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type { PayApiKey, PayApiKeyBody } from "@/types/api-keys";

export function useApiKeysQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.apiKeys.list,
    queryFn: listApiKeys,
    enabled: Boolean(token),
  });
}

export function useApiKeyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });

  const createMutation = useMutation({
    mutationFn: (body: PayApiKeyBody) => createApiKey(body),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: (input: { id: number; name: string }) => updateApiKey(input.id, { name: input.name }),
    onSuccess: (_data, input) => {
      queryClient.setQueryData<PayApiKey[]>(queryKeys.apiKeys.list, (current) =>
        current?.map((row) => (row.id === input.id ? { ...row, name: input.name } : row)),
      );
      void invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteApiKey(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
