import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { useApiKeyMutations, useApiKeysQuery } from "@/hooks/use-api-keys-api";
import useToast from "@/hooks/use-toast";
import type { PayApiKey } from "@/types/api-keys";
import { ApiKeyDialog } from "./components/ApiKeyDialog";
import { ApiKeysTable } from "./components/ApiKeysTable";
import { DeleteApiKeyDialog } from "./components/DeleteApiKeyDialog";
import { API_KEY_DIALOG_MODE, type ApiKeyDialogMode } from "./config";
import { apiKeysError } from "./utils";

export function ApiKeysView() {
  const keysQuery = useApiKeysQuery();
  const { createMutation, updateMutation, deleteMutation } = useApiKeyMutations();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ApiKeyDialogMode>(API_KEY_DIALOG_MODE.Create);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<PayApiKey | null>(null);

  const apiKeys = keysQuery.data ?? [];
  const editingKey = apiKeys.find((row) => row.id === editingId);

  const openCreate = () => {
    setDialogMode(API_KEY_DIALOG_MODE.Create);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: number) => {
    setDialogMode(API_KEY_DIALOG_MODE.Edit);
    setEditingId(id);
    setDialogOpen(true);
  };

  const copyKey = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    void deleteMutation.mutateAsync(id).catch((error) => {
      toast.fail({ title: apiKeysError(error, "Could not delete API key") });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <p className="min-w-0 font-montserrat text-sm font-medium text-[#606060]">
          Your API keys are listed below. Do not share your API key with others, or expose it in the
          browser or other client-side code.
        </p>
        <Button
          size={BUTTON_SIZE.Md}
          className="h-[46px] w-full shrink-0 rounded-[12px] px-5 text-sm md:w-auto"
          onClick={openCreate}
        >
          Create New API Key
        </Button>
      </div>

      <ApiKeysTable
        apiKeys={apiKeys}
        isPending={keysQuery.isPending}
        isError={keysQuery.isError}
        errorMessage={apiKeysError(keysQuery.error, "Failed to load API keys")}
        onCreate={openCreate}
        onCopy={(value) => {
          void copyKey(value);
        }}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <ApiKeyDialog
        open={dialogOpen}
        mode={dialogMode}
        initialLabel={editingKey?.name ?? ""}
        onClose={() => setDialogOpen(false)}
        onCreate={async (name) => {
          const created = await createMutation.mutateAsync({ name });
          return created.apiKey;
        }}
        onUpdate={async (name) => {
          if (editingId == null) return;
          await updateMutation.mutateAsync({ id: editingId, name });
        }}
      />

      <DeleteApiKeyDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        apiKey={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default ApiKeysView;
