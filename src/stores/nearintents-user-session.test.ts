import { describe, expect, it } from "vitest";
import { isConfidentialUserAccessToken } from "./nearintents-user-session";

function jwt(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${body}.sig`;
}

describe("isConfidentialUserAccessToken", () => {
  it("rejects a Partner distribution-channel JWT", () => {
    expect(
      isConfidentialUserAccessToken(jwt({
        key_type: "distribution_channel",
        partner_id: "eureka-labs-ltd",
      })),
    ).toBe(false);
  });

  it("accepts a user session JWT", () => {
    expect(isConfidentialUserAccessToken(jwt({ sub: "0xabc", typ: "access" }))).toBe(true);
  });
});
