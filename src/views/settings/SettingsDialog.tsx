import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { useOverviewDashboard } from "@/hooks/use-overview-dashboard";
import useToast from "@/hooks/use-toast";
import { LOGO_URL_MAX_LENGTH, ORGANIZATION_NAME_MAX_LENGTH } from "./config";

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const dashboard = useOverviewDashboard();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(dashboard.organization.name);
    setLogoUrl(dashboard.organization.logoUrl ?? "");
  }, [dashboard.organization.logoUrl, dashboard.organization.name, open]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    toast.success({ title: "Settings saved" });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Setting"
      cardClassName="w-[min(100%,500px)] px-[30px] py-7"
    >
      <form onSubmit={save}>
        <label
          htmlFor="organization-name"
          className="font-montserrat text-sm font-medium text-[#606060]"
        >
          Organization Name
        </label>
        <input
          id="organization-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your organization name"
          maxLength={ORGANIZATION_NAME_MAX_LENGTH}
          className="mt-2.5 h-9 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30"
        />
        <label
          htmlFor="logo-url"
          className="mt-5 block font-montserrat text-sm font-medium text-[#606060]"
        >
          Logo URL
        </label>
        <input
          id="logo-url"
          type="text"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          placeholder="Your organization logo url"
          maxLength={LOGO_URL_MAX_LENGTH}
          className="mt-2.5 h-9 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30"
        />
        <Button type="submit" size={BUTTON_SIZE.Lg} className="mt-8 w-full">
          Save
        </Button>
      </form>
    </Dialog>
  );
}
