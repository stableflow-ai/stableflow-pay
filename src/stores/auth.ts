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
import type { AuthUser } from "@/types/auth";

export const AUTH_SESSION_STORAGE_NAME = "stableflow-pay.session";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  applySession: (token: string, user: AuthUser) => void;
  logout: () => void;
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
      applySession: (token, user) => {
        set({ token, user });
      },
      logout: () => {
        queryClient.clear();
        set({ token: null, user: null });
      },
    }),
    {
      name: AUTH_SESSION_STORAGE_NAME,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
