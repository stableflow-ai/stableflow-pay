import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card/Card";
import type { OverviewStats } from "@/types/overview";
import { OVERVIEW_LINK_CLASS, OVERVIEW_VALUE_CLASS } from "../config";
import { splitUsdAmount } from "../utils";
import Big from "big.js";

export function StatsRow({ stats }: { stats: OverviewStats }) {
  const revenue = splitUsdAmount(stats.totalRevenue);
  const isDust = Big(stats.totalRevenue || 0).lt(0.01) && Big(stats.totalRevenue || 0).gt(0);

  return (
    <Card className="grid gap-8 p-4 md:grid-cols-4 md:gap-6 md:px-7 md:py-7">
      <div>
        <p className="font-montserrat text-base font-medium capitalize text-black">Total Revenue</p>
        {
          isDust ? (
            <p className={`${OVERVIEW_VALUE_CLASS} mt-2`}>
              $&lt;0
              <span className="text-[#9fa7ba]">.01</span>
            </p>
          ) : (
            <p className={`${OVERVIEW_VALUE_CLASS} mt-2`}>
              {revenue.whole}
              {revenue.fraction ? <span className="text-[#9fa7ba]">{revenue.fraction}</span> : null}
            </p>
          )
        }
      </div>
      <StatLinkBlock
        label="Total Transactions"
        value={String(stats.totalTransactions)}
        to="/reports"
        action="View all →"
      />
      <StatLinkBlock
        label="Active Links"
        value={String(stats.activeLinks)}
        to="/payment-links"
        action="Manage →"
      />
      <StatLinkBlock
        label="API keys"
        value={String(stats.apiKeys)}
        to="/api-keys"
        action="Manage →"
      />
    </Card>
  );
}

function StatLinkBlock({
  label,
  value,
  to,
  action,
}: {
  label: string;
  value: string;
  to: string;
  action: string;
}) {
  return (
    <div>
      <p className="font-montserrat text-base font-medium capitalize text-black">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className={OVERVIEW_VALUE_CLASS}>{value}</p>
        <Link to={to} className={`${OVERVIEW_LINK_CLASS} text-base`}>
          {action}
        </Link>
      </div>
    </div>
  );
}
