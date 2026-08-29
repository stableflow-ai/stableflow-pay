import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { DESKTOP_MEDIA_QUERY } from "@/components/ui/overlay/config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { GUIDE_PATH } from "./config";

export function GuideDrawer({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  return (
    <Drawer
      open
      onClose={() => navigate(GUIDE_PATH)}
      side={isDesktop ? DRAWER_SIDE.Right : DRAWER_SIDE.Bottom}
      mask={false}
      closeOnMaskClick={false}
      title={title}
      titleClassName="text-[26px] font-semibold"
      panelClassName={isDesktop ? "w-[min(100%,600px)]" : undefined}
      cardClassName={
        isDesktop
          ? "h-full w-full rounded-r-none px-[30px] py-7"
          : "w-full max-h-[90vh] rounded-b-none px-4 py-4"
      }
    >
      {children}
    </Drawer>
  );
}

export default GuideDrawer;
