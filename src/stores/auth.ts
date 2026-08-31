/**
 * Client session store (Zustand persist).
 *
 * Server state belongs in TanStack Query. Keep this store for the JWT session
 * (`token` + `user`) only. Persistence is handled by Zustand — do not read or
 * write localStorage from feature code.
 * `GET /v1/pay/profile` (`useProfileQuery`) validates the stored token in the
 * background; HTTP 401 calls `logout()`.
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { queryClient } from "@/lib/query-client";
import { useGoogleDriveSessionStore } from "@/stores/google-drive-session";
import type { AuthUser } from "@/types/auth";

export const AUTH_SESSION_STORAGE_NAME = "stableflow-pay.session";

export type LogoutOptions = {
  omitReturnTo?: boolean;
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  omitReturnTo: boolean;
  applySession: (token: string, user: AuthUser) => void;
  logout: (options?: LogoutOptions) => void;
  clearOmitReturnTo: () => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      omitReturnTo: false,
      applySession: (token, user) => {
        set({ token, user, omitReturnTo: false });
      },
      logout: (options) => {
        queryClient.clear();
        useGoogleDriveSessionStore.getState().clear();
        set({
          token: null,
          user: null,
          omitReturnTo: options?.omitReturnTo === true,
        });
      },
      clearOmitReturnTo: () => {
        set({ omitReturnTo: false });
      },
    }),
    {
      name: AUTH_SESSION_STORAGE_NAME,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
