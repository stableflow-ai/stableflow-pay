import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { postAuthPath } from "@/views/auth/post-auth-path";
import { loginPathWithReturnTo, returnToFromSearch } from "@/views/auth/return-to";

export function RequireAuth() {
  const user = useAuthStore((state) => state.user);
  const omitReturnTo = useAuthStore((state) => state.omitReturnTo);
  const clearOmitReturnTo = useAuthStore((state) => state.clearOmitReturnTo);
  const location = useLocation();

  useLayoutEffect(() => {
    if (!user && omitReturnTo) clearOmitReturnTo();
  }, [clearOmitReturnTo, omitReturnTo, user]);

  if (!user) {
    if (omitReturnTo) {
      return <Navigate to="/login" replace />;
    }
    const dest = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={loginPathWithReturnTo(dest)} replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [params] = useSearchParams();

  if (user) {
    return <Navigate to={postAuthPath(user, returnToFromSearch(params.toString()))} replace />;
  }

  return children;
}
