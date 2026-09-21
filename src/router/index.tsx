import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PLACEHOLDER_ROUTES } from "@/components/layout/config";
import { AppLayout } from "@/layouts/AppLayout";
import { PRIVACY_TRANSFER_PATH } from "@/views/privacy-transfer/config";
import { LoginView } from "@/views/auth/LoginView";
import { RegisterView } from "@/views/auth/RegisterView";
import { HowItWorksView } from "@/views/how-it-works/HowItWorksView";
import { GuideView } from "@/views/guide/GuideView";
import { GuideApiKeyFormView } from "@/views/guide/steps/GuideApiKeyFormView";
import { GuideApiKeyPreviewView } from "@/views/guide/steps/GuideApiKeyPreviewView";
import { GuidePaymentLinkFormView } from "@/views/guide/steps/GuidePaymentLinkFormView";
import { GuidePaymentLinkPreviewView } from "@/views/guide/steps/GuidePaymentLinkPreviewView";
import { GuideWebhookFormView } from "@/views/guide/steps/GuideWebhookFormView";
import { GuideWebhookPreviewView } from "@/views/guide/steps/GuideWebhookPreviewView";
import { OverviewView } from "@/views/overview/OverviewView";
import { CreatePaymentLinkPreviewView } from "@/views/payment-links/CreatePaymentLinkPreviewView";
import { CreatePaymentLinkView } from "@/views/payment-links/CreatePaymentLinkView";
import { ApiKeysView } from "@/views/api-keys/ApiKeysView";
import { PaymentLinksView } from "@/views/payment-links/PaymentLinksView";
import { PrivacyTransferView } from "@/views/privacy-transfer/PrivacyTransferView";
import { PlaceholderView } from "@/views/placeholder/PlaceholderView";
import { PayView } from "@/views/payer/PayView";
import { WaitingView } from "@/views/payer/WaitingView";
import { ReportsView } from "@/views/reports/ReportsView";
import { SettingsView } from "@/views/settings/SettingsView";
import { RedirectIfAuthed, RequireAuth } from "./guards";

// Docs and the guide test step load Shiki (syntax highlighting), so they are
// code-split to keep the highlighter out of the initial bundle. The docs route
// wraps its own Suspense; GuideView provides the fallback for the test step.
const DocsView = lazy(() => import("@/views/docs/DocsView").then((m) => ({ default: m.DocsView })));
const GuideTestView = lazy(() =>
  import("@/views/guide/steps/GuideTestView").then((m) => ({ default: m.GuideTestView })),
);

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
    path: "/docs",
    element: (
      <Suspense fallback={null}>
        <DocsView />
      </Suspense>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/guide",
        element: <GuideView />,
        children: [
          { path: "payment-link", element: <GuidePaymentLinkFormView /> },
          { path: "payment-link/preview", element: <GuidePaymentLinkPreviewView /> },
          { path: "api-key", element: <GuideApiKeyFormView /> },
          { path: "api-key/preview", element: <GuideApiKeyPreviewView /> },
          { path: "webhook", element: <GuideWebhookFormView /> },
          { path: "webhook/preview", element: <GuideWebhookPreviewView /> },
          { path: "test", element: <GuideTestView /> },
        ],
      },
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
          { path: PRIVACY_TRANSFER_PATH, element: <PrivacyTransferView /> },
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
