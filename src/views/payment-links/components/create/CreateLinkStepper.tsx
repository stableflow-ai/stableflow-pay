import { cn } from "@/lib/utils";
import { CREATE_PAYMENT_LINK_STEP, type CreatePaymentLinkStep } from "../../config";

export function CreateLinkStepper({ step }: { step: CreatePaymentLinkStep }) {
  const isPreview = step === CREATE_PAYMENT_LINK_STEP.Preview;
  const stepTwoLabel = isPreview ? "Generate Link" : "Preview & Confirm";

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <StepItem n={1} label="Payment Setting" active />
      <span className="mb-0.5 h-px w-20 border-t border-dashed border-[#aaa]" />
      <StepItem n={2} label={stepTwoLabel} active={isPreview} />
    </div>
  );
}

function StepItem({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex size-[26px] shrink-0 items-center justify-center rounded-full font-montserrat text-sm font-medium",
          active ? "bg-[#3F8AFB] text-white" : "bg-[#e3e3e3] text-[#aaa]",
        )}
      >
        {n}
      </span>
      <span
        className={cn(
          "font-montserrat text-base font-medium",
          active ? "text-black" : "text-[#aaa]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default CreateLinkStepper;
