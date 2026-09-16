import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import * as nearintentsApi from "@/api/nearintents";
import { QUICK_PAY_SLIPPAGE_TOLERANCE } from "@/config/payout";
import {
  PRIVACY_TRANSFER_MAX_QUOTE_AGE_MS,
  PRIVACY_TRANSFER_QUOTE_DEADLINE_MS,
} from "@/lib/confidential/config";
import {
  buildFundingRouteCandidates,
  derivePrivacyTransferMode,
  resolveFundingRoute,
  type FundingRoute,
  type PrivacyTransferMode,
  type RegistryToken,
} from "@/lib/confidential/routing";
import { randomFraction, splitConfidentialRawAmount } from "@/lib/confidential/split-amount";
import { toIntentsAccountId } from "@/lib/confidential/to-intents-account-id";
import {
  NEARINTENTS_CONFIDENTIALITY,
  NEARINTENTS_DEPOSIT_TYPE,
  NEARINTENTS_RECIPIENT_TYPE,
  NEARINTENTS_SWAP_TYPE,
  type IntentsChainKind,
  type NearintentsQuoteResp,
} from "@/types/nearintents";
import { Big, sameAddress } from "@/utils";
import { isAddressValid } from "@/utils/address";
import type { IntentsToken } from "@/stores/intents-tokens";
import type { ChainKind } from "@/wallet";

export type PrivacyFundingSource = "wallet" | "balance";

export interface PrivacyWithdrawPreview {
  recipient: string;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
}

export interface PrivacyQuotePlan {
  version: 1;
  id: string;
  createdAt: number;
  expiresAt: number;
  mode: PrivacyTransferMode;
  fundingSource: PrivacyFundingSource;
  signerId: string;
  linkingKind: IntentsChainKind;
  linkingAddress: string;
  sourceWalletAddress: string;
  sourceWalletKind: ChainKind;
  sourceToken: IntentsToken;
  destinationToken: IntentsToken;
  amountRaw: string;
  slippageBps: number;
  recipients: string[];
  route: FundingRoute;
  depositQuote?: NearintentsQuoteResp;
  fundingAmount: string;
  randomValues: number[];
  previews: PrivacyWithdrawPreview[];
  withdrawalQuotes?: NearintentsQuoteResp[];
  expectedOut: string;
  minAmountOut: string;
  digest: string;
}

function toRegistry(token: IntentsToken): RegistryToken {
  return {
    assetId: token.assetId,
    blockchain: token.blockchain,
    symbol: token.symbol,
    decimals: token.decimals,
    contractAddress: token.contractAddress,
  };
}

function toMinorAmount(amount: string, decimals: number): string {
  const raw = new Big(amount).times(new Big(10).pow(decimals)).round(0, Big.roundDown).toFixed(0);
  if (!/^[1-9]\d*$/.test(raw)) throw new Error("Amount must be a positive integer in token units.");
  return raw;
}

