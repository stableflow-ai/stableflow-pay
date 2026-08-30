import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export const GUIDE_STORAGE_NAME = "stableflow-pay.guide";

export type GuidePaymentLink = {
  linkId: string;
  title: string;
  url: string;
};

export type GuideApiKey = {
  id: number;
  label: string;
  key: string;
};

export type GuideWebhook = {
  url: string;
  events: string[];
};

interface GuideState {
  paymentLink: GuidePaymentLink | null;
  apiKey: GuideApiKey | null;
  webhook: GuideWebhook | null;
  setPaymentLink: (value: GuidePaymentLink) => void;
  setApiKey: (value: GuideApiKey) => void;
  setWebhook: (value: GuideWebhook) => void;
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
      // Ignore storage failures (private mode, tests without Storage, etc.).
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

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      paymentLink: null,
      apiKey: null,
      webhook: null,
      setPaymentLink: (paymentLink) => set({ paymentLink }),
      setApiKey: (apiKey) => set({ apiKey }),
      setWebhook: (webhook) => set({ webhook }),
    }),
    {
      name: GUIDE_STORAGE_NAME,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        paymentLink: state.paymentLink,
        apiKey: state.apiKey,
        webhook: state.webhook,
      }),
    },
  ),
);
