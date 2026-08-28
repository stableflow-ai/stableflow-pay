import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import {
  createPartnerKey,
  deletePartnerKey,
  listPartnerKeys,
  updatePartnerKeyLabel,
} from "@/api/partner";
import { useAuthStore } from "@/stores/auth";
import type { PayPartnerKeyLabelBody } from "@/types/partner";

export function usePartnerKeysQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.partner.keys,
    queryFn: listPartnerKeys,
    enabled: Boolean(token),
  });
}

export function usePartnerKeyMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.partner.keys });

  const createMutation = useMutation({
    mutationFn: (body: PayPartnerKeyLabelBody) => createPartnerKey(body),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: (input: { id: number; name: string }) =>
      updatePartnerKeyLabel(input.id, { name: input.name }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePartnerKey(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
