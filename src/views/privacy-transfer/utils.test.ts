import { describe, expect, it } from "vitest";
import { pickLinkingEvmChainId } from "./utils";

describe("pickLinkingEvmChainId", () => {
  it("uses the source EVM chain for EVM linking", () => {
    expect(
      pickLinkingEvmChainId({
        linkingKind: "evm",
        source: { chainKind: "evm", chainId: 42161 },
        destination: { chainKind: "evm", chainId: 137 },
      }),
    ).toBe(42161);
  });

  it("falls back to the destination EVM chain", () => {
    expect(
      pickLinkingEvmChainId({
        linkingKind: "evm",
        source: { chainKind: "near" },
        destination: { chainKind: "evm", chainId: 42161 },
      }),
    ).toBe(42161);
  });

  it("skips non-EVM linking wallets", () => {
    expect(
      pickLinkingEvmChainId({
        linkingKind: "near",
        source: { chainKind: "evm", chainId: 42161 },
      }),
    ).toBeUndefined();
  });
});
