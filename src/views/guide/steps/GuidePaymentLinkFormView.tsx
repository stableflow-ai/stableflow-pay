import { Navigate, useNavigate } from "react-router-dom";
import { useGuideStore } from "@/stores/guide";
import { buildPaymentLinkUrl } from "@/views/payment-links/utils";
import { CreateLinkForm } from "@/views/payment-links/components/create/CreateLinkForm";
import { GUIDE_STEP, GUIDE_STEP_PATH, GUIDE_STEPS } from "../config";
import { GuideDrawer } from "../GuideDrawer";
import { GuideSkipLink } from "../components/GuideSkipLink";
import { useGuideProgress } from "../hooks/use-guide-progress";
import { nextGuideStepHref } from "../utils";

export function GuidePaymentLinkFormView() {
  const navigate = useNavigate();
  const setPaymentLink = useGuideStore((state) => state.setPaymentLink);
  const progress = useGuideProgress();
  const step = GUIDE_STEPS[0];

  if (progress.paymentLinkDone) {
    return <Navigate to={GUIDE_STEP_PATH.paymentLinkPreview} replace />;
  }

  return (
    <GuideDrawer title={step.drawerTitle}>
      <CreateLinkForm
        showStepper={false}
        onCreated={({ linkId, title }) => {
          setPaymentLink({
            linkId,
            title,
            url: buildPaymentLinkUrl(window.location.origin, linkId),
          });
          navigate(GUIDE_STEP_PATH.paymentLinkPreview);
        }}
      />
      <div className="mt-5 flex justify-center">
        <GuideSkipLink
          to={nextGuideStepHref(GUIDE_STEP.PaymentLink, progress) ?? GUIDE_STEP_PATH.apiKey}
          label="Skip"
        />
      </div>
    </GuideDrawer>
  );
}

export default GuidePaymentLinkFormView;
