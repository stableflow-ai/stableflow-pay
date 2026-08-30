import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import type { PayWebhook } from "@/types/webhooks";

export function RotateWebhookSecretDialog(props: {
  open: boolean;
  onClose: () => void;
  endpoint: PayWebhook | null;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const { open, onClose, endpoint, onConfirm, loading = false } = props;

  return (
    <Dialog open={open} onClose={onClose} title="Rotate signing secret?">
      <p className="break-all font-montserrat text-sm font-medium text-[#606060]">
        {endpoint
          ? `Rotate the signing secret for "${endpoint.url}"? The previous secret will stop working immediately.`
          : "The previous secret will stop working immediately."}
      </p>
      <div className="mt-5 flex gap-3">
        <Button
          variant={BUTTON_VARIANT.Primary}
          size={BUTTON_SIZE.Md}
          className="flex-1 bg-black"
          loading={loading}
          onClick={onConfirm}
        >
          Rotate
        </Button>
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Md}
          className="flex-1"
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
