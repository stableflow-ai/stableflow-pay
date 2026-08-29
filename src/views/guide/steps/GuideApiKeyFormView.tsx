import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import { useApiKeyMutations } from "@/hooks/use-api-keys-api";
import useToast from "@/hooks/use-toast";
import { useGuideStore } from "@/stores/guide";
import { API_KEY_LABEL_MAX_LENGTH } from "@/views/api-keys/config";
import { apiKeysError } from "@/views/api-keys/utils";
import { GUIDE_STEP, GUIDE_STEP_PATH, GUIDE_STEPS } from "../config";
import { GuideDrawer } from "../GuideDrawer";
import { GuideSkipLink } from "../components/GuideSkipLink";
import { useGuideProgress } from "../hooks/use-guide-progress";
import { nextGuideStepHref } from "../utils";

export function GuideApiKeyFormView() {
  const navigate = useNavigate();
  const toast = useToast();
  const { createMutation } = useApiKeyMutations();
  const setApiKey = useGuideStore((state) => state.setApiKey);
  const progress = useGuideProgress();
  const [label, setLabel] = useState("");

  if (progress.apiKeyDone) {
    return <Navigate to={GUIDE_STEP_PATH.apiKeyPreview} replace />;
  }

  async function submit() {
    const next = label.trim();
    if (!next) {
      toast.fail({ title: "Key label is required" });
      return;
    }
    try {
      const created = await createMutation.mutateAsync({ name: next });
      setApiKey({
        id: created.id,
        label: created.name || next,
        key: created.apiKey,
      });
      navigate(GUIDE_STEP_PATH.apiKeyPreview);
    } catch (error) {
      toast.fail({ title: apiKeysError(error, "Could not create API key") });
    }
  }

  return (
    <GuideDrawer title={GUIDE_STEPS[1].drawerTitle}>
      <div className="flex flex-col">
        <label htmlFor="guide-api-key-label" className="font-montserrat text-sm font-medium text-[#606060]">
          Key Label
        </label>
        <input
          id="guide-api-key-label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Name of API key"
          maxLength={API_KEY_LABEL_MAX_LENGTH}
          className="mt-2.5 h-9 w-full rounded-[6px] border border-[#e3e3e3] bg-[#f6f6f6] px-3 font-montserrat text-sm font-medium text-black outline-none placeholder:text-black/30"
        />
        <Button
          size={BUTTON_SIZE.Lg}
          className="mt-8 w-full"
          loading={createMutation.isPending}
          onClick={() => void submit()}
        >
          Create
        </Button>
        <div className="mt-5 flex justify-center">
          <GuideSkipLink
            to={nextGuideStepHref(GUIDE_STEP.ApiKey, progress) ?? GUIDE_STEP_PATH.webhook}
            label="Skip"
          />
        </div>
      </div>
    </GuideDrawer>
  );
}

export default GuideApiKeyFormView;
