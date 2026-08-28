import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import type { WebhookEndpoint } from "@/mocks/webhooks";

export function DeleteWebhookDialog(props: {
  open: boolean;
  onClose: () => void;
  endpoint: WebhookEndpoint | null;
  onConfirm: () => void;
}) {
  const { open, onClose, endpoint, onConfirm } = props;

  return (
    <Dialog open={open} onClose={onClose} title="Delete webhook?">
      <p className="break-all font-montserrat text-sm font-medium text-[#606060]">
        {endpoint
          ? `Delete "${endpoint.url}"? This cannot be undone.`
          : "This cannot be undone."}
      </p>
      <div className="mt-5 flex gap-3">
        <Button
          variant={BUTTON_VARIANT.Danger}
          size={BUTTON_SIZE.Md}
          className="flex-1"
          onClick={onConfirm}
        >
          Delete
        </Button>
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Md}
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
