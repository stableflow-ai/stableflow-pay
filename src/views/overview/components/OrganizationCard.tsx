import { Link } from "react-router-dom";
import { IconSettings } from "@/components/icons/settings";
import { Card } from "@/components/ui/card/Card";
import type { OverviewOrganization } from "@/mocks/overview";
import { OVERVIEW_LINK_CLASS, OVERVIEW_MUTED_LABEL_CLASS } from "../config";

export function OrganizationCard({
  organization,
  onOpenSettings,
}: {
  organization: OverviewOrganization;
  onOpenSettings: () => void;
}) {
  return (
    <Card className="relative p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-[20px]">
          <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#d9d9d9]">
            <span className="font-montserrat text-lg font-semibold text-white">
              {organization.initials}
            </span>
          </div>
          <p className="truncate font-montserrat text-xl font-medium capitalize text-black">
            {organization.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex shrink-0 items-center gap-1.5 font-montserrat text-sm font-medium capitalize text-[#606060] hover:text-black"
        >
          <IconSettings className="size-3.5" />
          Setting
        </button>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <p className={OVERVIEW_MUTED_LABEL_CLASS}>Organization ID</p>
          <p className="mt-2 break-all font-montserrat text-base font-medium text-black">
            {organization.organizationId}
          </p>
          <p className={`${OVERVIEW_MUTED_LABEL_CLASS} mt-6`}>Slug</p>
          <p className="mt-1.5 font-montserrat text-base font-medium text-black">
            {organization.slug}
          </p>
        </div>
        <div>
          <p className={OVERVIEW_MUTED_LABEL_CLASS}>API Keys</p>
          <Link to="/api-keys" className={`${OVERVIEW_LINK_CLASS} mt-2 inline-block`}>
            Manage API Keys →
          </Link>
          <p className={`${OVERVIEW_MUTED_LABEL_CLASS} mt-6`}>Organization Settings</p>
          <button
            type="button"
            onClick={onOpenSettings}
            className={`${OVERVIEW_LINK_CLASS} mt-1.5`}
          >
            Update Settings →
          </button>
        </div>
      </div>
    </Card>
  );
}
