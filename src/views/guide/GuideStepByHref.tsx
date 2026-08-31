import { GuideApiKeyFormView } from "./steps/GuideApiKeyFormView";
import { GuideApiKeyPreviewView } from "./steps/GuideApiKeyPreviewView";
import { GuidePaymentLinkFormView } from "./steps/GuidePaymentLinkFormView";
import { GuidePaymentLinkPreviewView } from "./steps/GuidePaymentLinkPreviewView";
import { GuideTestView } from "./steps/GuideTestView";
import { GuideWebhookFormView } from "./steps/GuideWebhookFormView";
import { GuideWebhookPreviewView } from "./steps/GuideWebhookPreviewView";
import { GUIDE_STEP_PATH } from "./config";

export function GuideStepByHref({ href }: { href: string }) {
  if (href.startsWith(GUIDE_STEP_PATH.paymentLinkPreview)) return <GuidePaymentLinkPreviewView />;
  if (href.startsWith(GUIDE_STEP_PATH.paymentLink)) return <GuidePaymentLinkFormView />;
  if (href.startsWith(GUIDE_STEP_PATH.apiKeyPreview)) return <GuideApiKeyPreviewView />;
  if (href.startsWith(GUIDE_STEP_PATH.apiKey)) return <GuideApiKeyFormView />;
  if (href.startsWith(GUIDE_STEP_PATH.webhookPreview)) return <GuideWebhookPreviewView />;
  if (href.startsWith(GUIDE_STEP_PATH.webhook)) return <GuideWebhookFormView />;
  if (href.startsWith(GUIDE_STEP_PATH.test)) return <GuideTestView />;
  return null;
}
