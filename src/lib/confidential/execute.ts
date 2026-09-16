import { getPrivateOrders, submitPrivateWithdraws } from "@/api/private-indexer";
import * as nearintentsApi from "@/api/nearintents";
import { PRIVACY_TRANSFER_POLL_INTERVAL_MS } from "@/lib/confidential/config";
import type { PrivacyExecutionSnapshot } from "@/lib/confidential/execution-types";
import { planDigest } from "@/lib/confidential/plan";
import { ensureNearIntentsPublicKey } from "@/lib/confidential/near-public-key";
import { getPrivateBalances, privateAvailableForToken } from "@/lib/confidential/one-click-auth";
import { splitConfidentialRawAmount } from "@/lib/confidential/split-amount";
import {
  NEARINTENTS_CONFIDENTIALITY,
  NEARINTENTS_DEPOSIT_TYPE,
  NEARINTENTS_INTENT_STANDARD,
  NEARINTENTS_INTENT_TYPE,
  NEARINTENTS_RECIPIENT_TYPE,
  NEARINTENTS_SWAP_TYPE,
  type IntentsChainKind,
  type NearintentsQuoteResp,
  type PrivateWithdrawRow,
} from "@/types/nearintents";
import { getNearintentsAccessToken } from "@/stores/nearintents-user-session";
import { transferToDepositAddress } from "@/wallet/transfer-deposit";
import { useWalletStore } from "@/stores/wallet";
import type { GeneratedIntent, IntentSignedPayload } from "@/wallet";

const SUCCESS = new Set(["SUCCESS", "COMPLETED", "SOURCE-CONFIRMED"]);
const FAILURE = new Set(["FAILED", "REFUNDED", "EXPIRED", "CANCELLED"]);

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("Local operation cancelled."));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}

async function pollUntil<T>(
  operation: () => Promise<{ done: boolean; value: T }>,
  signal?: AbortSignal,
): Promise<T> {
  for (;;) {
    if (signal?.aborted) throw new Error("Local operation cancelled.");
    const result = await operation();
    if (result.done) return result.value;
    await delay(PRIVACY_TRANSFER_POLL_INTERVAL_MS, signal);
  }
}

async function requireAccessToken(signerId: string): Promise<string> {
  const token = await getNearintentsAccessToken(signerId);
  if (!token) throw new Error("Confidential session is missing. Sign with the linking wallet.");
  return token;
}

