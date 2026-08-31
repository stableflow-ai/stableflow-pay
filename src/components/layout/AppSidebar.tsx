import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./AccountMenu";
import {
  SIDEBAR_FOOTER_ITEMS,
  SIDEBAR_NAV_ACTIVE_COLOR,
  SIDEBAR_NAV_ITEMS,
  type SidebarNavItem,
} from "./config";

export function AppSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <aside className="flex h-full min-h-0 w-[220px] shrink-0 flex-col overflow-y-auto border-r border-black/10">
      <a href="/" className="block px-[27px] pt-[21px]">
        <img src="/logo.svg" alt="PAY. Stableflow" className="h-[29px] w-[95px]" />
      </a>
      <nav className="mt-8 flex flex-col items-center gap-1.5 px-2.5">
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-1.5 px-2.5 pb-3">
        {SIDEBAR_FOOTER_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} muted />
        ))}
      </div>
      <div className="px-[23px] pb-[23px]">
        <AccountMenu />
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  onNavigate,
  muted = false,
}: {
  item: SidebarNavItem;
  onNavigate?: () => void;
  muted?: boolean;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex h-11 w-[200px] items-center gap-2.5 rounded-[8px] px-3 font-montserrat text-sm leading-normal transition-colors",
          muted ? "font-normal" : "font-medium",
          isActive
            ? "border border-white bg-[#fdfdfd] text-black shadow-[0_0_20px_rgba(0,0,0,0.06)]"
            : "text-[#606060] hover:bg-black/5",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className="size-3.5 shrink-0"
            style={{ color: isActive ? SIDEBAR_NAV_ACTIVE_COLOR : undefined }}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}
