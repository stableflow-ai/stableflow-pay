import type { ComponentType } from "react";
import { IconCode } from "@/components/icons/code";
import { IconKey } from "@/components/icons/key";
import { IconLink } from "@/components/icons/link";
import { IconOverview } from "@/components/icons/overview";
import { IconRecords, IconRecords2 } from "@/components/icons/records";
import { IconSupport } from "@/components/icons/support";
import type { IconProps } from "@/components/icons/types";
import { IconWebhooks } from "@/components/icons/webhooks";
import { isCreatePaymentLinkPath } from "@/views/payment-links/config";

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
  { label: "Webhooks", to: "/webhooks", icon: IconWebhooks },
  { label: "Reports", to: "/reports", icon: IconRecords2 },
];

export const SIDEBAR_FOOTER_ITEMS: readonly SidebarNavItem[] = [
  { label: "Support", to: "/support", icon: IconSupport },
  { label: "Terms of Service", to: "/terms", icon: IconRecords },
  { label: "Developer Docs", to: "/docs", icon: IconCode },
];

export const PLACEHOLDER_ROUTES = [
  "/support",
  "/terms",
  "/docs",
] as const;

export function pageTitleForPath(pathname: string): string {
  if (isCreatePaymentLinkPath(pathname)) return "Create Payment Link";
  const item = [...SIDEBAR_NAV_ITEMS, ...SIDEBAR_FOOTER_ITEMS].find((entry) => {
    if (entry.end || entry.to === "/") return pathname === entry.to;
    return pathname === entry.to || pathname.startsWith(`${entry.to}/`);
  });
  return item?.label ?? "Overview";
}
