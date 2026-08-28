import { useOutletContext } from "react-router-dom";
import { useOverviewDashboard } from "@/hooks/use-overview-dashboard";
import type { AppLayoutContextValue } from "@/layouts/AppLayout";
import { OrganizationCard } from "./components/OrganizationCard";
import { PaymentsChart } from "./components/PaymentsChart";
import { StatsRow } from "./components/StatsRow";
import { TopRevenueLinks } from "./components/TopRevenueLinks";

export function OverviewView() {
  const { openSettings } = useOutletContext<AppLayoutContextValue>();
  const dashboard = useOverviewDashboard();

  return (
    <div className="flex flex-col gap-5">
      <OrganizationCard organization={dashboard.organization} onOpenSettings={openSettings} />
      <StatsRow stats={dashboard.stats} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_392px]">
        <PaymentsChart chart={dashboard.chart} />
        <TopRevenueLinks links={dashboard.topRevenueLinks} />
      </div>
    </div>
  );
}

export default OverviewView;
