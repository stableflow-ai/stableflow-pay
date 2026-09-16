import { describe, expect, it } from "vitest";
import { FIXED_CHAINS } from "@/config/chains";
import {
  assertFailedRetryRecipients,
  planDigest,
  validatePrivacyRecipients,
  type PrivacyQuotePlan,
} from "@/lib/confidential/plan";
import type { IntentsToken } from "@/stores/intents-tokens";

const eth = FIXED_CHAINS.find((chain) => chain.blockchain === "eth")!;

const ethUsdc: IntentsToken = {
  assetId: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
  decimals: 6,
  blockchain: "eth",
  symbol: "USDC",
  providerSymbol: "USDC",
  price: 1,
  contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chain: eth,
  logo: "",
};

describe("validatePrivacyRecipients", () => {
  it("rejects duplicate EVM addresses regardless of case", () => {
    const lower = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const checksum = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    expect(() => validatePrivacyRecipients([lower, lower], ethUsdc)).toThrow(/Duplicate/);
    expect(() => validatePrivacyRecipients([lower, checksum], ethUsdc)).toThrow(/Duplicate/);
  });

  it("accepts unique addresses", () => {
    expect(
      validatePrivacyRecipients(
        [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
        ],
        ethUsdc,
      ),
    ).toHaveLength(2);
  });
});

describe("assertFailedRetryRecipients", () => {
  const original = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
  ];

  it("allows a subset of the original addresses", () => {
    expect(assertFailedRetryRecipients([original[0]!], original, ethUsdc)).toEqual([original[0]]);
  });

  it("rejects an address that was not in the original set", () => {
    expect(() =>
      assertFailedRetryRecipients(
        ["0x3333333333333333333333333333333333333333"],
        original,
        ethUsdc,
      ),
    ).toThrow(/subset/);
  });
});

describe("planDigest", () => {
  it("is stable for the same plan body", () => {
    const unsigned = {
      version: 1 as const,
      id: "plan-1",
      createdAt: 1,
      expiresAt: 2,
      mode: "TRANSFER" as const,
      fundingSource: "balance" as const,
      signerId: "0xabc",
      linkingKind: "evm" as const,
      linkingAddress: "0xabc",
      sourceWalletAddress: "0xabc",
      sourceWalletKind: "evm" as const,
      sourceToken: ethUsdc,
      destinationToken: ethUsdc,
      amountRaw: "1000",
      slippageBps: 50,
      recipients: ["0x1111111111111111111111111111111111111111"],
      route: { kind: "DIRECT" as const, fundingAsset: ethUsdc },
      fundingAmount: "1000",
      randomValues: [0.5],
      previews: [
        {
          recipient: "0x1111111111111111111111111111111111111111",
          amountIn: "1000",
          amountOut: "990",
          minAmountOut: "980",
        },
      ],
      expectedOut: "990",
      minAmountOut: "980",
    };
    const first = planDigest(unsigned);
    const second = planDigest({ ...unsigned, digest: "ignored" } as PrivacyQuotePlan);
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });
});
