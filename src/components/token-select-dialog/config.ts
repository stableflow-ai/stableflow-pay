import type { ChainKind } from "@/wallet";

export const TOKEN_BALANCE_POLL_MS = 60_000;

export const TOKEN_SELECT_TITLE = "Select Network & Token";

export const TOKEN_SEARCH_PLACEHOLDER = "search name or paste address";

/** Icon-rail kind order: Near, then EVM, then Solana, then Tron. */
export const TOKEN_SELECT_KIND_ORDER: ChainKind[] = ["near", "evm", "solana", "tron"];

export const TOKEN_SELECT_KIND_RANK: Record<ChainKind, number> = {
  near: 0,
  evm: 1,
  solana: 2,
  tron: 3,
};

/** Display titles that differ from `ChainConfig.chainName`. */
export const TOKEN_SELECT_CHAIN_TITLES: Record<string, string> = {
  near: "Near Protocol",
};