export async function runPrivacyTransfer(
  snapshot: PrivacyExecutionSnapshot,
  save: (next: PrivacyExecutionSnapshot) => Promise<void>,
  signal?: AbortSignal,
): Promise<PrivacyExecutionSnapshot> {
  let current = snapshot;
  const persist = async (next: PrivacyExecutionSnapshot) => {
    current = { ...next, updatedAt: Date.now() };
    await save(current);
  };
  const plan = current.plan;
  if (plan.digest !== planDigest(plan)) throw new Error("Plan was modified.");
  if (current.stage === "completed" || current.stage === "failed") return current;

  const signerKind = plan.linkingKind;
  const accessToken = await requireAccessToken(plan.signerId);

  if (current.stage === "created") {
    const balances = await getPrivateBalances(accessToken);
    current.baseline = privateAvailableForToken(balances, plan.route.fundingAsset.assetId);
    if (plan.fundingSource === "balance") {
      const available = BigInt(current.baseline || "0");
      if (available < BigInt(plan.amountRaw)) throw new Error("Insufficient confidential balance.");
      current.creditedAmount = plan.amountRaw;
      current.stage = "deposit_confirmed";
      await persist(current);
    } else {
      const deposit = plan.depositQuote?.quote;
      if (!deposit?.depositAddress || !deposit.amountIn) {
        throw new Error("Deposit quote is missing a deposit address.");
      }
      current.stage = "funding_pending_confirmation";
      await persist(current);
      const txHash = await transferToDepositAddress({
        token: plan.sourceToken,
        depositAddress: deposit.depositAddress,
        amountIn: BigInt(deposit.amountIn),
      });
      current.receiptTxHash = txHash;
      current.stage = "funded";
      await persist(current);
    }
  }

  if (current.stage === "funding_pending_confirmation") {
    throw new Error("Funding broadcast is unconfirmed. Do not send again; resume after the deposit is found.");
  }

  if (current.stage === "funded") {
    const deposit = plan.depositQuote?.quote;
    if (!deposit?.depositAddress) throw new Error("Deposit quote is missing a deposit address.");
    const credited = await pollUntil(async () => {
      const status = await nearintentsApi.nearintentsStatus(deposit.depositAddress!, {
        depositMemo: deposit.depositMemo,
      });
      const normalized = normalizeStatus(status.status ?? "");
      if (FAILURE.has(normalized)) {
        current.stage = "failed";
        current.error = `Confidential deposit: ${normalized}.`;
        await persist(current);
        throw new Error(current.error);
      }
      if (!SUCCESS.has(normalized)) return { done: false, value: "0" };
      const amount = status.swapDetails?.amountOut;
      if (!amount || BigInt(amount) <= 0n) {
        throw new Error("Successful deposit is missing its credited output amount.");
      }
      return { done: true, value: amount };
    }, signal);
    await pollUntil(async () => {
      const balances = await getPrivateBalances(accessToken);
      const available = BigInt(privateAvailableForToken(balances, plan.route.fundingAsset.assetId) || "0");
      const needed = BigInt(current.baseline ?? "0") + BigInt(credited);
      return { done: available >= needed, value: available.toString() };
    }, signal);
    current.creditedAmount = credited;
    current.stage = "deposit_confirmed";
    await persist(current);
  }

  if (current.stage === "submit_pending_confirmation") {
    if (plan.fundingSource === "balance") {
      current.stage = "submitted";
      await persist(current);
    } else {
      const order = await findMatchingOrder(current);
      if (!order) {
        throw new Error("Withdraw submission is awaiting confirmation. Automatic resubmission is disabled.");
      }
      current.orderId = order.order_id;
      current.stage = "submitted";
      await persist(current);
    }
  }

  if (current.stage === "deposit_confirmed" || current.stage === "signing") {
    current.stage = "signing";
    await persist(current);
    const credited = current.creditedAmount!;
    const shares = splitConfidentialRawAmount(credited, plan.recipients.length, plan.randomValues);
    if (signerKind === "near") {
      await ensureNearIntentsPublicKey(plan.signerId);
    }
    const quotes: NearintentsQuoteResp[] =
      plan.fundingSource === "balance" && plan.withdrawalQuotes?.length === plan.recipients.length
        ? plan.withdrawalQuotes
        : await Promise.all(plan.recipients.map(async (recipient, index) => {
        return nearintentsApi.nearintentsQuote({
          dry: false,
          swapType: NEARINTENTS_SWAP_TYPE.ExactInput,
          originAsset: plan.route.fundingAsset.assetId,
          destinationAsset: plan.destinationToken.assetId,
          amount: shares[index]!,
          recipient,
          recipientType: NEARINTENTS_RECIPIENT_TYPE.DestinationChain,
          refundTo: plan.signerId,
          depositType: NEARINTENTS_DEPOSIT_TYPE.ConfidentialIntents,
          refundType: NEARINTENTS_DEPOSIT_TYPE.ConfidentialIntents,
          confidentiality: NEARINTENTS_CONFIDENTIALITY.Advanced,
          deadline: new Date(Date.now() + 3_600_000).toISOString(),
          slippageTolerance: plan.slippageBps,
        });
      }));
    const rows: PrivateWithdrawRow[] = [];
    for (let i = 0; i < quotes.length; i++) {
      if (signal?.aborted) throw new Error("Local operation cancelled.");
      const quote = quotes[i]!;
      const depositAddress = quote.quote?.depositAddress?.trim();
      if (!depositAddress) throw new Error("Withdrawal quote is missing a deposit address.");
      const generated = await nearintentsApi.nearintentsGenerateIntent({
        type: NEARINTENTS_INTENT_TYPE.SwapTransfer,
        standard: NEARINTENTS_INTENT_STANDARD[signerKind],
        signerId: plan.signerId,
        depositAddress,
      });
      if (!generated.intent) throw new Error("generate-intent did not return a payload.");
      const signed = await signIntent(signerKind, generated.intent);
      rows.push({
        amount: quote.quote?.amountOut ?? shares[i]!,
        deposit_address: depositAddress,
        destination_address: plan.recipients[i]!,
        destination_chain: plan.destinationToken.blockchain,
        execution_type: "CONFIDENTIAL_1CLICK",
        sequence: i,
        signed_payload: signed,
        token: plan.destinationToken.assetId,
      });
    }
    current.withdraws = rows.map((row, index) => ({
      address: row.deposit_address,
      memo: quotes[index]?.quote?.depositMemo,
      recipient: row.destination_address,
      amount: row.amount,
      status: "PENDING",
    }));
    current.stage = "submit_pending_confirmation";
    await persist(current);

    if (plan.fundingSource === "balance") {
      for (let i = 0; i < rows.length; i++) {
        const result = await nearintentsApi.nearintentsSubmitIntent({
          type: NEARINTENTS_INTENT_TYPE.SwapTransfer,
          signedData: rows[i]!.signed_payload,
        });
        if (!result.intentHash?.trim()) throw new Error("Submission returned no intent hash.");
        current.withdraws[i]!.status = "SUBMITTED";
        await persist(current);
      }
      current.stage = "submitted";
      await persist(current);
    } else {
      const orderId = await submitPrivateWithdraws({
        from_amount: plan.amountRaw,
        from_chain: plan.sourceToken.blockchain,
        from_token: plan.sourceToken.assetId,
        mode: plan.mode,
        signer_id: plan.signerId,
        withdraws: rows,
      });
      current.orderId = orderId;
      current.stage = "submitted";
      await persist(current);
    }
  }

  if (current.stage === "submitted") {
    await pollUntil(async () => {
      for (const row of current.withdraws) {
        if (SUCCESS.has(row.status) || FAILURE.has(row.status)) continue;
        const status = await nearintentsApi.nearintentsStatus(row.address, { depositMemo: row.memo });
        row.status = normalizeStatus(status.status ?? row.status);
        await persist(current);
      }
      const terminal = current.withdraws.every((row) =>
        SUCCESS.has(row.status) || FAILURE.has(row.status)
      );
      if (terminal) {
        current.stage = current.withdraws.every((row) => SUCCESS.has(row.status)) ? "completed" : "failed";
        if (current.stage === "failed") current.error = "One or more withdrawals failed.";
        await persist(current);
      }
      return { done: terminal, value: current };
    }, signal);
  }

  return current;
}

async function findMatchingOrder(snapshot: PrivacyExecutionSnapshot) {
  for (let page = 0; page < 20; page++) {
    const result = await getPrivateOrders(snapshot.plan.signerId, 50, page * 50);
    const matches = result.list.filter((order) =>
      (!order.signer_id || order.signer_id === snapshot.plan.signerId)
      && snapshot.withdraws.length > 0
      && snapshot.withdraws.every((row) =>
        order.transactions?.some((tx) => tx.deposit_address === row.address)
      )
    );
    if (matches.length > 1) throw new Error("Multiple orders match the saved withdrawal.");
    if (matches[0]) return matches[0];
    if (!result.hasNextPage) return undefined;
  }
  return undefined;
}

async function signIntent(kind: IntentsChainKind, intent: { standard: string; payload: unknown }): Promise<IntentSignedPayload> {
  return useWalletStore.getState().signGeneratedIntent(kind, intent as GeneratedIntent);
}
