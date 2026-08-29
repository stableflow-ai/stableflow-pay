import { describe, expect, it } from "vitest";
import type { ChainConfig } from "@/config/chains";
import { defaultTokenSelectChain, sortTokenSelectChains, tokenBalanceUsd, tokenSelectChainTitle } from "./utils";

function chain(partial: Pick<ChainConfig, "blockchain" | "chainName" | "chainKind">): ChainConfig {
  return {
    ...partial,
    logo: "",
    payerEnabled: true,
    batchEnabled: true,
    txExplorer: "",
  };
}

const near = chain({ blockchain: "near", chainName: "Near", chainKind: "near" });
const eth = chain({ blockchain: "eth", chainName: "Ethereum", chainKind: "evm" });
const base = chain({ blockchain: "base", chainName: "Base", chainKind: "evm" });
const sol = chain({ blockchain: "sol", chainName: "Solana", chainKind: "solana" });
const tron = chain({ blockchain: "tron", chainName: "Tron", chainKind: "tron" });


describe("tokenBalanceUsd", () => {
  it("multiplies balance by price", () => {
    expect(tokenBalanceUsd({ price: 4000 }, "0.05")).toBe(200);
    expect(tokenBalanceUsd({ price: 1 }, "100")).toBe(100);
  });

  it("returns -1 for unknown balance", () => {
    expect(tokenBalanceUsd({ price: 1 }, null)).toBe(-1);
    expect(tokenBalanceUsd({ price: 1 }, undefined)).toBe(-1);
    expect(tokenBalanceUsd({ price: 1 }, "—")).toBe(-1);
  });

  it("returns 0 for a zero balance", () => {
    expect(tokenBalanceUsd({ price: 1 }, "0")).toBe(0);
  });

  it("treats a non-finite price as 0", () => {
    expect(tokenBalanceUsd({ price: Number.NaN }, "10")).toBe(0);
  });
});

describe("sortTokenSelectChains", () => {
  it("orders Near, then EVM, then Solana, then Tron", () => {
    const sorted = sortTokenSelectChains([tron, sol, eth, near, base]);
    expect(sorted.map((item) => item.blockchain)).toEqual(["near", "eth", "base", "sol", "tron"]);
  });
});

describe("tokenSelectChainTitle", () => {
  it("uses Near Protocol for near", () => {
    expect(tokenSelectChainTitle(near)).toBe("Near Protocol");
  });

  it("keeps other chain names", () => {
    expect(tokenSelectChainTitle(eth)).toBe("Ethereum");
  });
});

describe("defaultTokenSelectChain", () => {
  const available = [near, eth, base, sol, tron];

  it("prefers the selected token chain", () => {
    expect(defaultTokenSelectChain(available, "base")).toBe("base");
  });

  it("falls back to the locked kind", () => {
    expect(defaultTokenSelectChain(available, null, "solana")).toBe("sol");
  });

  it("falls back to the first available chain", () => {
    expect(defaultTokenSelectChain(available)).toBe("near");
  });

  it("ignores a selected chain that is not available", () => {
    expect(defaultTokenSelectChain([eth, sol], "near")).toBe("eth");
  });
});

