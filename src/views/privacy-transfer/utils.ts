import { Big, formatAmount } from "@/utils";
import type { IntentsToken } from "@/stores/intents-tokens";
import type { PrivacyExecutionStage } from "@/lib/confidential/execution-types";
import { PRIVACY_TRANSFER_STAGE_LABEL } from "./config";

export function isPositiveAmount(value: string): boolean {
  try {
    return Big(value.trim()).gt(0);
  } catch {
    return false;
  }
}

export function formatTokenAmount(raw: string, token: IntentsToken, maxDecimals = 6): string {
  return formatAmount(raw, {
    decimals: token.decimals,
    prefix: "",
    maxDecimals: Math.min(maxDecimals, token.decimals),
    showDust: true,
  });
}

export function formatTokenNetwork(symbol: string, network: string): string {
  return `${symbol} · ${network}`;
}

export function privacyTransferError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

/** EVM linking: prefer the source token chain, then the destination chain. */
export function pickLinkingEvmChainId(input: {
  linkingKind: string;
  source?: { chainKind: string; chainId?: number };
  destination?: { chainKind: string; chainId?: number };
}): number | undefined {
  if (input.linkingKind !== "evm") return undefined;
  if (input.source?.chainKind === "evm" && input.source.chainId != null) {
    return input.source.chainId;
  }
  if (input.destination?.chainKind === "evm" && input.destination.chainId != null) {
    return input.destination.chainId;
  }
  return undefined;
}

export function privacyStageLabel(stage: PrivacyExecutionStage): string {
  return PRIVACY_TRANSFER_STAGE_LABEL[stage];
}
