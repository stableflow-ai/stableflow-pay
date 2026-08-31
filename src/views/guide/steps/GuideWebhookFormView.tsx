import { useWebhookMutations } from "@/hooks/use-webhooks-api";
import { useGuideStore } from "@/stores/guide";
import { WebhookForm } from "@/views/settings/components/WebhookForm";
import { GUIDE_STEP, GUIDE_STEP_PATH, GUIDE_STEPS } from "../config";
import { GuideDrawer } from "../GuideDrawer";
import { GuideSkipLink } from "../components/GuideSkipLink";
import { GuideRedirect, useGuideFlow } from "../guide-flow";
import { useGuideProgress } from "../hooks/use-guide-progress";
import { nextGuideStepHref } from "../utils";

export function GuideWebhookFormView() {
  const { go } = useGuideFlow();
  const { createMutation } = useWebhookMutations();
  const setWebhook = useGuideStore((state) => state.setWebhook);
  const progress = useGuideProgress();

  if (progress.webhookDone) {
    return <GuideRedirect to={GUIDE_STEP_PATH.webhookPreview} />;
  }

  return (
    <GuideDrawer title={GUIDE_STEPS[2].drawerTitle}>
      <WebhookForm
        submitLabel="Set up"
        onSubmit={async (url, events) => {
          await createMutation.mutateAsync({ url, events });
          setWebhook({ url, events });
          go(GUIDE_STEP_PATH.webhookPreview);
        }}
      />
      <div className="mt-5 flex justify-center">
        <GuideSkipLink
          to={nextGuideStepHref(GUIDE_STEP.Webhook, progress) ?? GUIDE_STEP_PATH.test}
          label="Skip"
        />
      </div>
    </GuideDrawer>
  );
}

export default GuideWebhookFormView;
