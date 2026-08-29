import { FIXED_CHAINS, type ChainConfig } from "@/config/chains";
import type { IntentsToken } from "@/stores/intents-tokens";
import type { WalletChainKind } from "@/utils";
import { TOKEN_SELECT_CHAIN_TITLES, TOKEN_SELECT_KIND_RANK } from "./config";

export function tokenSelectChainTitle(chain: Pick<ChainConfig, "blockchain" | "chainName">): string {
  return TOKEN_SELECT_CHAIN_TITLES[chain.blockchain] ?? chain.chainName;
}

/** Near, then EVM (registry order), then Solana, then Tron. */
export function sortTokenSelectChains(chains: readonly ChainConfig[]): ChainConfig[] {
  const fixedIndex = new Map(FIXED_CHAINS.map((chain, index) => [chain.blockchain, index]));
  return chains.slice().sort((a, b) => {
    const kindDiff = (TOKEN_SELECT_KIND_RANK[a.chainKind] ?? 99) - (TOKEN_SELECT_KIND_RANK[b.chainKind] ?? 99);
    if (kindDiff !== 0) return kindDiff;
    return (fixedIndex.get(a.blockchain) ?? 99) - (fixedIndex.get(b.blockchain) ?? 99);
  });
}

export function defaultTokenSelectChain(
  available: readonly ChainConfig[],
  selectedBlockchain?: string | null,
  lockChainKind?: WalletChainKind | null,
): string {
  if (selectedBlockchain && available.some((chain) => chain.blockchain === selectedBlockchain)) {
    return selectedBlockchain;
  }
  if (lockChainKind) {
    const locked = available.find((chain) => chain.chainKind === lockChainKind);
    if (locked) return locked.blockchain;
  }
  return available[0]?.blockchain ?? "";
}


/** USD value of a token balance using `/v0/tokens` price. Unknown balance is -1 (sort last). */
export function tokenBalanceUsd(
  token: Pick<IntentsToken, "price">,
  formatted: string | null | undefined,
): number {
  if (formatted == null || formatted === "") return -1;
  const amount = Number(formatted);
  if (!Number.isFinite(amount)) return -1;
  const price = Number(token.price);
  return amount * (Number.isFinite(price) ? price : 0);
}
