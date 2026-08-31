import { useCallback, useState } from "react";
import { useOverviewQuery } from "@/hooks/use-overview-api";
import { useAuthStore } from "@/stores/auth";
import { GuideStepByHref } from "@/views/guide/GuideStepByHref";
import { OverviewGuideFlow } from "@/views/guide/guide-flow";
import { OverviewGuidePanel } from "./components/OverviewGuidePanel";
import { PaymentsChart } from "./components/PaymentsChart";
import { StatsRow } from "./components/StatsRow";
import { EMPTY_OVERVIEW_STATS } from "./config";

export function OverviewView() {
  const overviewQuery = useOverviewQuery();
  const guideCompleted = useAuthStore((state) => state.user?.guideCompleted === true);
  const [guideHref, setGuideHref] = useState<string | null>(null);
  const onGuideHrefChange = useCallback((href: string | null) => {
    setGuideHref(href);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {guideCompleted ? null : (
        <>
          <OverviewGuidePanel onOpenStep={setGuideHref} />
          {guideHref ? (
            <OverviewGuideFlow onHrefChange={onGuideHrefChange}>
              <GuideStepByHref href={guideHref} />
            </OverviewGuideFlow>
          ) : null}
        </>
      )}
      <StatsRow stats={overviewQuery.data ?? EMPTY_OVERVIEW_STATS} />
      <div className="grid gap-5 grid-cols-1">
        <PaymentsChart />
      </div>
    </div>
  );
}

export default OverviewView;
