import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { IconClose } from "@/components/icons/close";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { Overlay } from "@/components/ui/overlay/Overlay";
import {
  DESKTOP_MEDIA_QUERY,
  OVERLAY_DIALOG_PANEL_FADE_SECONDS,
} from "@/components/ui/overlay/config";
import { useEnsureTokenBalances } from "@/hooks/use-token-balances";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getRuntimeChains } from "@/config/chains";
import { CHAIN_KINDS, type ChainOwners } from "@/wallet";
import { isNativeToken, useIntentsTokensStore, type IntentsToken } from "@/stores/intents-tokens";
import { useTokenBalancesStore } from "@/stores/token-balances";
import type { WalletChainKind } from "@/utils";
import { ChainPane } from "./chain-pane";
import { TOKEN_BALANCE_POLL_MS, TOKEN_SELECT_TITLE } from "./config";
import { TokenPane } from "./token-pane";
import { defaultTokenSelectChain, sortTokenSelectChains, tokenBalanceUsd } from "./utils";

export interface TokenSelectSelection {
  token: IntentsToken;
}

export interface TokenSelectDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  selectedAssetId?: string | null;
  showBalances?: boolean;
  balanceOwners?: ChainOwners;
  allowedBlockchains?: string[] | null;
  lockChainKind?: WalletChainKind | null;
  excludeNative?: boolean;
  requireSupport?: "payment" | "receive";
  onSelect: (selection: TokenSelectSelection) => void;
}

function ownerForToken(owners: ChainOwners | null | undefined, token: IntentsToken): string | null {
  return owners?.[token.chain.chainKind] ?? null;
}

function hasAnyOwner(owners: ChainOwners | null | undefined): boolean {
  return CHAIN_KINDS.some((kind) => Boolean(owners?.[kind]));
}

