import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { useWebhooks } from "@/hooks/use-webhooks";
import useToast from "@/hooks/use-toast";
import { createWebhookSecret, type WebhookEndpoint, type WebhookEventType } from "@/mocks/webhooks";
import { AddWebhookDialog } from "./components/AddWebhookDialog";
import { DeleteWebhookDialog } from "./components/DeleteWebhookDialog";
import { EventLogsTable } from "./components/EventLogsTable";
import { SendTestDialog } from "./components/SendTestDialog";
import { SignatureVerification } from "./components/SignatureVerification";
import { SigningSecretDialog } from "./components/SigningSecretDialog";
import { WebhookList } from "./components/WebhookList";
import { webhooksError } from "./utils";

export function WebhooksView() {
  const fixtures = useWebhooks();
  const toast = useToast();
  const [endpoints, setEndpoints] = useState(fixtures.endpoints);
  const [eventLogs] = useState(fixtures.eventLogs);
  const [addOpen, setAddOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [testing, setTesting] = useState<WebhookEndpoint | null>(null);
  const [deleting, setDeleting] = useState<WebhookEndpoint | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const openAdd = () => setAddOpen(true);

  const addEndpoint = async (url: string, events: WebhookEventType[]) => {
    const nextSecret = createWebhookSecret();
    const next: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url,
      events,
      enabled: true,
    };
    setEndpoints((current) => [next, ...current]);
    setAddOpen(false);
    setSecret(nextSecret);
    return nextSecret;
  };

  const toggleEnabled = async (endpoint: WebhookEndpoint, enabled: boolean) => {
    setPendingId(endpoint.id);
    try {
      await Promise.resolve();
      setEndpoints((current) =>
        current.map((row) => (row.id === endpoint.id ? { ...row, enabled } : row)),
      );
    } catch (error) {
      toast.fail({ title: webhooksError(error, "Could not update webhook") });
    } finally {
      setPendingId(null);
    }
  };

  const rotateSecret = async (endpoint: WebhookEndpoint) => {
    setPendingId(endpoint.id);
    try {
      const nextSecret = await Promise.resolve(createWebhookSecret());
      setSecret(nextSecret);
    } catch (error) {
      toast.fail({ title: webhooksError(error, "Could not rotate secret") });
    } finally {
      setPendingId(null);
    }
  };

  const sendTest = async () => {
    await Promise.resolve();
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setEndpoints((current) => current.filter((row) => row.id !== deleting.id));
    if (testing?.id === deleting.id) setTesting(null);
    setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <p className="min-w-0 font-montserrat text-sm font-medium text-[#606060]">
          Configure endpoints to receive real-time payment notifications
        </p>
        <Button
          size={BUTTON_SIZE.Md}
          className="h-[46px] w-full shrink-0 rounded-[12px] px-5 text-sm md:w-auto"
          onClick={openAdd}
        >
          Add Endpoint
        </Button>
      </div>

      <WebhookList
        endpoints={endpoints}
        pendingId={pendingId}
        onAdd={openAdd}
        onToggle={(endpoint, enabled) => {
          void toggleEnabled(endpoint, enabled);
        }}
        onRotate={(endpoint) => {
          void rotateSecret(endpoint);
        }}
        onSendTest={setTesting}
        onDelete={setDeleting}
      />

      <EventLogsTable logs={eventLogs} />
      <SignatureVerification />

      <AddWebhookDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addEndpoint}
      />
      <SigningSecretDialog
        open={Boolean(secret)}
        secret={secret}
        onClose={() => setSecret(null)}
      />
      <SendTestDialog
        open={Boolean(testing)}
        onClose={() => setTesting(null)}
        onSend={sendTest}
      />
      <DeleteWebhookDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        endpoint={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default WebhooksView;
