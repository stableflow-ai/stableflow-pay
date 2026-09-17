import { describe, expect, it } from "vitest";
import {
  matchSpecFromActions,
  matchSpecFromTransaction,
  pickMatchingProposal,
  proposalMatches,
} from "./proposal";
import type { ProposalMatchSpec, SputnikProposal } from "./types";

const expected: ProposalMatchSpec = {
  kind: "FunctionCall",
  receiverId: "usdc.near",
  methodNames: ["storage_deposit", "ft_transfer"],
};

function proposal(id: number, kind: SputnikProposal["kind"]): SputnikProposal {
  return { id, kind };
}

describe("matchSpecFromActions", () => {
  it("keeps the receiver and FunctionCall method names in order", () => {
    expect(matchSpecFromActions({
      receiverId: "usdc.near",
      actions: [
        { params: { methodName: "storage_deposit" } },
        { params: { methodName: "ft_transfer" } },
      ],
    })).toEqual(expected);
  });
});

describe("matchSpecFromTransaction", () => {
  it("builds a Transfer spec with amount from a single Transfer action", () => {
    expect(matchSpecFromTransaction({
      receiverId: "deposit.near",
      actions: [{ type: "Transfer", params: { deposit: "100" } }],
    })).toEqual({
      kind: "Transfer",
      receiverId: "deposit.near",
      amount: "100",
    });
  });

  it("omits amount when several Transfer actions share a receiver", () => {
    expect(matchSpecFromTransaction({
      receiverId: "deposit.near",
      actions: [
        { type: "Transfer", params: { deposit: "1" } },
        { type: "Transfer", params: { deposit: "2" } },
      ],
    })).toEqual({
      kind: "Transfer",
      receiverId: "deposit.near",
    });
  });

  it("throws when Transfer and FunctionCall are mixed", () => {
    expect(() => matchSpecFromTransaction({
      receiverId: "wrap.near",
      actions: [
        { type: "Transfer", params: { deposit: "1" } },
        { type: "FunctionCall", params: { methodName: "ft_transfer" } },
      ],
    })).toThrow(/mixes Transfer and FunctionCall/);
  });
});

describe("proposalMatches", () => {
  it("matches FunctionCall by receiver and method set, ignoring args", () => {
    const row = proposal(4, {
      FunctionCall: {
        receiver_id: "usdc.near",
        actions: [
          { method_name: "storage_deposit", args: "aaaa" },
          { method_name: "ft_transfer", args: "bbbb" },
        ],
      },
    });
    expect(proposalMatches(row, expected)).toBe(true);
  });

  it("rejects a different receiver or missing method", () => {
    expect(proposalMatches(proposal(1, {
      FunctionCall: {
        receiver_id: "wrap.near",
        actions: [
          { method_name: "storage_deposit" },
          { method_name: "ft_transfer" },
        ],
      },
    }), expected)).toBe(false);

    expect(proposalMatches(proposal(1, {
      FunctionCall: {
        receiver_id: "usdc.near",
        actions: [{ method_name: "ft_transfer" }],
      },
    }), expected)).toBe(false);
  });

  it("does not match Transfer kinds against a FunctionCall spec", () => {
    expect(proposalMatches(proposal(1, {
      Transfer: { receiver_id: "usdc.near", amount: "1" },
    }), expected)).toBe(false);
  });

  it("matches Transfer by receiver and optional amount", () => {
    const spec: ProposalMatchSpec = {
      kind: "Transfer",
      receiverId: "deposit.near",
      amount: "100",
    };
    expect(proposalMatches(proposal(1, {
      Transfer: { receiver_id: "deposit.near", amount: "100" },
    }), spec)).toBe(true);
    expect(proposalMatches(proposal(1, {
      Transfer: { receiver_id: "deposit.near", amount: "99" },
    }), spec)).toBe(false);
    expect(proposalMatches(proposal(1, {
      Transfer: { receiver_id: "other.near", amount: "100" },
    }), spec)).toBe(false);
    expect(proposalMatches(proposal(1, {
      FunctionCall: {
        receiver_id: "deposit.near",
        actions: [{ method_name: "ft_transfer" }],
      },
    }), spec)).toBe(false);
  });

  it("ignores Transfer amount when the spec omits it", () => {
    const spec: ProposalMatchSpec = { kind: "Transfer", receiverId: "deposit.near" };
    expect(proposalMatches(proposal(1, {
      Transfer: { receiver_id: "deposit.near", amount: "99" },
    }), spec)).toBe(true);
  });
});

describe("pickMatchingProposal", () => {
  it("uses get_last_proposal_id as the next id: new proposals start at fromIndex", () => {
    const nextId = 3;
    const existing = [
      proposal(1, {
        FunctionCall: {
          receiver_id: "usdc.near",
          actions: [{ method_name: "ft_transfer" }],
        },
      }),
      proposal(2, {
        FunctionCall: {
          receiver_id: "other.near",
          actions: [{ method_name: "ft_transfer" }],
        },
      }),
    ];
    expect(pickMatchingProposal(existing, expected)).toBeNull();

    const afterSubmit = [
      ...existing.filter((row) => row.id >= nextId),
      proposal(3, {
        FunctionCall: {
          receiver_id: "usdc.near",
          actions: [
            { method_name: "storage_deposit" },
            { method_name: "ft_transfer" },
          ],
        },
      }),
    ];
    expect(pickMatchingProposal(afterSubmit, expected)?.id).toBe(3);
  });

  it("picks the matching proposal among concurrent ones by kind, not by being last", () => {
    const rows = [
      proposal(10, {
        FunctionCall: {
          receiver_id: "wrap.near",
          actions: [{ method_name: "ft_transfer" }],
        },
      }),
      proposal(11, {
        FunctionCall: {
          receiver_id: "usdc.near",
          actions: [
            { method_name: "storage_deposit" },
            { method_name: "ft_transfer" },
          ],
        },
      }),
      proposal(12, {
        FunctionCall: {
          receiver_id: "usdc.near",
          actions: [{ method_name: "ft_transfer" }],
        },
      }),
      proposal(13, {
        Transfer: { receiver_id: "usdc.near", amount: "1" },
      }),
    ];
    expect(pickMatchingProposal(rows, expected)?.id).toBe(11);
  });

  it("picks a Transfer among concurrent FunctionCall proposals by kind", () => {
    const spec: ProposalMatchSpec = {
      kind: "Transfer",
      receiverId: "deposit.near",
      amount: "100",
    };
    const rows = [
      proposal(10, {
        FunctionCall: {
          receiver_id: "deposit.near",
          actions: [{ method_name: "ft_transfer" }],
        },
      }),
      proposal(11, {
        Transfer: { receiver_id: "other.near", amount: "100" },
      }),
      proposal(12, {
        Transfer: { receiver_id: "deposit.near", amount: "100" },
      }),
    ];
    expect(pickMatchingProposal(rows, spec)?.id).toBe(12);
  });
});
