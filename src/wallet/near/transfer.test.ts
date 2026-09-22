import { describe, expect, it } from "vitest";
import { mergeSameReceiverTxs, type NearTx } from "./transfer";

function tx(receiverId: string, methodName: string): NearTx {
  return {
    receiverId,
    actions: [{
      type: "FunctionCall",
      params: { methodName, args: {}, gas: "1", deposit: "0" },
    }],
  };
}

describe("mergeSameReceiverTxs", () => {
  it("merges two consecutive txs to the same receiver into one", () => {
    expect(mergeSameReceiverTxs([
      tx("usdc.near", "storage_deposit"),
      tx("usdc.near", "ft_transfer"),
    ])).toEqual([{
      receiverId: "usdc.near",
      actions: [
        { type: "FunctionCall", params: { methodName: "storage_deposit", args: {}, gas: "1", deposit: "0" } },
        { type: "FunctionCall", params: { methodName: "ft_transfer", args: {}, gas: "1", deposit: "0" } },
      ],
    }]);
  });

  it("merges four consecutive wrap.near txs into one", () => {
    const merged = mergeSameReceiverTxs([
      tx("wrap.near", "storage_deposit"),
      tx("wrap.near", "storage_deposit"),
      tx("wrap.near", "near_deposit"),
      tx("wrap.near", "ft_transfer"),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].receiverId).toBe("wrap.near");
    expect(merged[0].actions.map((action) =>
      action.type === "FunctionCall" ? action.params.methodName : action.type,
    )).toEqual([
      "storage_deposit",
      "storage_deposit",
      "near_deposit",
      "ft_transfer",
    ]);
  });

  it("does not merge consecutive txs with different receivers", () => {
    expect(mergeSameReceiverTxs([
      tx("alice.near", "ft_transfer"),
      tx("bob.near", "ft_transfer"),
    ])).toEqual([
      tx("alice.near", "ft_transfer"),
      tx("bob.near", "ft_transfer"),
    ]);
  });

  it("merges only consecutive same-receiver runs", () => {
    const merged = mergeSameReceiverTxs([
      tx("usdc.near", "storage_deposit"),
      tx("wrap.near", "near_deposit"),
      tx("usdc.near", "ft_transfer"),
    ]);
    expect(merged.map((row) => row.receiverId)).toEqual([
      "usdc.near",
      "wrap.near",
      "usdc.near",
    ]);
  });
});
