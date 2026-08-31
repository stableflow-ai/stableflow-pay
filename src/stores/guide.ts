import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { useAuthStore } from "@/stores/auth";

export const GUIDE_STORAGE_NAME = "stableflow-pay.guide";
export const GUIDE_STORAGE_VERSION = 1;

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

export type GuideArtifacts = {
  paymentLink: GuidePaymentLink | null;
  apiKey: GuideApiKey | null;
  webhook: GuideWebhook | null;
};

interface GuideState {
  artifactsByUserId: Record<string, GuideArtifacts>;
  skippedAllUserIds: number[];
  setPaymentLink: (value: GuidePaymentLink) => void;
  setApiKey: (value: GuideApiKey) => void;
  setWebhook: (value: GuideWebhook) => void;
  skipAll: (userId: number) => void;
  hasSkippedAll: (userId: number) => boolean;
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

function emptyArtifacts(): GuideArtifacts {
  return { paymentLink: null, apiKey: null, webhook: null };
}

function userKey(userId: number | null | undefined): string | null {
  if (!userId || !Number.isFinite(userId) || userId <= 0) return null;
  return String(userId);
}

function currentUserKey(): string | null {
  return userKey(useAuthStore.getState().user?.id);
}

export function guideArtifactsForUser(
  state: Pick<GuideState, "artifactsByUserId">,
  userId: number | null | undefined,
): GuideArtifacts {
  const key = userKey(userId);
  if (!key) return emptyArtifacts();
  return state.artifactsByUserId[key] ?? emptyArtifacts();
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      artifactsByUserId: {},
      skippedAllUserIds: [],
      setPaymentLink: (paymentLink) => {
        const key = currentUserKey();
        if (!key) return;
        set((state) => ({
          artifactsByUserId: {
            ...state.artifactsByUserId,
            [key]: { ...guideArtifactsForUser(state, Number(key)), paymentLink },
          },
        }));
      },
      setApiKey: (apiKey) => {
        const key = currentUserKey();
        if (!key) return;
        set((state) => ({
          artifactsByUserId: {
            ...state.artifactsByUserId,
            [key]: { ...guideArtifactsForUser(state, Number(key)), apiKey },
          },
        }));
      },
      setWebhook: (webhook) => {
        const key = currentUserKey();
        if (!key) return;
        set((state) => ({
          artifactsByUserId: {
            ...state.artifactsByUserId,
            [key]: { ...guideArtifactsForUser(state, Number(key)), webhook },
          },
        }));
      },
      skipAll: (userId) => {
        if (!Number.isFinite(userId) || userId <= 0) return;
        set((state) => {
          if (state.skippedAllUserIds.includes(userId)) return state;
          return { skippedAllUserIds: [...state.skippedAllUserIds, userId] };
        });
      },
      hasSkippedAll: (userId) => get().skippedAllUserIds.includes(userId),
    }),
    {
      name: GUIDE_STORAGE_NAME,
      version: GUIDE_STORAGE_VERSION,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        artifactsByUserId: state.artifactsByUserId,
        skippedAllUserIds: state.skippedAllUserIds,
      }),
      migrate: (persisted) => {
        const row = (persisted ?? {}) as {
          artifactsByUserId?: Record<string, GuideArtifacts>;
          skippedAllUserIds?: number[];
        };
        const skippedAllUserIds = Array.isArray(row.skippedAllUserIds)
          ? row.skippedAllUserIds.filter((id) => typeof id === "number" && id > 0)
          : [];
        return {
          artifactsByUserId:
            row.artifactsByUserId && typeof row.artifactsByUserId === "object"
              ? row.artifactsByUserId
              : {},
          skippedAllUserIds,
        };
      },
    },
  ),
);
