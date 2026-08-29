import { type FormEvent, useEffect, useState } from "react";
import { useOrganizationQuery, useUpdateOrganizationMutation } from "@/hooks/use-organization-api";
import { useWebhookMutations, useWebhooksQuery } from "@/hooks/use-webhooks-api";
import useToast from "@/hooks/use-toast";
import type { PayWebhook, WebhookEventType } from "@/types/webhooks";
import { AddWebhookDialog } from "./components/AddWebhookDialog";
import { DeleteWebhookDialog } from "./components/DeleteWebhookDialog";
import { DeveloperSection } from "./components/DeveloperSection";
import { ProfileSection } from "./components/ProfileSection";
import { SendTestDialog } from "./components/SendTestDialog";
import { SigningSecretDialog } from "./components/SigningSecretDialog";
import { settingsError } from "./utils";

export function SettingsView() {
  const toast = useToast();
  const organizationQuery = useOrganizationQuery();
  const updateOrganization = useUpdateOrganizationMutation();
  const webhooksQuery = useWebhooksQuery();
  const {
    createMutation,
    deleteMutation,
    enableMutation,
    disableMutation,
    rotateSecretMutation,
  } = useWebhookMutations();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [testing, setTesting] = useState<PayWebhook | null>(null);
  const [deleting, setDeleting] = useState<PayWebhook | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const organization = organizationQuery.data;
  const endpoints = webhooksQuery.data ?? [];

  useEffect(() => {
    if (!organization) return;
    setName(organization.name);
    setSlug(organization.slug);
    setLogo(organization.logo);
  }, [organization]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    void updateOrganization
      .mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        logo: logo.trim(),
      })
      .then(() => {
        toast.success({ title: "Settings saved" });
      })
      .catch((error) => {
        toast.fail({ title: settingsError(error, "Could not save settings") });
      });
  };

  const addEndpoint = async (url: string, events: WebhookEventType[]) => {
    const created = await createMutation.mutateAsync({ url, events });
    setAddOpen(false);
    setSecret(created.secret);
  };

  const toggleEnabled = async (endpoint: PayWebhook, enabled: boolean) => {
    setPendingId(endpoint.webhookId);
    try {
      if (enabled) {
        await enableMutation.mutateAsync(endpoint.webhookId);
      } else {
        await disableMutation.mutateAsync(endpoint.webhookId);
      }
    } catch (error) {
      toast.fail({ title: settingsError(error, "Could not update webhook") });
    } finally {
      setPendingId(null);
    }
  };

  const rotateSecret = async (endpoint: PayWebhook) => {
    setPendingId(endpoint.webhookId);
    try {
      const next = await rotateSecretMutation.mutateAsync(endpoint.webhookId);
      setSecret(next.secret);
    } catch (error) {
      toast.fail({ title: settingsError(error, "Could not rotate secret") });
    } finally {
      setPendingId(null);
    }
  };

  const sendTest = async () => {
    await Promise.resolve();
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const webhookId = deleting.webhookId;
    void deleteMutation
      .mutateAsync(webhookId)
      .then(() => {
        if (testing?.webhookId === webhookId) setTesting(null);
        setDeleting(null);
      })
      .catch((error) => {
        toast.fail({ title: settingsError(error, "Could not delete webhook") });
      });
  };

  return (
    <div className="flex flex-col gap-5">
      <ProfileSection
        name={name}
        slug={slug}
        logo={logo}
        saving={updateOrganization.isPending}
        onNameChange={setName}
        onSlugChange={setSlug}
        onLogoChange={setLogo}
        onSave={saveProfile}
      />
      <DeveloperSection
        recipientAddress={recipientAddress}
        onRecipientAddressChange={setRecipientAddress}
        endpoints={endpoints}
        endpointsLoading={webhooksQuery.isPending}
        pendingId={pendingId}
        onAdd={() => setAddOpen(true)}
        onToggle={(endpoint, enabled) => {
          void toggleEnabled(endpoint, enabled);
        }}
        onRotate={(endpoint) => {
          void rotateSecret(endpoint);
        }}
        onSendTest={setTesting}
        onDelete={setDeleting}
      />

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
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default SettingsView;
