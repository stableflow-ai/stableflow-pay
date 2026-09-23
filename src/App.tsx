import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useProfileQuery } from "@/hooks/use-auth-api";
import { usePayConfigQuery } from "@/hooks/use-pay-config";
import { queryClient } from "@/lib/query-client";
/** Hydrates the session and registers HTTP 401 → logout. */
import { AUTH_SESSION_STORAGE_NAME, useAuthStore } from "@/stores/auth";
import { PayWidgetsRoot } from "@/components/pay-widgets-root";
import { router } from "./router";

function SessionBootstrap() {
  useProfileQuery();
  usePayConfigQuery();
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SESSION_STORAGE_NAME) return;
      queryClient.clear();
      void useAuthStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

export default function App() {
  return (
    <PayWidgetsRoot>
      <SessionBootstrap />
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        theme="light"
        toastStyle={{ backgroundColor: "transparent", boxShadow: "none" }}
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss
        closeButton={false}
      />
    </PayWidgetsRoot>
  );
}
