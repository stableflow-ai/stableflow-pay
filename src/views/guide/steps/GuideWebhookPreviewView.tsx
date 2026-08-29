import { Navigate, useNavigate } from "react-router-dom";
import { IconDelete } from "@/components/icons/delete";
import { IconResetPassword } from "@/components/icons/reset-password";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { formatWebhookEvents } from "@/views/settings/utils";
import { GUIDE_STEP_PATH, GUIDE_STEPS } from "../config";
import { GuideDrawer } from "../GuideDrawer";
import { GuideSuccessMark } from "../components/GuideSuccessMark";
import { useGuideProgress } from "../hooks/use-guide-progress";

export function GuideWebhookPreviewView() {
  const navigate = useNavigate();
  const { webhook } = useGuideProgress();

  if (!webhook) {
    return <Navigate to={GUIDE_STEP_PATH.webhook} replace />;
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
            {/* <div className="flex shrink-0 items-center gap-3 pt-1">
              <span className="text-[#aaa]" aria-hidden>
                <IconResetPassword className="h-[18px] w-[15px]" />
              </span>
              <span className="text-[#aaa]" aria-hidden>
                <IconDelete className="size-3.5" />
              </span>
            </div> */}
          </div>
        </div>
        <Button
          size={BUTTON_SIZE.Lg}
          className="mt-8 w-full"
          onClick={() => navigate(GUIDE_STEP_PATH.test)}
        >
          Continue to test
        </Button>
      </div>
    </GuideDrawer>
  );
}

export default GuideWebhookPreviewView;
