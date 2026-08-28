import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { Card } from "@/components/ui/card/Card";
import { CREATE_PAYMENT_LINK_PATH } from "../config";

export function LinksStatsCard({
  total,
  active,
  inactive,
}: {
  total: number;
  active: number;
  inactive: number;
}) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:px-7 md:py-7">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 md:min-w-0 md:flex-1">
        <StatBlock label="Total Links" value={total} />
        <StatBlock label="Active Links" value={active} />
        <StatBlock label="Inactive Links" value={inactive} />
      </div>
      <Button
        size={BUTTON_SIZE.Md}
        className="h-[46px] w-full shrink-0 rounded-[12px] px-5 text-sm md:w-auto"
        onClick={() => navigate(CREATE_PAYMENT_LINK_PATH)}
      >
        Create Payment Link
      </Button>
    </Card>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-montserrat text-base font-medium capitalize text-black">{label}</p>
      <p className="mt-2 font-montserrat text-[26px] font-medium capitalize text-black">{value}</p>
    </div>
  );
}
