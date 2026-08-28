import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { IconLogout } from "@/components/icons/logout";
import { IconMenu } from "@/components/icons/menu";
import { IconResetPassword } from "@/components/icons/reset-password";
import { IconSettings } from "@/components/icons/settings";
import {
  FLOATING_ALIGN,
  FLOATING_SIDE,
  useFloatingPosition,
} from "@/components/ui/overlay/use-floating-position";
import { useAuthStore } from "@/stores/auth";
import { ResetPasswordDialog } from "@/views/auth/ResetPasswordDialog";
import { RESET_PASSWORD_VARIANT } from "@/views/auth/config";
import { SIDEBAR_AVATAR_SRC } from "./config";

export function AccountMenu({ onOpenSettings }: { onOpenSettings: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const panelStyle = useFloatingPosition({
    open,
    triggerRef,
    panelRef,
    side: FLOATING_SIDE.Top,
    align: FLOATING_ALIGN.Start,
    offset: 8,
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAndLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const openResetPassword = () => {
    setOpen(false);
    setResetOpen(true);
  };

  const openSettings = () => {
    setOpen(false);
    onOpenSettings();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex h-[42px] w-[148px] items-center gap-1.5 rounded-[25px] border border-black/20 bg-white pr-3 pl-1.5 shadow-[0_0_6px_rgba(0,0,0,0.06)]">
          <img
            src={SIDEBAR_AVATAR_SRC}
            alt=""
            className="size-[30px] shrink-0 rounded-full object-cover"
          />
          <p className="min-w-0 truncate font-montserrat text-sm font-medium capitalize text-black">
            {user?.name}
          </p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex size-5 shrink-0 items-center justify-center text-[#aaa]"
        >
          <IconMenu />
        </button>
      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              role="menu"
              style={panelStyle}
              className="z-1200 w-[249px] overflow-hidden rounded-[12px] border border-[#E0E0E0] bg-[#fdfdfd] shadow-[0_0_20px_rgba(0,0,0,0.06)]"
            >
              <div className="flex h-[70px] items-center gap-2 px-4">
                <img
                  src={SIDEBAR_AVATAR_SRC}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-montserrat text-base font-medium text-black">
                    {user?.name}
                  </p>
                  <p className="truncate font-montserrat text-sm font-normal text-black">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="h-px bg-[#E0E0E0]" />
              <div className="py-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={openResetPassword}
                  className="flex h-10 w-full items-center gap-2.5 px-[19px] font-montserrat text-sm font-medium text-[#606060] duration-150 hover:text-black"
                >
                  <IconResetPassword className="shrink-0" />
                  Change Password
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openSettings}
                  className="flex h-10 w-full items-center gap-2.5 px-[19px] font-montserrat text-sm font-medium text-[#606060] duration-150 hover:text-black"
                >
                  <IconSettings className="size-3.5 shrink-0" />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={closeAndLogout}
                  className="flex h-10 w-full items-center gap-2.5 px-[19px] font-montserrat text-sm font-medium text-[#606060] duration-150 hover:text-danger"
                >
                  <IconLogout className="shrink-0" />
                  Log out
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
      <ResetPasswordDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        variant={RESET_PASSWORD_VARIANT.Authed}
      />
    </>
  );
}
