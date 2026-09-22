import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("router authentication contract", () => {
  it("keeps Developer Docs outside RequireAuth", () => {
    const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
    const requireAuthIndex = source.indexOf("element: <RequireAuth />");
    const docsRouteIndex = source.indexOf('path: "/docs"');

    expect(requireAuthIndex).toBeGreaterThan(-1);
    expect(docsRouteIndex).toBeGreaterThan(-1);
    expect(docsRouteIndex).toBeLessThan(requireAuthIndex);
  });
});
