import { describe, expect, it } from "vitest";
import {
  checkoutWaitingPath,
  PAYER_PAYMENT_QUERY,
  payerWaitingPath,
} from "./config";
import { dropWaitingMultisig, parseWaitingMultisig } from "./multisig-query";

const evmProposal = {
  kind: "pending-multisig" as const,
  chainKind: "evm" as const,
  safeAddress: "0xsafe",
  safeTxHash: "0xhash",
  chainId: 1,
};

const solanaProposal = {
  kind: "pending-multisig" as const,
  chainKind: "solana" as const,
  vaultAddress: "vault",
  multisigPda: "pda",
  transactionIndex: 9n,
};

describe("waiting URL restore", () => {
  it("round-trips a Safe proposal through the paylink waiting path", () => {
    const path = payerWaitingPath("link-1", { swapId: "swap-1", proposal: evmProposal });
    const search = new URLSearchParams(path.split("?")[1]);
    expect(parseWaitingMultisig(search)).toEqual({
      swapId: "swap-1",
      proposal: evmProposal,
    });
  });

  it("round-trips a Squads index through checkout waiting", () => {
    const path = checkoutWaitingPath("sess-1", { swapId: "swap-2", proposal: solanaProposal });
    const search = new URLSearchParams(path.split("?")[1]);
    expect(search.get("sessionId")).toBe("sess-1");
    expect(parseWaitingMultisig(search)).toEqual({
      swapId: "swap-2",
      proposal: solanaProposal,
    });
  });

  it("drops ms params and keeps paymentId", () => {
    const search = new URLSearchParams(
      payerWaitingPath("link-1", {
        paymentId: "pay-1",
        swapId: "swap-1",
        proposal: evmProposal,
      }).split("?")[1],
    );
    dropWaitingMultisig(search);
    expect(parseWaitingMultisig(search)).toBeNull();
    expect(search.get(PAYER_PAYMENT_QUERY)).toBe("pay-1");
  });

  it("rejects an incomplete query", () => {
    expect(parseWaitingMultisig(new URLSearchParams("swapId=s1&msKind=evm"))).toBeNull();
  });
});
