import { createBrowserRouter, Navigate } from "react-router-dom";
import { PLACEHOLDER_ROUTES } from "@/components/layout/config";
import { AppLayout } from "@/layouts/AppLayout";
import { LoginView } from "@/views/auth/LoginView";
import { RegisterView } from "@/views/auth/RegisterView";
import { HowItWorksView } from "@/views/how-it-works/HowItWorksView";
import { OverviewView } from "@/views/overview/OverviewView";
import { CreatePaymentLinkPreviewView } from "@/views/payment-links/CreatePaymentLinkPreviewView";
import { CreatePaymentLinkView } from "@/views/payment-links/CreatePaymentLinkView";
import { ApiKeysView } from "@/views/api-keys/ApiKeysView";
import { PaymentLinksView } from "@/views/payment-links/PaymentLinksView";
import { PlaceholderView } from "@/views/placeholder/PlaceholderView";
import { PayView } from "@/views/payer/PayView";
import { WaitingView } from "@/views/payer/WaitingView";
import { ReportsView } from "@/views/reports/ReportsView";
import { SettingsView } from "@/views/settings/SettingsView";
import { RedirectIfAuthed, RequireAuth } from "./guards";

export const router = createBrowserRouter([
  {
    path: "/paylink/:linkId",
    element: <PayView />,
  },
  {
    path: "/paylink/:linkId/waiting",
    element: <WaitingView />,
  },
  {
    path: "/checkout/waiting",
    element: <WaitingView />,
  },
  {
    path: "/checkout",
    element: <PayView />,
  },
  {
    path: "/login",
    element: (
      <RedirectIfAuthed>
        <LoginView />
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthed>
        <RegisterView />
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/howitworks",
    element: <HowItWorksView />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <OverviewView /> },
          {
            path: "/payment-links",
            element: <PaymentLinksView />,
            children: [
              { path: "create", element: <CreatePaymentLinkView /> },
              { path: "create/preview", element: <CreatePaymentLinkPreviewView /> },
            ],
          },
          { path: "/api-keys", element: <ApiKeysView /> },
          { path: "/settings", element: <SettingsView /> },
          { path: "/webhooks", element: <Navigate to="/settings" replace /> },
          { path: "/reports", element: <ReportsView /> },
          ...PLACEHOLDER_ROUTES.map((path) => ({
            path,
            element: <PlaceholderView />,
          })),
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
