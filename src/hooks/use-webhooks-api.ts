import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWebhook,
  deleteWebhook,
  disableWebhook,
  enableWebhook,
  listWebhooks,
  rotateWebhookSecret,
  simulateWebhook,
} from "@/api/webhooks";
import { queryKeys } from "@/api/query-keys";
import { useAuthStore } from "@/stores/auth";
import type { PayWebhookBody, SimulateWebhookBody } from "@/types/webhooks";

export function useWebhooksQuery() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: queryKeys.webhooks.list,
    queryFn: listWebhooks,
    enabled: Boolean(token),
  });
}

export function useWebhookMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.all });

  const createMutation = useMutation({
    mutationFn: (body: PayWebhookBody) => createWebhook(body),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => deleteWebhook(webhookId),
    onSuccess: invalidate,
  });
  const enableMutation = useMutation({
    mutationFn: (webhookId: string) => enableWebhook(webhookId),
    onSuccess: invalidate,
  });
  const disableMutation = useMutation({
    mutationFn: (webhookId: string) => disableWebhook(webhookId),
    onSuccess: invalidate,
  });
  const rotateSecretMutation = useMutation({
    mutationFn: (webhookId: string) => rotateWebhookSecret(webhookId),
    onSuccess: invalidate,
  });
  const simulateMutation = useMutation({
    mutationFn: (body: SimulateWebhookBody) => simulateWebhook(body),
  });

  return {
    createMutation,
    deleteMutation,
    enableMutation,
    disableMutation,
    rotateSecretMutation,
    simulateMutation,
  };
}
