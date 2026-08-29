import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { PayCheckoutSession } from "@/types/pay";

const STORAGE_KEY = "stableflow-pay.payer-session";

export const PAYER_KIND = {
  Paylink: "paylink",
  Checkout: "checkout",
} as const;

export type PayerKind = (typeof PAYER_KIND)[keyof typeof PAYER_KIND];

export type PayerCheckoutSnapshot = Pick<
  PayCheckoutSession,
  "amount" | "createdAt" | "expiresAt" | "network" | "outOrderNo" | "recipient" | "sessionId" | "symbol" | "successUrl"
>;

export interface PayerSession {
  kind: PayerKind;
  paymentId: string;
  depositAddress: string;
  swapId: string;
  txHash: string;
  iconUrl: string | null;
  recipientAddress: string;
  requestAmount: string;
  destSymbol: string;
  destNetwork: string;
  youPayAmount: string;
  originSymbol: string;
  originNetwork: string;
  payerAddress: string;
  amountInUsd: string;
  feesUsd: string;
  payoutUsd: string;
  timeEstimate: number;
  paidAt: number;
  checkout?: PayerCheckoutSnapshot;
}

interface PayerSessionState {
  session: PayerSession | null;
  setSession: (session: PayerSession) => void;
  clearSession: () => void;
}

const persistStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage.setItem(name, value);
    } catch {
      // Ignore storage failures.
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage.removeItem(name);
    } catch {
      // Ignore storage failures.
    }
  },
};

export const usePayerSessionStore = create<PayerSessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
