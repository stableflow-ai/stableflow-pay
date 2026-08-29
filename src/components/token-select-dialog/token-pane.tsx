import type { ChainConfig } from "@/config/chains";
import { SearchInput } from "@/components/ui/search-input/SearchInput";
import { cn } from "@/lib/utils";
import type { IntentsToken } from "@/stores/intents-tokens";
import { formatAmount } from "@/utils";
import { ChainWalletStatus } from "./chain-wallet-status";
import { TOKEN_SEARCH_PLACEHOLDER } from "./config";
import { tokenBalanceUsd, tokenSelectChainTitle } from "./utils";

export type TokenPaneProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tokens: IntentsToken[];
  selectedAssetId?: string | null;
  loading: boolean;
  showBalances?: boolean;
  getBalance: (token: IntentsToken) => string | null | undefined;
  isBalanceLoading: (token: IntentsToken) => boolean;
  selectedChain?: ChainConfig | null;
  onSelectToken: (token: IntentsToken) => void;
};

export function TokenPane({
  search,
  onSearchChange,
  tokens,
  selectedAssetId,
  loading,
  showBalances = false,
  getBalance,
  isBalanceLoading,
  selectedChain = null,
  onSelectToken,
}: TokenPaneProps) {
  const walletKind = selectedChain?.chainKind;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
        <p className="min-w-0 truncate font-montserrat text-base font-semibold text-black">
          {selectedChain ? tokenSelectChainTitle(selectedChain) : ""}
        </p>
        {walletKind === "evm" || walletKind === "near" || walletKind === "solana" || walletKind === "tron" ? (
          <ChainWalletStatus kind={walletKind} />
        ) : null}
      </div>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={TOKEN_SEARCH_PLACEHOLDER}
        className="shrink-0"
        inputClassName="rounded-[6px] border-[#E3E3E3] bg-[#F6F6F6] placeholder:text-black/30"
      />
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loading && tokens.length === 0 ? (
          <p className="px-1 py-4 font-montserrat text-[13px] text-[#606060]">Loading tokens…</p>
        ) : null}
        {!loading && tokens.length === 0 ? (
          <p className="px-1 py-4 font-montserrat text-[13px] text-[#606060]">No tokens found</p>
        ) : null}
        {tokens.map((token) => {
          const selected = token.assetId === selectedAssetId;
          const formatted = showBalances ? getBalance(token) : null;
          const loadingBalance = showBalances && isBalanceLoading(token);
          const usd = showBalances && !loadingBalance && formatted != null
            ? tokenBalanceUsd(token, formatted)
            : -1;
          return (
            <button
              key={token.assetId}
              type="button"
              onClick={() => onSelectToken(token)}
              className={cn(
                "flex min-h-[49px] w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left hover:bg-[#F6F6F6]",
                selected && "bg-[#F6F6F6]",
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <img src={token.logo} alt="" className="size-[26px] shrink-0 rounded-full object-cover" />
                <span className="truncate font-montserrat text-sm font-medium text-black">{token.symbol}</span>
              </span>
              {showBalances ? (
                <span className="shrink-0 text-right">
                  {loadingBalance ? (
                    <span
                      className="inline-block size-3.5 animate-spin rounded-full border-2 border-[#606060] border-r-transparent"
                      aria-label="Loading balance"
                    />
                  ) : formatted != null ? (
                    <>
                      <span className="block font-montserrat text-sm font-medium text-[#444C59]">
                        {formatAmount(formatted, { prefix: "", maxDecimals: 4 })}
                      </span>
                      {usd >= 0 ? (
                        <span className="block font-montserrat text-[10px] font-normal text-[#9FA7BA]">
                          {formatAmount(usd, { prefix: "$", showDust: true })}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="font-montserrat text-sm text-[#606060]">—</span>
                  )}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
