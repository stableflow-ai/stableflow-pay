import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useGuideStore } from "@/stores/guide";
import { GUIDE_STEPS } from "./config";
import { GuideSkipLink } from "./components/GuideSkipLink";
import { GuideStepCard } from "./components/GuideStepCard";
import { GuideRouteFlow } from "./guide-flow";
import { useGuideProgress } from "./hooks/use-guide-progress";
import { guideStepFromPath, guideStepHref, isGuideStepDone } from "./utils";

export function GuideView() {
  return (
    <GuideRouteFlow>
      <GuideViewBody />
    </GuideRouteFlow>
  );
}

function GuideViewBody() {
  const { pathname } = useLocation();
  const current = guideStepFromPath(pathname);
  const progress = useGuideProgress();
  const userId = useAuthStore((state) => state.user?.id);
  const skipAll = useGuideStore((state) => state.skipAll);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#f6f6f6]">
      <a
        className="block shrink-0 px-4 pt-[21px] md:px-9"
        href="/"
      >
        <img src="/logo.svg" alt="PAY. Stableflow" className="h-[29px] w-[95px]" />
      </a>
      <main className="min-h-0 flex-1 overflow-auto px-4 pb-8 pt-10 md:px-0 md:pt-[120px]">
        <div className="mx-auto w-full max-w-[464px] md:ml-[221px] md:mr-auto">
          <h1 className="font-montserrat text-[26px] font-semibold text-black">Get Start</h1>
          <p className="mt-2.5 font-montserrat text-sm font-medium text-[#909090]">
            Get ready to accept payments in four simple steps.
          </p>
          <div className="mt-8 flex flex-col gap-5">
            {GUIDE_STEPS.map((step) => {
              const done = isGuideStepDone(step, progress);
              const to = guideStepHref(step, progress);
              return (
                <GuideStepCard
                  key={step.id}
                  step={step}
                  current={current === step.id}
                  completed={done}
                  to={to}
                />
              );
            })}
          </div>
          <div className="mt-8 flex justify-start md:justify-center">
            <GuideSkipLink
              to="/"
              label="Skip All"
              onClick={() => {
                if (userId) skipAll(userId);
              }}
            />
          </div>
        </div>
      </main>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default GuideView;
