import { describe, expect, it } from "vitest";
import { splitConfidentialRawAmount } from "./split-amount";

describe("splitConfidentialRawAmount", () => {
  it("returns the total unchanged for one recipient", () => {
    expect(splitConfidentialRawAmount("1000", 1)).toEqual(["1000"]);
  });

  it("keeps the same shares when random values are frozen", () => {
    const first = splitConfidentialRawAmount("1000", 3, [0.2, 0.8]);
    const second = splitConfidentialRawAmount("1000", 3, [0.2, 0.8]);
    expect(first).toEqual(second);
    expect(first.reduce((sum, share) => sum + BigInt(share), 0n)).toBe(1000n);
  });

  it("rejects more than 10 recipients", () => {
    expect(() => splitConfidentialRawAmount("1000", 11)).toThrow(/1 to 10/);
  });

  it("rejects a total smaller than the recipient count", () => {
    expect(() => splitConfidentialRawAmount("2", 3)).toThrow(/too small/);
  });
});
