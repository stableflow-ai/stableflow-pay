import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import useToast from "@/hooks/use-toast";
import {
  TEST_PAYLOADS,
  WEBHOOK_EVENT_TYPE,
  type WebhookEventType,
} from "@/mocks/webhooks";
import { WEBHOOK_EVENT_OPTIONS } from "../config";
import { stringifyPayload, webhooksError } from "../utils";

type SendTestDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (eventType: WebhookEventType, payload: Record<string, unknown>) => Promise<void>;
};

export function SendTestDialog(props: SendTestDialogProps) {
  const { open, onClose, onSend } = props;
  const toast = useToast();
  const [eventType, setEventType] = useState<WebhookEventType>(WEBHOOK_EVENT_TYPE.PaymentSuccess);
  const [payloadText, setPayloadText] = useState(stringifyPayload(TEST_PAYLOADS[WEBHOOK_EVENT_TYPE.PaymentSuccess]));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEventType(WEBHOOK_EVENT_TYPE.PaymentSuccess);
    setPayloadText(stringifyPayload(TEST_PAYLOADS[WEBHOOK_EVENT_TYPE.PaymentSuccess]));
    setSubmitting(false);
  }, [open]);

  const changeEventType = (value: string) => {
    const next = value as WebhookEventType;
    setEventType(next);
    setPayloadText(stringifyPayload(TEST_PAYLOADS[next]));
  };

  const submit = async () => {
    let payload: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(payloadText);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        toast.fail({ title: "Payload must be a JSON object" });
        return;
      }
      payload = parsed as Record<string, unknown>;
    } catch (error) {
      toast.fail({ title: webhooksError(error, "Invalid JSON") });
      return;
    }
    setSubmitting(true);
    try {
      await onSend(eventType, payload);
      toast.success({ title: "Test webhook sent successfully" });
      onClose();
    } catch (error) {
      toast.fail({ title: webhooksError(error, "Could not send test webhook") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Send Test Webhook" closeOnMaskClick={!submitting}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="font-montserrat text-sm font-medium text-[#606060]">Event Type</p>
            <Dropdown
              className="w-full"
              triggerClassName="w-full"
              value={eventType}
              onChange={changeEventType}
              options={WEBHOOK_EVENT_OPTIONS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="webhook-test-payload" className="font-montserrat text-sm font-medium text-[#606060]">
              Payload (JSON)
            </label>
            <textarea
              id="webhook-test-payload"
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
              spellCheck={false}
              className="min-h-[196px] w-full resize-y rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 py-2 font-montserrat text-sm font-medium text-black outline-none focus:border-[#c8c8c8]"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant={BUTTON_VARIANT.Normal}
            size={BUTTON_SIZE.Md}
            className="flex-1"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size={BUTTON_SIZE.Md}
            className="flex-1"
            loading={submitting}
            onClick={() => void submit()}
          >
            Send Test
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
