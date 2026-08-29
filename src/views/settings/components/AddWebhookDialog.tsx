import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { WebhookForm } from "./WebhookForm";
import type { WebhookEventType } from "@/types/webhooks";

type AddWebhookDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (url: string, events: WebhookEventType[]) => Promise<void>;
};

export function AddWebhookDialog(props: AddWebhookDialogProps) {
  const { open, onClose, onAdd } = props;
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setFormKey((current) => current + 1);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add Endpoint"
      titleClassName="text-[18px]"
      cardClassName="w-[min(100%,600px)] px-4 md:px-[30px] py-4 md:py-7 md:w-[600px]"
    >
      <WebhookForm key={formKey} submitLabel="Add" onSubmit={onAdd} />
    </Dialog>
  );
}
