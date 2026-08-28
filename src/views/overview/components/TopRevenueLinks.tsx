import { Link } from "react-router-dom";
import { Icon2Right } from "@/components/icons/to-right";
import { IconChevron } from "@/components/icons/chevron";
import { Card } from "@/components/ui/card/Card";
import { formatAmount } from "@/utils";
import type { OverviewRevenueLink } from "@/mocks/overview";

export function TopRevenueLinks({ links }: { links: OverviewRevenueLink[] }) {
  return (
    <Card className="flex min-h-[404px] flex-col p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-montserrat text-base font-medium capitalize text-black">
          Top Revenue Links
        </p>
        <Link
          to="/payment-links"
          className="inline-flex items-center gap-1.5 font-montserrat text-sm font-medium capitalize text-[#606060] hover:text-black"
        >
          View All
          <Icon2Right className="h-2 w-3" />
        </Link>
      </div>
      <ul className="mt-5 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.id}>
            <Link
              to="/payment-links"
              className="flex h-14 items-center justify-between gap-3 rounded-[12px] bg-[#f6f6f6] px-3"
            >
              <span className="min-w-0 truncate font-montserrat text-sm font-medium text-black">
                {link.name}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-montserrat text-sm font-medium text-black">
                  {formatAmount(link.amount, { maxDecimals: 2, padDecimals: true })}
                </span>
                <IconChevron className="h-2.5 w-1 text-[#9fa7ba]" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
