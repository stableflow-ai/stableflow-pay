export type FundingRouteKind = "DIRECT" | "SAME_CHAIN_SWAP" | "CROSS_CHAIN_SWAP";

export interface RegistryToken {
  assetId: string;
  blockchain: string;
  symbol: string;
  decimals: number;
  contractAddress?: string | null;
}

export interface FundingRoute {
  kind: FundingRouteKind;
  fundingAsset: RegistryToken;
}

export type PrivacyTransferMode = "TRANSFER" | "SWAP";

const aliases: Record<string, string> = {
  ethereum: "eth",
  arbitrum: "arb",
  avalanche: "avax",
  optimism: "op",
  polygon: "pol",
  bitcoin: "btc",
  solana: "sol",
  zcash: "zec",
  bnb: "bsc",
  "bnb chain": "bsc",
  hyperevm: "hypercore",
};

export function normalizeChain(value: string): string {
  const chain = value.trim().toLowerCase();
  return aliases[chain] ?? chain;
}

function contract(value?: string | null): string {
  const v = value?.trim() ?? "";
  return /^0x/i.test(v) ? v.toLowerCase() : v;
}

function nativeNear(token: RegistryToken): boolean {
  return (
    !token.assetId.startsWith("mca:")
    && normalizeChain(token.blockchain) === "near"
    && (["near", "nep141:near"].includes(token.assetId) || token.contractAddress === "near")
  );
}

function matches(source: RegistryToken, registered: RegistryToken): boolean {
  if (normalizeChain(source.blockchain) !== normalizeChain(registered.blockchain)) return false;
  if (source.assetId && source.assetId === registered.assetId) return true;
  if (nativeNear(source)) {
    return ["nep141:wrap.near", "wrap.near"].includes(registered.assetId)
      || registered.contractAddress === "wrap.near";
  }
  const src = contract(source.contractAddress);
  const target = contract(registered.contractAddress);
  if (src && target) return src === target;
  return Boolean(!src && !target && source.symbol.toUpperCase() === registered.symbol.toUpperCase());
}

export function resolveRegistryToken(
  token: RegistryToken,
  registry: readonly RegistryToken[],
): RegistryToken | null {
  return registry.find((item) => matches(token, item)) ?? null;
}

function dedupeRegistry(registry: readonly RegistryToken[]): RegistryToken[] {
  return registry.filter((token, index) =>
    token.blockchain
    && token.assetId
    && registry.findIndex((other) =>
      normalizeChain(other.blockchain) === normalizeChain(token.blockchain)
      && (contract(other.contractAddress) || other.assetId)
        === (contract(token.contractAddress) || token.assetId)
    ) === index
  );
}

export function resolveFundingRoute(
  source: RegistryToken,
  registry: readonly RegistryToken[],
): FundingRoute {
  const tokens = dedupeRegistry(registry);
  const direct = resolveRegistryToken(source, tokens);
  if (direct) return { kind: "DIRECT", fundingAsset: direct };
  const rank = (token: RegistryToken) => {
    const index = ["USDC", "USDT", "USDT0"].indexOf(token.symbol.toUpperCase());
    return index < 0 ? 3 : index;
  };
  const prefer = (list: RegistryToken[]) => [...list].sort((a, b) => rank(a) - rank(b))[0];
  const same = prefer(tokens.filter((token) =>
    normalizeChain(token.blockchain) === normalizeChain(source.blockchain)
  ));
  if (same) return { kind: "SAME_CHAIN_SWAP", fundingAsset: same };
  const cross = prefer(tokens.filter((token) => normalizeChain(token.blockchain) === "near"))
    ?? prefer(tokens);
  if (!cross) throw new Error("No registry funding asset available.");
  return { kind: "CROSS_CHAIN_SWAP", fundingAsset: cross };
}

export function buildFundingRouteCandidates(
  source: RegistryToken,
  destination: RegistryToken,
  preferred: FundingRoute,
  registry: readonly RegistryToken[],
): FundingRoute[] {
  if (preferred.kind !== "DIRECT") return [preferred];
  const tokens = dedupeRegistry(registry);
  const seen = new Set<string>();
  const routes: FundingRoute[] = [];
  const add = (kind: FundingRoute["kind"], asset: RegistryToken | null | undefined) => {
    if (!asset?.assetId || seen.has(asset.assetId)) return;
    seen.add(asset.assetId);
    routes.push({ kind, fundingAsset: asset });
  };
  add("DIRECT", destination);
  const sourceChain = normalizeChain(source.blockchain);
  for (const symbol of ["USDC", "USDT"] as const) {
    add(
      "SAME_CHAIN_SWAP",
      tokens.find((token) =>
        normalizeChain(token.blockchain) === sourceChain && token.symbol.toUpperCase() === symbol
      ),
    );
  }
  return routes;
}

export function derivePrivacyTransferMode(
  preferred: FundingRoute,
  destination: RegistryToken,
): PrivacyTransferMode {
  return preferred.fundingAsset.assetId === destination.assetId ? "TRANSFER" : "SWAP";
}
