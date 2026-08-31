/**
 * A swap quote may only be paid once. 1Click does not refund a second transfer
 * to the same deposit address, so a consumed `swapId` must never be broadcast
 * against again — the payer has to take a fresh quote instead.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "stableflow-pay:consumed-swaps:v1";
const MAX_ENTRIES = 50;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface ConsumedSwap {
  swapId: string;
  consumedAt: number;
}

interface ConsumedSwapsState {
  items: ConsumedSwap[];
  markConsumed: (swapId: string) => void;
}

function prune(items: ConsumedSwap[], now: number): ConsumedSwap[] {
  return items
    .filter((item) => now - item.consumedAt < TTL_MS)
    .slice(-MAX_ENTRIES);
}

export const useConsumedSwapsStore = create(
  persist<ConsumedSwapsState>(
    (set) => ({
      items: [],
      markConsumed: (swapId) => {
        const id = swapId.trim();
        if (!id) return;
        set((state) => {
          if (state.items.some((item) => item.swapId === id)) return state;
          const now = Date.now();
          return { items: prune([...state.items, { swapId: id, consumedAt: now }], now) };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }) as ConsumedSwapsState,
    },
  ),
);

export function markSwapConsumed(swapId: string) {
  useConsumedSwapsStore.getState().markConsumed(swapId);
}

export function isSwapConsumed(swapId: string): boolean {
  const id = swapId.trim();
  if (!id) return false;
  const now = Date.now();
  return useConsumedSwapsStore
    .getState()
    .items.some((item) => item.swapId === id && now - item.consumedAt < TTL_MS);
}