function quoteDeadlineIso(now = Date.now()): string {
  return new Date(now + PRIVACY_TRANSFER_QUOTE_DEADLINE_MS).toISOString();
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function planDigest(plan: Omit<PrivacyQuotePlan, "digest"> | PrivacyQuotePlan): string {
  const { digest: _digest, ...body } = plan as PrivacyQuotePlan;
  return bytesToHex(sha256(new TextEncoder().encode(canonical(body))));
}

export function validatePrivacyRecipients(
  addresses: readonly string[],
  destination: IntentsToken,
): string[] {
  if (addresses.length < 1 || addresses.length > 10) {
    throw new Error("A batch requires 1 to 10 recipients.");
  }
  const seen = new Set<string>();
  return addresses.map((value) => {
    const address = value.trim();
    if (!address) throw new Error("Recipient address is required.");
    if (!isAddressValid(address, destination.blockchain)) {
      throw new Error("Invalid recipient address for the destination chain.");
    }
    const key = destination.chain.chainKind === "evm" ? address.toLowerCase() : address;
    if (seen.has(key)) throw new Error("Duplicate recipient address.");
    seen.add(key);
    return address;
  });
}

export function assertFailedRetryRecipients(
  next: readonly string[],
  previous: readonly string[],
  destination: IntentsToken,
): string[] {
  const validated = validatePrivacyRecipients(next, destination);
  for (const address of validated) {
    const allowed = previous.some((item) => sameAddress(item, address, destination.chain.chainKind));
    if (!allowed) {
      throw new Error("Retry recipients must be a subset of the original addresses.");
    }
  }
  return validated;
}

export function createPrivacyQuoteRequest(input: {
  sourceToken: IntentsToken;
  destinationToken: IntentsToken;
  amount: string;
  recipients: string[];
  fundingSource: PrivacyFundingSource;
  linkingKind: IntentsChainKind;
  linkingAddress: string;
  sourceWalletAddress: string;
  sourceWalletKind: ChainKind;
  registry: readonly IntentsToken[];
  slippageBps?: number;
}): Promise<PrivacyQuotePlan> {
  return createPrivacyQuotePlan(input);
}

export async function createPrivacyQuotePlan(input: {
  sourceToken: IntentsToken;
  destinationToken: IntentsToken;
  amount: string;
  recipients: string[];
  fundingSource: PrivacyFundingSource;
  linkingKind: IntentsChainKind;
  linkingAddress: string;
  sourceWalletAddress: string;
  sourceWalletKind: ChainKind;
  registry: readonly IntentsToken[];
  slippageBps?: number;
}): Promise<PrivacyQuotePlan> {
  const slippageBps = input.slippageBps ?? QUICK_PAY_SLIPPAGE_TOLERANCE;
  const recipients = validatePrivacyRecipients(input.recipients, input.destinationToken);
  const amountRaw = toMinorAmount(input.amount, input.sourceToken.decimals);
  splitConfidentialRawAmount(amountRaw, recipients.length, Array(recipients.length - 1).fill(0.5));

  const registry = input.registry.map(toRegistry);
  const source = toRegistry(input.sourceToken);
  const destination = toRegistry(input.destinationToken);
  const preferred = resolveFundingRoute(source, registry);
  if (input.fundingSource === "balance" && preferred.kind !== "DIRECT") {
    throw new Error("Existing confidential balance must be a registered asset.");
  }
  if (preferred.kind !== "DIRECT") {
    throw new Error("This source token is not registered for a direct confidential deposit.");
  }

  const mode = derivePrivacyTransferMode(preferred, destination);
  const signerId = toIntentsAccountId(input.linkingAddress, input.linkingKind);
  const now = Date.now();
  const randomValues = Array.from({ length: recipients.length - 1 }, randomFraction);

  const candidates = (input.fundingSource === "balance" ? [preferred] : buildFundingRouteCandidates(
    source,
    destination,
    preferred,
    registry,
  ).filter((candidate) => mode !== "TRANSFER" || candidate.fundingAsset.assetId === destination.assetId));
  if (candidates.length === 0) throw new Error("No funding route candidates available.");

  let lastError: unknown;
  let funded: {
    fundingAmount: string;
    depositQuote?: NearintentsQuoteResp;
    previews: PrivacyWithdrawPreview[];
    withdrawalQuotes: NearintentsQuoteResp[];
    route: FundingRoute;
  } | undefined;

  for (const candidate of candidates) {
    try {
      funded = await quoteDepositAndWithdrawals({
        amountRaw,
        recipients,
        signerId,
        sourceAsset: preferred.fundingAsset,
        destination,
        destinationToken: input.destinationToken,
        route: candidate,
        balanceSource: input.fundingSource === "balance",
        randomValues,
        slippageBps,
        sourceWalletAddress: input.sourceWalletAddress,
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!funded) {
    throw lastError instanceof Error ? lastError : new Error("Unable to quote deposit and withdrawal.");
  }

  let expiresAt = now + PRIVACY_TRANSFER_MAX_QUOTE_AGE_MS;
  for (const value of [funded.depositQuote?.quote?.deadline]) {
    if (value) {
      const timestamp = Date.parse(value);
      if (Number.isFinite(timestamp)) expiresAt = Math.min(expiresAt, timestamp);
    }
  }
  for (const quote of funded.withdrawalQuotes) {
    const timestamp = quote.quote?.deadline ? Date.parse(quote.quote.deadline) : NaN;
    if (Number.isFinite(timestamp)) expiresAt = Math.min(expiresAt, timestamp);
  }
  if (expiresAt <= Date.now()) throw new Error("Quote expired while quoting.");

  const unsigned: Omit<PrivacyQuotePlan, "digest"> = {
    version: 1,
    id: crypto.randomUUID(),
    createdAt: now,
    expiresAt,
    mode,
    fundingSource: input.fundingSource,
    signerId,
    linkingKind: input.linkingKind,
    linkingAddress: input.linkingAddress.trim(),
    sourceWalletAddress: input.sourceWalletAddress.trim(),
    sourceWalletKind: input.sourceWalletKind,
    sourceToken: input.sourceToken,
    destinationToken: input.destinationToken,
    amountRaw,
    slippageBps,
    recipients,
    route: funded.route,
    depositQuote: funded.depositQuote,
    fundingAmount: funded.fundingAmount,
    randomValues,
    previews: funded.previews,
    ...(input.fundingSource === "balance" ? { withdrawalQuotes: funded.withdrawalQuotes } : {}),
    expectedOut: funded.previews.reduce((sum, row) => sum + BigInt(row.amountOut), 0n).toString(),
    minAmountOut: funded.previews.reduce((sum, row) => sum + BigInt(row.minAmountOut), 0n).toString(),
  };
  return { ...unsigned, digest: planDigest(unsigned) };
}

async function quoteDepositAndWithdrawals(input: {
  amountRaw: string;
  recipients: string[];
  signerId: string;
  sourceAsset: RegistryToken;
  destination: RegistryToken;
  destinationToken: IntentsToken;
  route: FundingRoute;
  balanceSource: boolean;
  randomValues: number[];
  slippageBps: number;
  sourceWalletAddress: string;
}): Promise<{
  fundingAmount: string;
  depositQuote?: NearintentsQuoteResp;
  previews: PrivacyWithdrawPreview[];
  withdrawalQuotes: NearintentsQuoteResp[];
  route: FundingRoute;
}> {
  let fundingAmount = input.amountRaw;
  let depositQuote: NearintentsQuoteResp | undefined;
  if (!input.balanceSource) {
    if (input.route.kind !== "DIRECT") {
      throw new Error("Same-chain and cross-chain funding swaps are not available in this release.");
    }
    depositQuote = await nearintentsApi.nearintentsQuote({
      dry: false,
      swapType: NEARINTENTS_SWAP_TYPE.ExactInput,
      originAsset: input.sourceAsset.assetId,
      destinationAsset: input.route.fundingAsset.assetId,
      amount: input.amountRaw,
      recipient: input.signerId,
      recipientType: NEARINTENTS_RECIPIENT_TYPE.ConfidentialIntents,
      refundTo: input.sourceWalletAddress,
      depositType: NEARINTENTS_DEPOSIT_TYPE.OriginChain,
      refundType: NEARINTENTS_DEPOSIT_TYPE.OriginChain,
      confidentiality: NEARINTENTS_CONFIDENTIALITY.Advanced,
      deadline: quoteDeadlineIso(),
      slippageTolerance: input.slippageBps,
    });
    const amountOut = depositQuote.quote?.amountOut?.trim();
    if (!amountOut) throw new Error("Deposit quote is missing amountOut.");
    fundingAmount = amountOut;
  }

  const shares = splitConfidentialRawAmount(fundingAmount, input.recipients.length, input.randomValues);
  const withdrawalQuotes: NearintentsQuoteResp[] = [];
  const previews = await Promise.all(input.recipients.map(async (recipient, index) => {
    const dry = !input.balanceSource;
    const quote = await nearintentsApi.nearintentsQuote({
      dry,
      swapType: NEARINTENTS_SWAP_TYPE.ExactInput,
      originAsset: input.route.fundingAsset.assetId,
      destinationAsset: input.destination.assetId,
      amount: shares[index]!,
      recipient,
      recipientType: NEARINTENTS_RECIPIENT_TYPE.DestinationChain,
      refundTo: input.signerId,
      depositType: NEARINTENTS_DEPOSIT_TYPE.ConfidentialIntents,
      refundType: NEARINTENTS_DEPOSIT_TYPE.ConfidentialIntents,
      confidentiality: NEARINTENTS_CONFIDENTIALITY.Advanced,
      deadline: quoteDeadlineIso(),
      slippageTolerance: input.slippageBps,
    }, { requireDeposit: !dry });
    const amountOut = quote.quote?.amountOut;
    if (!amountOut) throw new Error("Withdrawal preview is missing amountOut.");
    if (input.balanceSource) withdrawalQuotes.push(quote);
    return {
      recipient,
      amountIn: shares[index]!,
      amountOut,
      minAmountOut: quote.quote?.amountOut ?? amountOut,
    };
  }));
  return { fundingAmount, depositQuote, previews, withdrawalQuotes, route: input.route };
}
