/**
 * Resolve Safe proposals for the payment currently open.
 *
 * Scoped to one `paymentId` because finishing a swap means navigating to that
 * payment's waiting page, and only this page knows how. Records for other payments
 * stay untouched until their own page is opened.
 */

import { useEffect, useRef } from "react";
import type { Address, Hex } from "viem";
import useToast from "@/hooks/use-toast";
import { useSafePendingSwapStore, type SafePendingSwap } from "@/stores/safe-pending-swap";
import {
  decidePendingAction,
  resolveSafeSubmission,
  SAFE_PENDING_MAX_BACKOFF_MS,
  SAFE_PENDING_POLL_MS,
  SAFE_PROPOSAL_FAILED_MESSAGE,
  SAFE_PROPOSAL_REPLACED_MESSAGE,
  SAFE_QUOTE_EXPIRED_MESSAGE,
} from "@/wallet/evm/safe";

export function useSafePendingSwaps(input: {
  paymentId: string;
  onCommitted: (item: SafePendingSwap, txHash: string) => void;
}) {
  const toast = useToast();
  const latest = useRef(input);
  latest.current = input;
  const toastRef = useRef(toast);
  toastRef.current = toast;
  /** Records whose probe failed, held off until this timestamp. */
  const backoffRef = useRef(new Map<string, { until: number; failures: number }>());
  const inFlightRef = useRef(false);
  const { paymentId } = input;

  useEffect(() => {
    if (!paymentId) return;
    let stopped = false;

    async function probeOne(item: SafePendingSwap) {
      const store = useSafePendingSwapStore.getState();
      const probe = await resolveSafeSubmission({
        chainId: item.chainId,
        safeAddress: item.safeAddress as Address,
        hash: item.safeTxHash as Hex,
        fromBlock: BigInt(item.fromBlock),
        safeNonce: item.safeNonce,
      });

      if (probe.state === "unknown") {
        const failures = (backoffRef.current.get(item.id)?.failures ?? 0) + 1;
        const delay = Math.min(SAFE_PENDING_POLL_MS * 2 ** failures, SAFE_PENDING_MAX_BACKOFF_MS);
        backoffRef.current.set(item.id, { until: Date.now() + delay, failures });
        return;
      }
      backoffRef.current.delete(item.id);

      // Covered blocks never need re-scanning.
      if (probe.scannedToBlock != null) {
        const next = (probe.scannedToBlock + 1n).toString();
        if (next !== item.fromBlock) store.setScanFloor(item.id, next);
      }

      const action = decidePendingAction(item, probe, Date.now());
      if (action.type === "commit") {
        store.remove(item.id);
        latest.current.onCommitted(item, action.txHash);
        return;
      }
      if (action.type === "drop") {
        store.remove(item.id);
        toastRef.current.fail({
          title: action.reason === "cancelled"
            ? SAFE_PROPOSAL_REPLACED_MESSAGE
            : SAFE_PROPOSAL_FAILED_MESSAGE,
        });
        return;
      }
      if (action.type === "warn-expired") {
        store.markExpiredWarned(item.id);
        toastRef.current.info({ title: SAFE_QUOTE_EXPIRED_MESSAGE });
      }
    }

    async function runCycle() {
      if (stopped || inFlightRef.current) return;
      const now = Date.now();
      const due = useSafePendingSwapStore.getState().items.filter(
        (item) => item.paymentId === paymentId
          && (backoffRef.current.get(item.id)?.until ?? 0) <= now,
      );
      if (due.length === 0) return;
      inFlightRef.current = true;
      try {
        await Promise.all(due.map((item) => probeOne(item).catch(() => {})));
      } finally {
        inFlightRef.current = false;
      }
    }

    void runCycle();
    const timer = setInterval(() => void runCycle(), SAFE_PENDING_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [paymentId]);
}
