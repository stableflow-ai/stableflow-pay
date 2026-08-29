import { useApiKeysQuery } from "@/hooks/use-api-keys-api";
import { usePaymentLinksQuery } from "@/hooks/use-payment-links-api";
import { useWebhooksQuery } from "@/hooks/use-webhooks-api";
import { useGuideStore } from "@/stores/guide";
import { buildPaymentLinkUrl } from "@/views/payment-links/utils";

export function useGuideProgress() {
  const storedPaymentLink = useGuideStore((state) => state.paymentLink);
  const storedApiKey = useGuideStore((state) => state.apiKey);
  const storedWebhook = useGuideStore((state) => state.webhook);
  const testCompleted = useGuideStore((state) => state.testCompleted);

  const linksQuery = usePaymentLinksQuery({ page: 1, pageSize: 1 });
  const keysQuery = useApiKeysQuery();
  const webhooksQuery = useWebhooksQuery();

  const firstLink = linksQuery.data?.list?.[0];
  const firstKey = keysQuery.data?.[0];
  const webhooks = webhooksQuery.data ?? [];
  const firstWebhook = webhooks[0];

  const paymentLink =
    storedPaymentLink ??
    (firstLink
      ? {
          linkId: firstLink.linkId,
          title: firstLink.title,
          url: buildPaymentLinkUrl(
            typeof window === "undefined" ? "" : window.location.origin,
            firstLink.linkId,
          ),
        }
      : null);

  const apiKey =
    storedApiKey ??
    (firstKey ? { id: firstKey.id, label: firstKey.name, key: firstKey.apiKey } : null);

  const webhook =
    storedWebhook ??
    (firstWebhook ? { url: firstWebhook.url, events: firstWebhook.events } : null);

  return {
    paymentLink,
    apiKey,
    webhook,
    webhookCount: webhooks.length,
    paymentLinkDone: Boolean(storedPaymentLink) || Boolean(firstLink),
    apiKeyDone: Boolean(storedApiKey) || Boolean(firstKey),
    webhookDone: Boolean(storedWebhook) || webhooks.length > 0,
    testCompleted,
    hasApiKey: Boolean(storedApiKey?.key) || Boolean(firstKey),
  };
}
