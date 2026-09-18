import { describe, expect, it } from "vitest";
import {
  OVERLAY_BASE_Z_INDEX,
  OVERLAY_Z_INDEX_STEP,
  WALLET_PORTAL_Z_INDEX,
} from "./config";
import { elevatedOverlayZIndex } from "./stack";

describe("elevatedOverlayZIndex", () => {
  it("raises an elevated overlay into the wallet portal band", () => {
    expect(elevatedOverlayZIndex(OVERLAY_BASE_Z_INDEX + OVERLAY_Z_INDEX_STEP)).toBe(
      WALLET_PORTAL_Z_INDEX + OVERLAY_Z_INDEX_STEP,
    );
  });
});
