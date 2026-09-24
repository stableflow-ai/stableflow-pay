import type { ReactNode } from "react";
import { Drawer } from "@stableflow/pay-ui/drawer";
import { DRAWER_SIDE } from "@stableflow/pay-ui/drawer";
import { DESKTOP_MEDIA_QUERY } from "@stableflow/pay-ui/overlay";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CreatePaymentLinkDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side={isDesktop ? DRAWER_SIDE.Right : DRAWER_SIDE.Bottom}
      title="Create Payment Link"
      titleClassName="text-[18px]"
      panelClassName={isDesktop ? "w-[min(100%,600px)]" : undefined}
      cardClassName={
        isDesktop
          ? "h-full w-full md:rounded-r-none px-[30px] py-7"
          : "w-full max-h-[90vh] rounded-b-none px-4 py-4"
      }
    >
      {children}
    </Drawer>
  );
}

export default CreatePaymentLinkDrawer;
