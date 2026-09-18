import type { PendingMultisigBroadcast } from "@/wallet/types";
import {
  PAYER_DEADLINE_QUERY,
  PAYER_MS_CHAIN_QUERY,
  PAYER_MS_DAO_QUERY,
  PAYER_MS_INDEX_QUERY,
  PAYER_MS_KIND_QUERY,
  PAYER_MS_PDA_QUERY,
  PAYER_MS_PROPOSAL_QUERY,
  PAYER_MS_SAFE_QUERY,
  PAYER_MS_TX_QUERY,
  PAYER_MS_VAULT_QUERY,
  PAYER_SWAP_QUERY,
} from "./config";

export function parseWaitingMultisig(search: URLSearchParams): {
  swapId: string;
  proposal: PendingMultisigBroadcast;
  deadline: string;
} | null {
  const swapId = search.get(PAYER_SWAP_QUERY)?.trim() ?? "";
  const kind = search.get(PAYER_MS_KIND_QUERY)?.trim() ?? "";
  const deadline = search.get(PAYER_DEADLINE_QUERY)?.trim() ?? "";
  if (!swapId || !kind) return null;
  if (kind === "evm") {
    const safeAddress = search.get(PAYER_MS_SAFE_QUERY)?.trim() ?? "";
    const safeTxHash = search.get(PAYER_MS_TX_QUERY)?.trim() ?? "";
    const chainId = Number(search.get(PAYER_MS_CHAIN_QUERY));
    if (!safeAddress || !safeTxHash || !Number.isFinite(chainId)) return null;
    return {
      swapId,
      deadline,
      proposal: {
        kind: "pending-multisig",
        chainKind: "evm",
        safeAddress,
        safeTxHash,
        chainId,
      },
    };
  }
  if (kind === "near") {
    const daoId = search.get(PAYER_MS_DAO_QUERY)?.trim() ?? "";
    const proposalId = Number(search.get(PAYER_MS_PROPOSAL_QUERY));
    if (!daoId || !Number.isFinite(proposalId) || proposalId < 0) return null;
    return {
      swapId,
      deadline,
      proposal: {
        kind: "pending-multisig",
        chainKind: "near",
        daoId,
        proposalId,
      },
    };
  }
  if (kind === "solana") {
    const vaultAddress = search.get(PAYER_MS_VAULT_QUERY)?.trim() ?? "";
    if (!vaultAddress) return null;
    const multisigPda = search.get(PAYER_MS_PDA_QUERY)?.trim() || undefined;
    const indexRaw = search.get(PAYER_MS_INDEX_QUERY)?.trim() ?? "";
    const transactionIndex = indexRaw ? BigInt(indexRaw) : undefined;
    return {
      swapId,
      deadline,
      proposal: {
        kind: "pending-multisig",
        chainKind: "solana",
        vaultAddress,
        ...(multisigPda ? { multisigPda } : {}),
        ...(transactionIndex != null ? { transactionIndex } : {}),
      },
    };
  }
  return null;
}

export function dropWaitingMultisig(search: URLSearchParams) {
  search.delete(PAYER_SWAP_QUERY);
  search.delete(PAYER_DEADLINE_QUERY);
  search.delete(PAYER_MS_KIND_QUERY);
  search.delete(PAYER_MS_SAFE_QUERY);
  search.delete(PAYER_MS_TX_QUERY);
  search.delete(PAYER_MS_CHAIN_QUERY);
  search.delete(PAYER_MS_DAO_QUERY);
  search.delete(PAYER_MS_PROPOSAL_QUERY);
  search.delete(PAYER_MS_VAULT_QUERY);
  search.delete(PAYER_MS_PDA_QUERY);
  search.delete(PAYER_MS_INDEX_QUERY);
}
