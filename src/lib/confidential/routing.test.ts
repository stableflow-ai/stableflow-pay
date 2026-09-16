import { describe, expect, it } from "vitest";
import {
  derivePrivacyTransferMode,
  resolveFundingRoute,
  type RegistryToken,
} from "./routing";

const ethUsdc: RegistryToken = {
  assetId: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
  blockchain: "eth",
  symbol: "USDC",
  decimals: 6,
  contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
};

const arbUsdc: RegistryToken = {
  assetId: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
  blockchain: "arb",
  symbol: "USDC",
  decimals: 6,
  contractAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
};

describe("derivePrivacyTransferMode", () => {
  it("uses TRANSFER when the preferred funding asset matches the destination", () => {
    const preferred = resolveFundingRoute(ethUsdc, [ethUsdc, arbUsdc]);
    expect(preferred.kind).toBe("DIRECT");
    expect(derivePrivacyTransferMode(preferred, ethUsdc)).toBe("TRANSFER");
  });

  it("uses SWAP when source and destination asset ids differ", () => {
    const preferred = resolveFundingRoute(ethUsdc, [ethUsdc, arbUsdc]);
    expect(derivePrivacyTransferMode(preferred, arbUsdc)).toBe("SWAP");
  });
});
