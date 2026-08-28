import { IconDelete } from "@/components/icons/delete";
import { IconFlask } from "@/components/icons/flask";
import { IconResetPassword } from "@/components/icons/reset-password";
import { Card } from "@/components/ui/card/Card";
import { Switch } from "@/components/ui/switch/Switch";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { WebhookEndpoint } from "@/mocks/webhooks";
import { formatWebhookEvents } from "../utils";

export function WebhookList(props: {
  endpoints: WebhookEndpoint[];
  pendingId: string | null;
  onAdd: () => void;
  onToggle: (endpoint: WebhookEndpoint, enabled: boolean) => void;
  onRotate: (endpoint: WebhookEndpoint) => void;
  onSendTest: (endpoint: WebhookEndpoint) => void;
  onDelete: (endpoint: WebhookEndpoint) => void;
}) {
  const { endpoints, pendingId, onAdd, onToggle, onRotate, onSendTest, onDelete } = props;

  if (endpoints.length === 0) {
    return (
      <Card className="px-5 py-16">
        <p className="text-center font-montserrat text-sm font-medium text-[#aaa]">
          No webhook endpoints yet.{" "}
          <button type="button" className="cursor-pointer text-black" onClick={onAdd}>
            Add Endpoint
          </button>
          .
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {endpoints.map((endpoint) => (
        <WebhookRow
          key={endpoint.id}
          endpoint={endpoint}
          pending={pendingId === endpoint.id}
          onToggle={(enabled) => onToggle(endpoint, enabled)}
          onRotate={() => onRotate(endpoint)}
          onSendTest={() => onSendTest(endpoint)}
          onDelete={() => onDelete(endpoint)}
        />
      ))}
    </div>
  );
}

function WebhookRow(props: {
  endpoint: WebhookEndpoint;
  pending: boolean;
  onToggle: (enabled: boolean) => void;
  onRotate: () => void;
  onSendTest: () => void;
  onDelete: () => void;
}) {
  const { endpoint, pending, onToggle, onRotate, onSendTest, onDelete } = props;
  const switchLabel = endpoint.enabled ? "Disable webhook" : "Enable webhook";

  return (
    <Card className="flex flex-col gap-3 px-5 py-[18px] md:flex-row md:items-center md:gap-6">
      <p className="shrink-0 font-montserrat text-sm font-medium text-[#606060] md:w-[160px]">
        {formatWebhookEvents(endpoint.events)}
      </p>
      <p className="min-w-0 flex-1 truncate font-montserrat text-sm font-medium text-[#606060]">
        {endpoint.url}
      </p>
      <div className="flex shrink-0 items-center gap-4 self-end md:self-auto">
        <Tooltip content={switchLabel}>
          <Switch
            checked={endpoint.enabled}
            disabled={pending}
            onCheckedChange={onToggle}
            aria-label={switchLabel}
          />
        </Tooltip>
        <Tooltip content="Rotate Secret">
          <button
            type="button"
            disabled={pending}
            aria-label="Rotate Secret"
            className="cursor-pointer text-[#aaa] hover:text-black disabled:pointer-events-none disabled:opacity-30"
            onClick={onRotate}
          >
            <IconResetPassword className="h-[18px] w-[15px]" />
          </button>
        </Tooltip>
        <Tooltip content="Send Test Webhook">
          <button
            type="button"
            disabled={pending}
            aria-label="Send Test Webhook"
            className="cursor-pointer text-[#aaa] hover:text-black disabled:pointer-events-none disabled:opacity-30"
            onClick={onSendTest}
          >
            <IconFlask className="h-3.5 w-[13px]" />
          </button>
        </Tooltip>
        <Tooltip content="Delete">
          <button
            type="button"
            disabled={pending}
            aria-label="Delete"
            className="cursor-pointer text-[#aaa] hover:text-black disabled:pointer-events-none disabled:opacity-30"
            onClick={onDelete}
          >
            <IconDelete className="size-3.5" />
          </button>
        </Tooltip>
      </div>
    </Card>
  );
}
