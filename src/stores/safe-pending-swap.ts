/**
 * Single-swap payments proposed to a Safe and still waiting for signatures.
 *
 * A Safe proposal has no transaction hash until the owners execute it, so the swap
 * cannot be handed to `quick-pay-commit-queue` yet. Records live here until
 * `use-safe-pending-swaps` resolves a real hash.
 *
 * The navigation that follows a commit cannot be persisted, so the fields needed to
 * rebuild the waiting URL are stored alongside. Polling only runs while the payer is
 * on the pay page for that payment; a record for another payment simply waits.
 *
 * TODO: this depends on a browser polling the chain. Once the backend can register a
 * `safe_tx_hash` and watch for execution server-side (see the backend requirements
 * doc), the swap should be handed over at proposal time.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "stableflow-pay:safe-pending-swap:v1";

export interface SafePendingSwap {
  id: string;
  swapId: string;
  safeTxHash: string;
  safeAddress: string;
  chainId: number;
  /** Signatures the Safe requires, for the waiting copy. */
  threshold: number;
  /** Safe nonce at proposal time; a higher nonce on-chain means replacement. */
  safeNonce: number;
  /** Log scan floor, advanced as the poller covers blocks. Serialized bigint. */
  fromBlock: string;
  /** Quote deadline as the backend returned it. */
  deadline: string;
  createdAt: number;
  /** Set once the expiry warning has been shown, so it is not repeated. */
  expiredWarnedAt?: number;
  // Enough to rebuild the waiting route once a real hash exists.
  paymentKind: string;
  paymentId: string;
  feesUsd: string;
  payoutUsd: string;
}

interface SafePendingSwapState {
  items: SafePendingSwap[];
  enqueue: (item: SafePendingSwap) => void;
  remove: (id: string) => void;
  setScanFloor: (id: string, fromBlock: string) => void;
  markExpiredWarned: (id: string) => void;
}

export const useSafePendingSwapStore = create(
  persist<SafePendingSwapState>(
    (set) => ({
      items: [],
      enqueue: (item) => {
        set((state) => {
          const duplicate = state.items.some(
            (row) => row.id === item.id
              || (row.safeTxHash === item.safeTxHash && row.swapId === item.swapId),
          );
          if (duplicate) return state;
          return { items: [...state.items, item] };
        });
      },
      remove: (id) => {
        set((state) => ({ items: state.items.filter((row) => row.id !== id) }));
      },
      setScanFloor: (id, fromBlock) => {
        set((state) => ({
          items: state.items.map((row) => (row.id === id ? { ...row, fromBlock } : row)),
        }));
      },
      markExpiredWarned: (id) => {
        set((state) => ({
          items: state.items.map((row) =>
            row.id === id ? { ...row, expiredWarnedAt: Date.now() } : row,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }) as SafePendingSwapState,
    },
  ),
);

export function enqueueSafePendingSwap(input: Omit<SafePendingSwap, "id" | "createdAt">): string {
  const id = crypto.randomUUID();
  useSafePendingSwapStore.getState().enqueue({ ...input, id, createdAt: Date.now() });
  return id;
}
