import { useOverviewDashboard } from "@/hooks/use-overview-dashboard";
import { PaymentsChart } from "./components/PaymentsChart";
import { StatsRow } from "./components/StatsRow";

export function OverviewView() {
  const dashboard = useOverviewDashboard();

  return (
    <div className="flex flex-col gap-5">
      <StatsRow stats={dashboard.stats} />
      <div className="grid gap-5 grid-cols-1">
        <PaymentsChart chart={dashboard.chart} />
      </div>
    </div>
  );
}

export default OverviewView;
