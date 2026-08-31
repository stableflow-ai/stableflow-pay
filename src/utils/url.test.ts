import { describe, expect, it } from "vitest";
import { isHttpUrl } from "./url";

describe("isHttpUrl", () => {
  it("accepts http and https URLs with a host", () => {
    expect(isHttpUrl("https://cdn.example.com/logo.png")).toBe(true);
    expect(isHttpUrl("http://example.com/a")).toBe(true);
  });

  it("rejects empty values", () => {
    expect(isHttpUrl("")).toBe(false);
    expect(isHttpUrl("   ")).toBe(false);
  });

  it("rejects non-URLs", () => {
    expect(isHttpUrl("not-a-url")).toBe(false);
  });

  it("rejects javascript and data URLs", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:image/png;base64,abc")).toBe(false);
  });
});
