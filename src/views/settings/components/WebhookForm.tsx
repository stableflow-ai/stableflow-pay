import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import useToast from "@/hooks/use-toast";
import type { WebhookEventType } from "@/types/webhooks";
import { WEBHOOK_EVENT_OPTIONS, WEBHOOK_URL_MAX_LENGTH } from "../config";
import { settingsError } from "../utils";

export function WebhookForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string;
  onSubmit: (url: string, events: WebhookEventType[]) => Promise<void>;
}) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
      await onSubmit(nextUrl, events);
    } catch (error) {
      toast.fail({ title: settingsError(error, "Could not add webhook") });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label htmlFor="webhook-endpoint-url" className="font-montserrat text-sm font-medium text-[#606060]">
            Webhooks
          </label>
          <input
            id="webhook-endpoint-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://your-server.com/webhook"
            maxLength={WEBHOOK_URL_MAX_LENGTH}
            className="mt-2.5 h-10 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="font-montserrat text-sm font-medium text-[#606060]">Events to Listen</p>
          <div className="flex flex-col gap-2.5">
            {WEBHOOK_EVENT_OPTIONS.map((option) => {
              const selected = events.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex h-10 cursor-pointer items-center gap-2.5 rounded-[6px] border border-[#e3e3e3] bg-white px-3"
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
        {submitLabel}
      </Button>
    </div>
  );
}
