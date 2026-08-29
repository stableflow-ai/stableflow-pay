import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import type { PayApiKey } from "@/types/api-keys";

export function DeleteApiKeyDialog(props: {
  open: boolean;
  onClose: () => void;
  apiKey: PayApiKey | null;
  onConfirm: () => void;
}) {
  const { open, onClose, apiKey, onConfirm } = props;

  return (
    <Dialog open={open} onClose={onClose} title="Delete API key?">
      <p className="font-montserrat text-sm font-medium text-[#606060]">
        {apiKey
          ? `Delete "${apiKey.name}" from your API keys? This cannot be undone.`
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
