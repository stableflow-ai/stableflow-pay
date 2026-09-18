import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayConfig } from "@/api/pay-config";
import { queryKeys } from "@/api/query-keys";
import { useIntentsTokensStore } from "@/stores/intents-tokens";

const CONFIG_STALE_MS = 30 * 60 * 1000;

export function usePayConfigQuery() {
  const applyConfig = useIntentsTokensStore((state) => state.applyConfig);
  const query = useQuery({
    queryKey: queryKeys.pay.config,
    queryFn: getPayConfig,
    staleTime: CONFIG_STALE_MS,
  });

  useEffect(() => {
    if (query.data) applyConfig(query.data);
  }, [applyConfig, query.data]);

  useEffect(() => {
    if (query.isError) applyConfig(null);
  }, [applyConfig, query.isError]);

  return query;
}
