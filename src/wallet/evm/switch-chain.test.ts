import { describe, expect, it } from "vitest";
import { isAlreadyOnChain, isChainMismatch, isUserRejected } from "./switch-chain-errors";

describe("isChainMismatch", () => {
  it("detects wagmi connector vs connection errors", () => {
    expect(
      isChainMismatch(
        new Error(
          "The current chain of the connector (id: 42161) does not match the connection's chain (id: 137).",
        ),
      ),
    ).toBe(true);
  });

  it("detects ConnectorChainMismatchError by name", () => {
    const error = new Error("mismatch");
    error.name = "ConnectorChainMismatchError";
    expect(isChainMismatch(error)).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isChainMismatch(new Error("User rejected the request."))).toBe(false);
  });
});

describe("isAlreadyOnChain", () => {
  it("detects an already-on-chain switch", () => {
    expect(isAlreadyOnChain(new Error("already on this chain"))).toBe(true);
  });

  it("does not treat a connected connector as already on the target chain", () => {
    expect(isAlreadyOnChain(new Error("Connector already connected."))).toBe(false);
  });
});

describe("isUserRejected", () => {
  it("detects EIP-1193 rejection", () => {
    expect(isUserRejected({ code: 4001, message: "User rejected the request." })).toBe(true);
  });
});
