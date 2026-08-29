import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { pageTitleForPath } from "@/components/layout/config";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { DESKTOP_MEDIA_QUERY } from "@/components/ui/overlay/config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconMenu } from "@/components/icons";

export function AppLayout() {
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitleForPath(pathname);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-svh overflow-hidden bg-[#f6f6f6]">
      {isDesktop ? <AppSidebar /> : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 px-3 pt-[18px] pr-4 pb-2 md:px-10">
          <h1 className="min-w-0 flex-1 truncate font-montserrat text-[26px] font-semibold leading-normal text-black">
            {title}
          </h1>
          {isDesktop ? null : (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="font-montserrat text-sm font-medium text-[#606060]"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          )}
        </header>
        <main className="min-h-0 flex-1 overflow-auto px-3 py-4 md:px-10 md:py-5">
          <Outlet />
        </main>
        <footer className="flex shrink-0 justify-end px-3 py-2 md:px-10 md:py-3">
          <Link
            to="/terms"
            className="font-montserrat text-sm font-normal text-[#606060] hover:text-black"
          >
            Terms of Service
          </Link>
        </footer>
      </div>
      {isDesktop ? null : (
        <Drawer
          open={sidebarOpen}
          onClose={closeSidebar}
          side={DRAWER_SIDE.Right}
          title=""
          cardClassName="h-full w-[220px] gap-0 rounded-r-none p-0 [&>div:first-child]:hidden"
          contentClassName="overflow-x-hidden"
        >
          <AppSidebar onNavigate={closeSidebar} />
        </Drawer>
      )}
    </div>
  );
}
