import { IconCopy } from "@/components/icons/copy";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import useToast from "@/hooks/use-toast";
import { WEBHOOK_SIGNING_SECRET_SUBTITLE } from "../config";

type SigningSecretDialogProps = {
  open: boolean;
  secret: string | null;
  onClose: () => void;
};

export function SigningSecretDialog(props: SigningSecretDialogProps) {
  const { open, secret, onClose } = props;
  const toast = useToast();
  const value = secret ?? "";

  const copySecret = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Webhook Signing Secret">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-montserrat text-sm font-medium text-[#606060]">
            {WEBHOOK_SIGNING_SECRET_SUBTITLE}
          </p>
          <div className="relative">
            <input
              readOnly
              value={value}
              aria-label="Webhook signing secret"
              className="h-9 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] pr-10 pl-3 font-montserrat text-sm font-medium text-black outline-none"
            />
            <button
              type="button"
              aria-label="Copy"
              className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-[#909090] hover:text-black"
              onClick={() => {
                void copySecret();
              }}
            >
              <IconCopy className="size-3" />
            </button>
          </div>
        </div>
        <Button size={BUTTON_SIZE.Lg} className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </Dialog>
  );
}
