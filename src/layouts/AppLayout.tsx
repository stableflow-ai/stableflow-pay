import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNav, AppSidebar } from "@/components/layout/AppSidebar";
import { pageTitleForPath } from "@/components/layout/config";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { IconMenu } from "@/components/icons";

export function AppLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = pageTitleForPath(pathname);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#f6f6f6] lg:flex-row">
      <div className="flex shrink-0 items-center gap-3 border-b border-black/10 px-2 py-3 md:px-5 lg:hidden">
        <a href="/" className="shrink-0">
          <img src="/logo.svg" alt="PAY. Stableflow" className="h-[30px] w-auto" />
        </a>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="min-w-0">
            <AccountMenu />
          </div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            className="shrink-0 text-black"
          >
            <IconMenu className="h-6 w-6" />
          </button>
        </div>
      </div>
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative flex h-[65px] shrink-0 items-center border-b border-black/10 px-2 md:px-5 lg:px-[26px]">
          <h1 className="min-w-0 truncate font-montserrat text-[20px] font-medium text-black">
            {title}
          </h1>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-2 py-5 md:px-5 lg:px-[26px]">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <AppFooter />
      </div>
      <Drawer open={menuOpen} onClose={closeMenu} side={DRAWER_SIDE.Top} title="" ariaLabel="Main navigation">
        <AppNav onNavigate={closeMenu} />
      </Drawer>
    </div>
  );
}
