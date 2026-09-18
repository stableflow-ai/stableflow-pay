import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";
import { shouldRetryQuery } from "./query-client";

describe("shouldRetryQuery", () => {
  it("retries network errors up to two failures", () => {
    expect(shouldRetryQuery(0, new Error("offline"))).toBe(true);
    expect(shouldRetryQuery(1, new Error("offline"))).toBe(true);
    expect(shouldRetryQuery(2, new Error("offline"))).toBe(false);
  });

  it("does not retry 4xx ApiError", () => {
    expect(shouldRetryQuery(0, new ApiError("Bad request", 400, "400"))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError("Not authenticated", 401, "UNAUTHENTICATED"))).toBe(false);
  });

  it("retries TIMEOUT and 5xx", () => {
    expect(shouldRetryQuery(0, new ApiError("Request timed out", 0, "TIMEOUT"))).toBe(true);
    expect(shouldRetryQuery(1, new ApiError("Request timed out", 0, "TIMEOUT"))).toBe(true);
    expect(shouldRetryQuery(2, new ApiError("Request timed out", 0, "TIMEOUT"))).toBe(false);
    expect(shouldRetryQuery(0, new ApiError("Server error", 500))).toBe(true);
  });
});
