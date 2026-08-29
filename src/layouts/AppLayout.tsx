import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { pageTitleForPath } from "@/components/layout/config";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { DESKTOP_MEDIA_QUERY } from "@/components/ui/overlay/config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconChevron, IconMenu } from "@/components/icons";
import {
  PAYMENT_LINKS_PATH,
  isCreatePaymentLinkPath,
} from "@/views/payment-links/config";

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitleForPath(pathname);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-svh overflow-hidden bg-[#f6f6f6]">
      {isDesktop ? <AppSidebar /> : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 px-3 pt-[18px] pr-4 pb-2 md:px-10">
          {isCreatePaymentLinkPath(pathname) ? (
            <button
              type="button"
              onClick={() => navigate(PAYMENT_LINKS_PATH)}
              className="inline-flex min-w-0 flex-1 items-center gap-2 font-montserrat text-sm font-medium text-black"
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_20px_0_rgba(0,0,0,0.06)]">
                <IconChevron className="size-3 rotate-180 text-black" />
              </span>
              back
            </button>
          ) : (
            <h1 className="min-w-0 flex-1 truncate font-montserrat text-[26px] font-semibold leading-normal text-black">
              {title}
            </h1>
          )}
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
