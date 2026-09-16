import { describe, expect, it } from "vitest";
import { canResumePrivacyExecution } from "./execution-types";

describe("canResumePrivacyExecution", () => {
  it("allows in-flight stages except an unconfirmed funding broadcast", () => {
    expect(canResumePrivacyExecution("created")).toBe(true);
    expect(canResumePrivacyExecution("funded")).toBe(true);
    expect(canResumePrivacyExecution("submitted")).toBe(true);
    expect(canResumePrivacyExecution("funding_pending_confirmation")).toBe(false);
    expect(canResumePrivacyExecution("failed")).toBe(false);
    expect(canResumePrivacyExecution("completed")).toBe(false);
  });
});
