import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("router authentication contract", () => {
  it("keeps Developer Docs inside RequireAuth", () => {
    const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
    const requireAuthIndex = source.indexOf("element: <RequireAuth />");
    const protectedLayoutIndex = source.indexOf("element: <AppLayout />", requireAuthIndex);
    const docsRouteIndex = source.indexOf('{ path: "/docs", element: <DocsView /> }');

    expect(requireAuthIndex).toBeGreaterThan(-1);
    expect(protectedLayoutIndex).toBeGreaterThan(requireAuthIndex);
    expect(docsRouteIndex).toBeGreaterThan(protectedLayoutIndex);
    expect(source.slice(0, requireAuthIndex)).not.toContain('path: "/docs"');
  });
});
