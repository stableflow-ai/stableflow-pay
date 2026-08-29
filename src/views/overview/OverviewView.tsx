import { useOverviewDashboard } from "@/hooks/use-overview-dashboard";
import { useGuideStore } from "@/stores/guide";
import { OverviewGuidePanel } from "./components/OverviewGuidePanel";
import { PaymentsChart } from "./components/PaymentsChart";
import { StatsRow } from "./components/StatsRow";

export function OverviewView() {
  const dashboard = useOverviewDashboard();
  const testCompleted = useGuideStore((state) => state.testCompleted);

  return (
    <div className="flex flex-col gap-5">
      {testCompleted ? null : <OverviewGuidePanel />}
      <StatsRow stats={dashboard.stats} />
      <div className="grid gap-5 grid-cols-1">
        <PaymentsChart chart={dashboard.chart} />
      </div>
    </div>
  );
}

export default OverviewView;
