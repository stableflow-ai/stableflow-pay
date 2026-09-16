import type { ChainKind, IntentSignedPayload } from "@/wallet";

export type IntentsChainKind = Exclude<ChainKind, "zec">;

export const NEARINTENTS_INTENT_STANDARD: Record<IntentsChainKind, "erc191" | "nep413" | "raw_ed25519" | "tip191"> = {
  evm: "erc191",
  near: "nep413",
  solana: "raw_ed25519",
  tron: "tip191",
};

export const NEARINTENTS_DEPOSIT_TYPE = {
  OriginChain: "ORIGIN_CHAIN",
  ConfidentialIntents: "CONFIDENTIAL_INTENTS",
} as const;

export const NEARINTENTS_RECIPIENT_TYPE = {
  ConfidentialIntents: "CONFIDENTIAL_INTENTS",
  DestinationChain: "DESTINATION_CHAIN",
} as const;

export const NEARINTENTS_SWAP_TYPE = {
  ExactInput: "EXACT_INPUT",
} as const;

export const NEARINTENTS_CONFIDENTIALITY = {
  Advanced: "advanced",
} as const;

export const NEARINTENTS_INTENT_TYPE = {
  SwapTransfer: "swap_transfer",
} as const;

export interface NearintentsQuoteParam {
  dry: boolean;
  swapType: "EXACT_INPUT" | "EXACT_OUTPUT" | "FLEX_INPUT";
  originAsset: string;
  depositType: "ORIGIN_CHAIN" | "CONFIDENTIAL_INTENTS";
  destinationAsset: string;
  amount: string;
  recipient: string;
  recipientType: "CONFIDENTIAL_INTENTS" | "DESTINATION_CHAIN";
  refundTo: string;
  refundType: "ORIGIN_CHAIN" | "CONFIDENTIAL_INTENTS";
  confidentiality: "advanced";
  deadline: string;
  slippageTolerance: number;
}

export interface NearintentsQuoteResp {
  correlationId?: string;
  message?: string;
  quote?: {
    depositAddress?: string;
    depositMemo?: string;
    amountIn?: string;
    amountOut?: string;
    deadline?: string;
  };
}

export interface NearintentsGenerateIntentParam {
  type: "swap_transfer";
  standard: string;
  signerId: string;
  depositAddress: string;
}

export interface NearintentsGenerateIntentResp {
  intent: {
    standard: string;
    payload: unknown;
  };
  correlationId?: string;
}

export interface NearintentsSubmitIntentParam {
  type: "swap_transfer";
  signedData: IntentSignedPayload;
}

export interface NearintentsSubmitIntentResp {
  intentHash?: string;
  correlationId?: string;
}

export const NEARINTENTS_STATUS = {
  PendingDeposit: "PENDING_DEPOSIT",
  KnownDepositTx: "KNOWN_DEPOSIT_TX",
  Processing: "PROCESSING",
  IncompleteDeposit: "INCOMPLETE_DEPOSIT",
  Success: "SUCCESS",
  Refunded: "REFUNDED",
  Failed: "FAILED",
} as const;

export interface NearintentsStatusTxHash {
  hash?: string;
  explorerUrl?: string;
}

export interface NearintentsStatusResp {
  status?: string;
  updatedAt?: string;
  swapDetails?: {
    amountInUsd?: string;
    amountOutUsd?: string;
    amountOut?: string;
    depositedAmount?: string;
    originChainTxHashes?: NearintentsStatusTxHash[];
    destinationChainTxHashes?: NearintentsStatusTxHash[];
  };
}

export interface PrivateWithdrawRow {
  amount: string;
  deposit_address: string;
  destination_address: string;
  destination_chain: string;
  execution_type: "CONFIDENTIAL_1CLICK";
  sequence: number;
  signed_payload: IntentSignedPayload;
  token: string;
}

export interface PrivateWithdrawRequest {
  from_amount: string;
  from_chain: string;
  from_token: string;
  mode: "TRANSFER" | "SWAP";
  signer_id: string;
  withdraws: PrivateWithdrawRow[];
}

export interface PrivateOrder {
  order_id: string;
  signer_id?: string;
  status?: string;
  transactions?: Array<{ deposit_address?: string; status?: string; transaction_type?: string }>;
}

export interface PrivateOrderPage {
  list: PrivateOrder[];
  hasNextPage: boolean;
}
