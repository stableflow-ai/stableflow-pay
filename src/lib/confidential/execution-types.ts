import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import type { PrivacyQuotePlan } from "@/lib/confidential/plan";

export type PrivacyExecutionStage =
  | "created"
  | "funding_pending_confirmation"
  | "funded"
  | "deposit_confirmed"
  | "signing"
  | "submit_pending_confirmation"
  | "submitted"
  | "completed"
  | "failed";

export interface PrivacyWithdrawProgress {
  address: string;
  memo?: string;
  recipient: string;
  amount: string;
  status: string;
}

export interface PrivacyExecutionSnapshot {
  version: 1;
  id: string;
  plan: PrivacyQuotePlan;
  stage: PrivacyExecutionStage;
  baseline?: string;
  creditedAmount?: string;
  receiptTxHash?: string;
  orderId?: string;
  withdraws: PrivacyWithdrawProgress[];
  error?: string;
  updatedAt: number;
}

export function canResumePrivacyExecution(stage: PrivacyExecutionStage): boolean {
  return stage !== "completed" && stage !== "failed" && stage !== "funding_pending_confirmation";
}

export function createPrivacyExecutionSnapshot(plan: PrivacyQuotePlan): PrivacyExecutionSnapshot {
  return {
    version: 1,
    id: plan.id,
    plan,
    stage: "created",
    withdraws: [],
    updatedAt: Date.now(),
  };
}

export function snapshotDigest(snapshot: PrivacyExecutionSnapshot): string {
  return bytesToHex(sha256(new TextEncoder().encode(JSON.stringify({
    id: snapshot.id,
    stage: snapshot.stage,
    plan: snapshot.plan.digest,
  }))));
}
