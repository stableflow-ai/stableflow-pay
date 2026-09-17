import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-error";
import { formatQuoteErrorMessage, isPayQuoteExpired } from "./utils";

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

describe("formatQuoteErrorMessage", () => {
  it("converts a RHEA Near minimum with destination decimals", () => {
    const error = new ApiError(
      "Amount is too low for bridge, try at least 16878800283555566203",
      400,
    );
    expect(formatQuoteErrorMessage(error, 18)).toBe(
      "Amount is too low for bridge, try at least 16.878800283555566203",
    );
  });

  it("maps a software-wallet rejection to the unified copy", () => {
    expect(formatQuoteErrorMessage(new Error("User rejected the request"))).toBe(
      "User rejected transaction",
    );
  });

  it("maps a Ledger device rejection to the unified copy", () => {
    expect(formatQuoteErrorMessage(
      new Error("Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)"),
    )).toBe("User rejected transaction");
  });

  it("maps a locked Ledger device to the unlock copy", () => {
    expect(formatQuoteErrorMessage(
      new Error("Ledger device: Locked device (0x5515)"),
    )).toBe("Unlock your Ledger device and open the Solana app.");
  });
});
