import type { ComponentType } from "react";
import { IconCode } from "@/components/icons/code";
import { IconKey } from "@/components/icons/key";
import { IconLink } from "@/components/icons/link";
import { IconOverview } from "@/components/icons/overview";
import { IconRecords, IconRecords2 } from "@/components/icons/records";
import { IconSettings } from "@/components/icons/settings";
import type { IconProps } from "@/components/icons/types";

export const SIDEBAR_WIDTH_PX = 220;
export const SIDEBAR_NAV_ACTIVE_COLOR = "#3F8AFB";
export const SIDEBAR_AVATAR_SRC = "/layout/avatar.svg";

export type SidebarIcon = ComponentType<IconProps>;

export type SidebarNavItem = {
  label: string;
  to: string;
  icon: SidebarIcon;
  end?: boolean;
};

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: "Overview", to: "/", icon: IconOverview, end: true },
  { label: "Payment Links", to: "/payment-links", icon: IconLink },
  { label: "API Keys", to: "/api-keys", icon: IconKey },
  { label: "Reports", to: "/reports", icon: IconRecords2 },
];

export const SIDEBAR_FOOTER_ITEMS: readonly SidebarNavItem[] = [
  { label: "Settings", to: "/settings", icon: IconSettings },
  { label: "Developer Docs", to: "/docs", icon: IconCode },
  { label: "Terms of Service", to: "/terms", icon: IconRecords },
];

export const PLACEHOLDER_ROUTES = ["/terms"] as const;

export function pageTitleForPath(pathname: string): string {
  const item = [...SIDEBAR_NAV_ITEMS, ...SIDEBAR_FOOTER_ITEMS].find((entry) => {
    if (entry.end || entry.to === "/") return pathname === entry.to;
    return pathname === entry.to || pathname.startsWith(`${entry.to}/`);
  });
  return item?.label ?? "Overview";
}
