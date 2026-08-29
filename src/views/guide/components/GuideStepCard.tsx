import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { GuideStepDef } from "../config";
import { GuideStepIcon } from "./GuideStepIcon";

export function GuideStepCard({
  step,
  current,
  completed,
  to,
}: {
  step: GuideStepDef;
  current: boolean;
  completed: boolean;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-[112px] gap-3 rounded-[20px] border bg-[#fdfdfd] px-5 py-[18px] shadow-[0_0_20px_0_rgba(0,0,0,0.06)]",
        current ? "border-[#3f8afb]" : "border-white",
      )}
    >
      <GuideStepIcon number={step.number} current={current} completed={completed} size="md" />
      <div className="min-w-0">
        <p className="font-montserrat text-lg font-semibold capitalize text-black">{step.title}</p>
        <p className="mt-1.5 font-montserrat text-sm font-normal text-[#909090]">{step.description}</p>
      </div>
    </Link>
  );
}
