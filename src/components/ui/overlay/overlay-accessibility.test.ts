import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("overlay accessibility contract", () => {
  it("keeps masked panels named, focus-trapped, and focus-restoring", () => {
    const panelSource = readFileSync(new URL("./OverlayPanel.tsx", import.meta.url), "utf8");
    const drawerSource = readFileSync(new URL("../drawer/Drawer.tsx", import.meta.url), "utf8");
    const dialogSource = readFileSync(new URL("../dialog/Dialog.tsx", import.meta.url), "utf8");

    expect(panelSource).toContain('aria-labelledby={hasTitle ? titleId : undefined}');
    expect(panelSource).toContain('aria-label={hasTitle ? undefined : ariaLabel}');
    expect(panelSource).toContain('if (event.key !== "Tab") return');
    expect(panelSource).toContain("panel.focus()");
    expect(panelSource).toContain("activeElement === panel");
    expect(panelSource).toContain("previouslyFocused?.isConnected");
    expect(drawerSource).toContain("trapFocus={mask}");
    expect(dialogSource).toContain("trapFocus={mask}");
  });
});
