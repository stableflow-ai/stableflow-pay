import { useOverviewQuery } from "@/hooks/use-overview-api";
import { useAuthStore } from "@/stores/auth";
import { OverviewGuidePanel } from "./components/OverviewGuidePanel";
import { PaymentsChart } from "./components/PaymentsChart";
import { StatsRow } from "./components/StatsRow";
import { EMPTY_OVERVIEW_STATS } from "./config";

export function OverviewView() {
  const overviewQuery = useOverviewQuery();
  const guideCompleted = useAuthStore((state) => state.user?.guideCompleted === true);

  return (
    <div className="flex flex-col gap-5">
      {guideCompleted ? null : <OverviewGuidePanel />}
      <StatsRow stats={overviewQuery.data ?? EMPTY_OVERVIEW_STATS} />
      <div className="grid gap-5 grid-cols-1">
        <PaymentsChart />
      </div>
    </div>
  );
}

export default OverviewView;