export function TokenSelectDialog({
  open,
  onClose,
  title = TOKEN_SELECT_TITLE,
  selectedAssetId,
  showBalances = false,
  balanceOwners = {},
  allowedBlockchains = null,
  lockChainKind = null,
  excludeNative = false,
  requireSupport,
  onSelect,
}: TokenSelectDialogProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const owners = showBalances ? balanceOwners : {};
  const tokens = useIntentsTokensStore((s) => s.tokens);
  const loading = useIntentsTokensStore((s) => s.loading);
  const getBalance = useTokenBalancesStore((s) => s.getBalance);
  const balanceEntries = useTokenBalancesStore((s) => s.balances);
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState("");

  const selected = useMemo(
    () => tokens.find((token) => token.assetId === selectedAssetId),
    [tokens, selectedAssetId],
  );

  const allowed = useMemo(() => {
    if (!allowedBlockchains || allowedBlockchains.length === 0) return null;
    return new Set(allowedBlockchains.map((code) => code.toLowerCase()));
  }, [allowedBlockchains]);

  const scopedTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (allowed && !allowed.has(token.blockchain.toLowerCase())) return false;
      if (excludeNative && isNativeToken(token)) return false;
      if (requireSupport === "payment" && !token.supportPayment) return false;
      if (requireSupport === "receive" && !token.supportReceive) return false;
      return true;
    });
  }, [tokens, allowed, excludeNative, requireSupport]);

  const availableChains = useMemo(() => {
    const codes = new Set(scopedTokens.map((token) => token.blockchain));
    return sortTokenSelectChains(getRuntimeChains().filter((chain) => codes.has(chain.blockchain)));
  }, [scopedTokens]);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setChainFilter("");
  }, [open]);

  useEffect(() => {
    if (!open || availableChains.length === 0) return;
    if (chainFilter && availableChains.some((chain) => chain.blockchain === chainFilter)) return;
    setChainFilter(defaultTokenSelectChain(availableChains, selected?.blockchain, lockChainKind));
  }, [open, availableChains, selected, lockChainKind, chainFilter]);

  useEnsureTokenBalances({
    owners,
    tokens: scopedTokens,
    enabled: showBalances && open && hasAnyOwner(owners) && scopedTokens.length > 0,
    pollMs: TOKEN_BALANCE_POLL_MS,
  });

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedTokens.filter((token) => {
      if (!chainFilter || token.blockchain !== chainFilter) return false;
      if (!q) return true;
      if (token.symbol.toLowerCase().includes(q)) return true;
      if (token.providerSymbol.toLowerCase().includes(q)) return true;
      if (token.chain.chainName.toLowerCase().includes(q)) return true;
      if (token.contractAddress?.toLowerCase().includes(q)) return true;
      return false;
    }).slice().sort((a, b) => {
      const bySymbol = a.symbol.localeCompare(b.symbol) || a.chain.chainName.localeCompare(b.chain.chainName);
      if (!showBalances) return bySymbol;
      const aUsd = tokenBalanceUsd(a, getBalance(ownerForToken(owners, a), a.assetId)?.formatted);
      const bUsd = tokenBalanceUsd(b, getBalance(ownerForToken(owners, b), b.assetId)?.formatted);
      if (bUsd !== aUsd) return bUsd - aUsd;
      return bySymbol;
    });
  }, [scopedTokens, chainFilter, search, showBalances, owners, getBalance, balanceEntries]);

  const selectedChain = useMemo(
    () => availableChains.find((chain) => chain.blockchain === chainFilter) ?? availableChains[0] ?? null,
    [availableChains, chainFilter],
  );

  function handleSelectToken(token: IntentsToken) {
    onSelect({ token });
    onClose();
  }

  function tokenBalance(token: IntentsToken) {
    return getBalance(ownerForToken(owners, token), token.assetId)?.formatted;
  }

  function tokenBalanceLoading(token: IntentsToken) {
    const owner = ownerForToken(owners, token);
    if (!owner) return false;
    const entry = getBalance(owner, token.assetId);
    return entry?.formatted == null && (!entry || entry.status === "loading");
  }

  const body = (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="w-20 shrink-0 overflow-y-auto">
        <ChainPane
          chainFilter={chainFilter}
          onSelectFilter={setChainFilter}
          tokens={scopedTokens}
          lockChainKind={lockChainKind}
        />
      </div>
      <div className="w-px shrink-0 bg-[#E3E3E3]" aria-hidden />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-2.5 pt-3 pb-2">
        <TokenPane
          search={search}
          onSearchChange={setSearch}
          tokens={filteredTokens}
          selectedAssetId={selectedAssetId}
          loading={loading}
          showBalances={showBalances}
          getBalance={tokenBalance}
          isBalanceLoading={tokenBalanceLoading}
          selectedChain={selectedChain}
          onSelectToken={handleSelectToken}
        />
      </div>
    </div>
  );

  if (!isDesktop) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        side={DRAWER_SIDE.Bottom}
        title={title}
        cardClassName="max-h-[85vh]"
        contentClassName="flex min-h-[320px] overflow-hidden"
      >
        {body}
      </Drawer>
    );
  }

  return (
    <Overlay open={open} onClose={onClose}>
      <div className="pointer-events-none relative flex size-full items-center justify-center p-4">
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: OVERLAY_DIALOG_PANEL_FADE_SECONDS, delay: 0 },
          }}
          exit={{
            opacity: 0,
            transition: { duration: OVERLAY_DIALOG_PANEL_FADE_SECONDS, delay: 0 },
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative flex h-[min(617px,90vh)] w-full max-w-[420px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_0_40px_0_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#E3E3E3] px-6">
              <p className="font-montserrat text-lg font-semibold text-black">{title}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="shrink-0 cursor-pointer text-black"
              >
                <IconClose className="size-3.25" />
              </button>
            </div>
            {body}
          </div>
        </motion.div>
      </div>
    </Overlay>
  );
}

export default TokenSelectDialog;
