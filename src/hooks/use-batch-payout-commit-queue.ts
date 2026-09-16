import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { onBatchPayoutCommitSuccess } from "@/stores/batch-payout-commit-queue";

export function useBatchPayoutCommitQueue() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // processAllPendingBatchPayoutCommits is unused: submit is one-shot.
    return onBatchPayoutCommitSuccess(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payout.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    });
  }, [queryClient]);
}
