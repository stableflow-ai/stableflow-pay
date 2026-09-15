import { describe, expect, it } from "vitest";
import { isPayQuoteExpired } from "./utils";

describe("isPayQuoteExpired", () => {
  it("treats empty or invalid deadlines as not expired", () => {
    expect(isPayQuoteExpired("", 1_000)).toBe(false);
    expect(isPayQuoteExpired("not-a-date", 1_000)).toBe(false);
  });

  it("is expired at or after the deadline", () => {
    expect(isPayQuoteExpired("2026-09-15T12:00:00.000Z", Date.parse("2026-09-15T12:00:00.000Z"))).toBe(true);
    expect(isPayQuoteExpired("2026-09-15T12:00:00.000Z", Date.parse("2026-09-15T12:00:01.000Z"))).toBe(true);
  });

  it("is not expired before the deadline", () => {
    expect(isPayQuoteExpired("2026-09-15T12:00:00.000Z", Date.parse("2026-09-15T11:59:59.000Z"))).toBe(false);
  });
});
