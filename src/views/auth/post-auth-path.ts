import { useGuideStore } from "@/stores/guide";
import type { AuthUser } from "@/types/auth";
import { GUIDE_STEP_PATH } from "@/views/guide/config";

export function postAuthPath(user: AuthUser, returnTo: string | null): string {
  if (returnTo) return returnTo;
  if (!user.guideCompleted && !useGuideStore.getState().hasSkippedAll(user.id)) {
    return GUIDE_STEP_PATH.paymentLink;
  }
  return "/";
}
