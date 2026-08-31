import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Card } from "@/components/ui/card/Card";
import type { PayWebhook } from "@/types/webhooks";
import { RECIPIENT_ADDRESS_MAX_LENGTH } from "../config";
import { WebhookList } from "./WebhookList";

export function DeveloperSection(props: {
  recipientAddress: string;
  onRecipientAddressChange: (value: string) => void;
  endpoints: PayWebhook[];
  endpointsLoading?: boolean;
  pendingId: string | null;
  onAdd: () => void;
  onToggle: (endpoint: PayWebhook, enabled: boolean) => void;
  onRotate: (endpoint: PayWebhook) => void;
  onSendTest: (endpoint: PayWebhook) => void;
  onDelete: (endpoint: PayWebhook) => void;
}) {
  const {
    recipientAddress,
    onRecipientAddressChange,
    endpoints,
    endpointsLoading,
    pendingId,
    onAdd,
    onToggle,
    onRotate,
    onSendTest,
    onDelete,
  } = props;

  return (
    <Card className="flex flex-col gap-6 px-4 py-4 md:px-7 md:py-6">
      <div>
        <h2 className="font-montserrat text-xl font-medium capitalize text-black">Developer</h2>
        <p className="mt-2 font-montserrat text-sm font-normal text-[#909090]">
          Configure the defaults used when creating payment links.
        </p>
      </div>
      {/* <div>
        <label htmlFor="recipient-address" className="font-montserrat text-sm font-medium text-[#606060]">
          Recipient Address
        </label>
        <input
          id="recipient-address"
          type="text"
          value={recipientAddress}
          onChange={(event) => onRecipientAddressChange(event.target.value)}
          placeholder="Input your recipient address"
          maxLength={RECIPIENT_ADDRESS_MAX_LENGTH}
          className="mt-2.5 h-10 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30"
        />
      </div> */}
      <div className="flex flex-col gap-4">
        <p className="font-montserrat text-sm font-medium text-[#606060]">Webhooks</p>
        <WebhookList
          endpoints={endpoints}
          endpointsLoading={endpointsLoading}
          pendingId={pendingId}
          onAdd={onAdd}
          onToggle={onToggle}
          onRotate={onRotate}
          onSendTest={onSendTest}
          onDelete={onDelete}
        />
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Md}
          className="h-10 w-full rounded-[20px] border-[#e3e3e3] text-sm text-black shadow-none md:w-[170px]"
          onClick={onAdd}
        >
          + Add Endpoint
        </Button>
      </div>
    </Card>
  );
}
