import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { formatWebhookEvents } from "@/views/settings/utils";
import { GUIDE_STEP_PATH, GUIDE_STEPS } from "../config";
import { GuideDrawer } from "../GuideDrawer";
import { GuideSuccessMark } from "../components/GuideSuccessMark";
import { GuideRedirect, useGuideFlow } from "../guide-flow";
import { useGuideProgress } from "../hooks/use-guide-progress";

export function GuideWebhookPreviewView() {
  const { go } = useGuideFlow();
  const { webhook } = useGuideProgress();

  if (!webhook) {
    return <GuideRedirect to={GUIDE_STEP_PATH.webhook} />;
  }

  return (
    <GuideDrawer title={GUIDE_STEPS[2].drawerTitle}>
      <div className="flex flex-col items-center pt-8">
        <GuideSuccessMark />
        <p className="mt-6 text-center font-montserrat text-base font-semibold text-black">
          Webhook has been created
        </p>
        <div className="mt-8 w-full">
          <p className="font-montserrat text-sm font-medium text-[#606060]">Webhook</p>
          <div className="mt-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-montserrat text-base font-medium text-black">{webhook.url}</p>
              <p className="mt-1.5 font-montserrat text-xs font-medium text-[#606060]">
                {formatWebhookEvents(webhook.events)}
              </p>
            </div>
          </div>
        </div>
        <Button
          size={BUTTON_SIZE.Lg}
          className="mt-8 w-full"
          onClick={() => go(GUIDE_STEP_PATH.test)}
        >
          Continue to test
        </Button>
      </div>
    </GuideDrawer>
  );
}

export default GuideWebhookPreviewView;
