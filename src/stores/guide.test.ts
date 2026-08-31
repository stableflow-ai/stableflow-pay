import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/auth";
import { guideArtifactsForUser, useGuideStore } from "@/stores/guide";
import type { AuthUser } from "@/types/auth";

const userA: AuthUser = { id: 7, email: "a@b.test", name: "Ada", guideCompleted: false };
const userB: AuthUser = { id: 8, email: "b@b.test", name: "Ben", guideCompleted: false };

function session(user: AuthUser) {
  useAuthStore.getState().applySession("tok", user);
}

describe("guide store per-user artifacts", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, omitReturnTo: false });
    useGuideStore.setState({ artifactsByUserId: {}, skippedAllUserIds: [] });
  });

  it("does not write artifacts without a session", () => {
    useGuideStore.getState().setPaymentLink({
      linkId: "x",
      title: "X",
      url: "https://example.test/x",
    });
    expect(useGuideStore.getState().artifactsByUserId).toEqual({});
  });

  it("keeps payment-link drafts on the current user only", () => {
    session(userA);
    useGuideStore.getState().setPaymentLink({
      linkId: "a1",
      title: "Ada link",
      url: "https://example.test/a1",
    });
    session(userB);
    expect(guideArtifactsForUser(useGuideStore.getState(), userB.id).paymentLink).toBeNull();
    expect(guideArtifactsForUser(useGuideStore.getState(), userA.id).paymentLink?.linkId).toBe("a1");
  });
});
