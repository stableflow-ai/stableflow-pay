import { beforeEach, describe, expect, it } from "vitest";
import { useGuideStore } from "@/stores/guide";
import type { AuthUser } from "@/types/auth";
import { postAuthPath } from "./post-auth-path";

const user = (guideCompleted: boolean, id = 7): AuthUser => ({
  id,
  email: "a@b.test",
  name: "Ada",
  guideCompleted,
});

describe("postAuthPath", () => {
  beforeEach(() => {
    useGuideStore.setState({ skippedAllUserIds: [] });
  });

  it("prefers returnTo", () => {
    expect(postAuthPath(user(false), "/settings")).toBe("/settings");
    expect(postAuthPath(user(true), "/docs")).toBe("/docs");
    expect(postAuthPath(user(false), "/")).toBe("/guide/payment-link");
  });

  it("sends unfinished users to the payment-link guide step", () => {
    expect(postAuthPath(user(false), null)).toBe("/guide/payment-link");
  });

  it("sends completed or skip-all users home", () => {
    expect(postAuthPath(user(true), null)).toBe("/");
    useGuideStore.getState().skipAll(7);
    expect(postAuthPath(user(false), null)).toBe("/");
  });

  it("does not apply another user's skip-all", () => {
    useGuideStore.getState().skipAll(7);
    expect(postAuthPath(user(false, 8), null)).toBe("/guide/payment-link");
  });
});
