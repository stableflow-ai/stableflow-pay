/**
 * Find the SputnikDAO proposal Trezu created from a `signAndSendTransaction`.
 *
 * `get_last_proposal_id` is the next unused id, not the last existing one.
 * FunctionCall args are ignored: Trezu re-encodes them as base64. Native NEAR
 * transfers become `kind.Transfer`, not FunctionCall.
 */

import { nearViewFunction } from "@/lib/rpc/near";
import {
  PROPOSAL_DISCOVER_INTERVAL_MS,
  PROPOSAL_DISCOVER_TIMEOUT_MS,
  TREZU_PROPOSAL_DISCOVER_TIMEOUT_MESSAGE,
} from "./config";
import type { ProposalMatchSpec, SputnikProposal } from "./types";

type TxAction =
  | { type: "FunctionCall"; params: { methodName: string } }
  | { type: "Transfer"; params: { deposit: string } }
  | { type: string; params?: unknown };

export function matchSpecFromTransaction(tx: {
  receiverId: string;
  actions: readonly TxAction[];
}): ProposalMatchSpec {
  if (tx.actions.length === 0) {
    throw new Error("NEAR transaction has no actions");
  }
  const hasTransfer = tx.actions.some((action) => action.type === "Transfer");
  const hasFunctionCall = tx.actions.some((action) => action.type === "FunctionCall");
  if (hasTransfer && hasFunctionCall) {
    throw new Error("NEAR transaction mixes Transfer and FunctionCall actions");
  }
  if (hasTransfer) {
    const transfers = tx.actions.filter((action) => action.type === "Transfer") as Array<{
      type: "Transfer";
      params: { deposit: string };
    }>;
    return {
      kind: "Transfer",
      receiverId: tx.receiverId,
      ...(transfers.length === 1 ? { amount: transfers[0].params.deposit } : {}),
    };
  }
  if (!hasFunctionCall) {
    throw new Error("NEAR transaction has no Transfer or FunctionCall actions");
  }
  return {
    kind: "FunctionCall",
    receiverId: tx.receiverId,
    methodNames: tx.actions.flatMap((action) => {
      if (action.type !== "FunctionCall") return [];
      const methodName = (action.params as { methodName?: unknown } | undefined)?.methodName;
      return typeof methodName === "string" ? [methodName] : [];
    }),
  };
}

export function matchSpecFromActions(input: {
  receiverId: string;
  actions: readonly { params: { methodName: string } }[];
}): ProposalMatchSpec {
  return matchSpecFromTransaction({
    receiverId: input.receiverId,
    actions: input.actions.map((action) => ({
      type: "FunctionCall" as const,
      params: { methodName: action.params.methodName },
    })),
  });
}

export function proposalMatches(proposal: SputnikProposal, expected: ProposalMatchSpec): boolean {
  if (expected.kind === "Transfer") {
    const transfer = proposal.kind?.Transfer;
    if (!transfer) return false;
    if (transfer.receiver_id !== expected.receiverId) return false;
    if (expected.amount != null && transfer.amount !== expected.amount) return false;
    return true;
  }
  const functionCall = proposal.kind?.FunctionCall;
  if (!functionCall) return false;
  if (functionCall.receiver_id !== expected.receiverId) return false;
  const methods = new Set((functionCall.actions ?? []).map((action) => action.method_name));
  return expected.methodNames.every((name) => methods.has(name));
}

export function pickMatchingProposal(
  proposals: readonly SputnikProposal[],
  expected: ProposalMatchSpec,
): SputnikProposal | null {
  return proposals.find((proposal) => proposalMatches(proposal, expected)) ?? null;
}

export async function snapshotLastProposalId(daoId: string): Promise<number> {
  const nextId = await nearViewFunction<number>(daoId, "get_last_proposal_id");
  const parsed = Number(nextId);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Could not read the DAO proposal counter");
  }
  return parsed;
}

async function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function discoverProposal(input: {
  daoId: string;
  fromIndex: number;
  expected: ProposalMatchSpec;
  signal?: AbortSignal;
}): Promise<number> {
  const started = Date.now();
  while (Date.now() - started < PROPOSAL_DISCOVER_TIMEOUT_MS) {
    if (input.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const proposals = await nearViewFunction<SputnikProposal[]>(
      input.daoId,
      "get_proposals",
      { from_index: input.fromIndex, limit: 20 },
    );
    const match = pickMatchingProposal(proposals ?? [], input.expected);
    if (match) return match.id;
    await wait(PROPOSAL_DISCOVER_INTERVAL_MS, input.signal);
  }
  throw new Error(TREZU_PROPOSAL_DISCOVER_TIMEOUT_MESSAGE);
}
