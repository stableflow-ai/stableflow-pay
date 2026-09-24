import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BrandGlow, BrandMark } from "./BrandMark";
import { AccountMenu } from "./AccountMenu";
import { SIDEBAR_NAV_ITEMS, type SidebarNavItem } from "./config";

function navLinkClass(active: boolean) {
  return cn(
    "inline-flex h-10 w-full shrink-0 items-center gap-2.5 rounded-[8px] px-3.5 font-montserrat text-sm font-medium whitespace-nowrap duration-150",
    "hover:bg-[#EEE]",
    active ? "bg-white text-[#06f] shadow-[0_0_20px_0_rgba(0,0,0,0.06)]" : "text-[#606060]",
  );
}

function SidebarLink({
  item,
  onNavigate,
}: {
  item: SidebarNavItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => navLinkClass(isActive)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

export function AppNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {SIDEBAR_NAV_ITEMS.map((item) => (
        <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden shrink-0 flex-col lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-[220px] lg:overflow-hidden lg:border-r lg:border-black/10">
      <div className="relative shrink-0 overflow-hidden px-[13px] pt-4 pb-4">
        <BrandGlow />
        <a href="/" className="relative inline-flex">
          <BrandMark />
        </a>
        <div className="mt-2.5">
          <AccountMenu />
        </div>
      </div>
      <div className="h-px w-full shrink-0 bg-black/10" />
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-5">
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}
