/**
 * Broadcast a batch swap transaction on the origin chain.
 *
 * EVM Safe and NEAR Trezu / SputnikDAO can return `pending-multisig`. Other
 * chains always resolve to an executed transaction hash.
 */

import type { PayBatchSwapTransaction } from "@/types/payout";
import { isNativeToken, type IntentsToken } from "@/stores/intents-tokens";
import { broadcastBatchPayCallData } from "./broadcast-quick-pay";
import { executedBroadcast, type BroadcastResult } from "./types";
import { broadcastNearActions } from "./near/transfer";
import { broadcastSerializedSolanaTx } from "./solana/transfer";
import { readTrc20Allowance } from "./tron/balance";
import { ensureTronLedgerBlindSigning } from "./tron/ledger-blind-sign";
import { broadcastTronCallData, waitForTronApproveReady, waitForTronSuccess } from "./tron/transfer";

export async function broadcastBatchPayout(input: {
  token: IntentsToken;
  transaction: PayBatchSwapTransaction;
  amountIn: bigint;
  payer: string;
}): Promise<BroadcastResult> {
  const kind = input.token.chain.chainKind;
  if (kind === "evm") return broadcastEvm(input);
  if (kind === "tron") return broadcastTron(input);
  if (kind === "near") return broadcastNear(input);
  if (kind === "solana") return broadcastSolana(input);
  throw new Error("Unsupported batch origin chain");
}

async function broadcastEvm(input: {
  token: IntentsToken;
  transaction: PayBatchSwapTransaction;
  amountIn: bigint;
  payer: string;
}): Promise<BroadcastResult> {
  const tx = input.transaction;
  const chainId = input.token.chain.chainId;
  if (!chainId) throw new Error("Missing EVM chain id");
  if (!tx.batch_contract?.trim() || !tx.callData?.trim()) {
    throw new Error("Missing batch transaction");
  }
  const native = isNativeToken(input.token);
  return broadcastBatchPayCallData({
    chainId,
    tokenAddress: input.token.contractAddress ?? "",
    approvals: tx.approvals ?? [],
    callData: tx.callData,
    contract: tx.batch_contract,
    owner: input.payer,
    spender: tx.batch_contract,
    requiredAmount: input.amountIn,
    network: input.token.blockchain,
    value: native ? input.amountIn : 0n,
    verifyAllowance: !native,
  });
}

async function broadcastTron(input: {
  token: IntentsToken;
  transaction: PayBatchSwapTransaction;
  amountIn: bigint;
  payer: string;
}): Promise<BroadcastResult> {
  const tx = input.transaction;
  if (!tx.batch_contract?.trim() || !tx.callData?.trim()) {
    throw new Error("Missing batch transaction");
  }
  const native = isNativeToken(input.token);
  await ensureTronLedgerBlindSigning({
    callData: tx.callData,
    callValue: native ? input.amountIn : 0n,
  });
  for (const approval of tx.approvals ?? []) {
    if (!approval.trim()) continue;
    const tokenAddress = input.token.contractAddress?.trim();
    if (!tokenAddress) throw new Error("Missing origin token contract");
    const hash = await broadcastTronCallData({
      contract: tokenAddress,
      callData: approval,
      callValue: 0n,
    });
    if (native) {
      await waitForTronSuccess(hash);
      continue;
    }
    await waitForTronApproveReady({
      txid: hash,
      requiredAmount: input.amountIn,
      readAllowance: () => readTrc20Allowance({
        tokenContract: tokenAddress,
        owner: input.payer,
        spender: tx.batch_contract,
      }),
    });
  }
  return executedBroadcast(await broadcastTronCallData({
    contract: tx.batch_contract,
    callData: tx.callData,
    callValue: native ? input.amountIn : 0n,
  }));
}

async function broadcastNear(input: {
  transaction: PayBatchSwapTransaction;
}): Promise<BroadcastResult> {
  const tx = input.transaction;
  const receiverId = tx.receiverId?.trim();
  if (!receiverId || !tx.actions?.length) {
    throw new Error("Missing batch transaction");
  }
  return broadcastNearActions({
    receiverId,
    actions: tx.actions,
  });
}

async function broadcastSolana(input: {
  transaction: PayBatchSwapTransaction;
}): Promise<BroadcastResult> {
  const serialized = input.transaction.serializedTransaction?.trim();
  if (!serialized) throw new Error("Missing batch transaction");
  return executedBroadcast(await broadcastSerializedSolanaTx({
    serializedTransaction: serialized,
    lastValidBlockHeight: input.transaction.lastValidBlockHeight,
  }));
}
