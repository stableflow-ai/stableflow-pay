import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import useToast from "@/hooks/use-toast";
import type { WebhookEventType } from "@/mocks/webhooks";
import { WEBHOOK_EVENT_OPTIONS } from "../config";
import { webhooksError } from "../utils";

type AddWebhookDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (url: string, events: WebhookEventType[]) => Promise<string>;
};

export function AddWebhookDialog(props: AddWebhookDialogProps) {
  const { open, onClose, onAdd } = props;
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setEvents([]);
    setSubmitting(false);
  }, [open]);

  const toggleEvent = (value: WebhookEventType) => {
    setEvents((current) =>
      current.includes(value) ? current.filter((event) => event !== value) : [...current, value],
    );
  };

  const submit = async () => {
    const nextUrl = url.trim();
    if (!nextUrl) {
      toast.fail({ title: "Endpoint URL is required" });
      return;
    }
    if (events.length === 0) {
      toast.fail({ title: "Select at least one event" });
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(nextUrl, events);
    } catch (error) {
      toast.fail({ title: webhooksError(error, "Could not add webhook") });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Webhook Endpoint" closeOnMaskClick={!submitting}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="webhook-endpoint-url" className="font-montserrat text-sm font-medium text-[#606060]">
              Endpoint URL
            </label>
            <input
              id="webhook-endpoint-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="http://your-server.com/webhook"
              className="h-9 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30 focus:border-[#c8c8c8]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="font-montserrat text-sm font-medium text-[#606060]">Events to Listen</p>
            <div className="flex flex-col gap-2.5">
              {WEBHOOK_EVENT_OPTIONS.map((option) => {
                const selected = events.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[6px] border border-[#e3e3e3] bg-white px-3"
                  >
                    <Checkbox
                      checked={selected}
                      aria-label={option.label}
                      onCheckedChange={() => toggleEvent(option.value)}
                    />
                    <span className="font-montserrat text-sm font-medium text-black">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <Button size={BUTTON_SIZE.Lg} className="w-full" loading={submitting} onClick={() => void submit()}>
          Add
        </Button>
      </div>
    </Dialog>
  );
}
