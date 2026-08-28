import { useEffect, useState } from "react";
import { IconLogout } from "@/components/icons/logout";
import { TokenSelectDialog } from "@/components/token-select-dialog/TokenSelectDialog";
import { PAYER_BLOCKCHAINS } from "@/config/chains";
import { useTokenBalance } from "@/hooks/use-token-balances";
import { useConnectedWallets } from "@/hooks/use-wallet";
import { chainLogoUrl } from "@/lib/logo";
import type { IntentsToken } from "@/stores/intents-tokens";
import { useTokenBalancesStore } from "@/stores/token-balances";
import { formatAddress, formatAmount } from "@/utils";
import { TokenSelectButton } from "@/views/payment-links/components/create/TokenSelectButton";
import { ORIGIN_BALANCE_POLL_MS } from "../config";

export function YouPaySection(props: {
  amountDisplay: string;
  fiatDisplay: string;
  originToken: IntentsToken | null;
  onOriginTokenChange: (token: IntentsToken) => void;
  walletAddress: string | null;
  walletConnected: boolean;
  walletIcon?: string | null;
  connecting: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}) {
  const {
    amountDisplay,
    fiatDisplay,
    originToken,
    onOriginTokenChange,
    walletAddress,
    walletConnected,
    walletIcon,
    connecting,
    onConnectWallet,
    onDisconnectWallet,
  } = props;
  const [originDialogOpen, setOriginDialogOpen] = useState(false);
  const balanceOwners = useConnectedWallets();
  const fetchOneBalance = useTokenBalancesStore((s) => s.fetchOne);
  const originBalance = useTokenBalance(walletAddress, originToken?.assetId);
  const chainIcon = originToken ? chainLogoUrl(originToken.blockchain) : "";
  const connectedIcon = walletIcon?.trim() || chainIcon;

  useEffect(() => {
    if (!walletAddress || !originToken) return;
    void fetchOneBalance(walletAddress, originToken);
    const id = window.setInterval(() => {
      void fetchOneBalance(walletAddress, originToken);
    }, ORIGIN_BALANCE_POLL_MS);
    return () => window.clearInterval(id);
  }, [walletAddress, originToken, fetchOneBalance]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="font-montserrat text-sm font-medium capitalize text-[#aaa]">You Pay</p>
        <div className="flex min-w-0 items-center gap-1.5">
          {walletAddress && walletConnected ? (
            <>
              {connectedIcon ? (
                <img src={connectedIcon} alt="" className="size-3 shrink-0 rounded-[2px] object-cover" />
              ) : null}
              <p className="truncate font-montserrat text-xs text-[#606060]">
                {formatAddress(walletAddress)}
              </p>
              <button
                type="button"
                aria-label="Disconnect wallet"
                onClick={onDisconnectWallet}
                className="inline-flex shrink-0 text-danger"
              >
                <IconLogout className="size-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnectWallet}
              disabled={connecting}
              className="font-montserrat text-xs text-black underline-offset-2 hover:underline disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex min-w-0 flex-wrap items-end justify-between gap-3">
        <p className="min-w-0 break-all font-montserrat text-base font-medium text-black">
          {amountDisplay}
        </p>
        <TokenSelectButton token={originToken} onClick={() => setOriginDialogOpen(true)} />
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="font-montserrat text-xs leading-none text-[#9fa7ba]">{fiatDisplay}</p>
        <p className="text-right font-montserrat text-xs leading-none">
          <span className="text-[#9fa7ba]">Balance: </span>
          <span className="text-[#0e3616]">
            {originBalance?.formatted != null ? (
              formatAmount(originBalance.formatted, { prefix: "", maxDecimals: 6, showDust: true })
            ) : originBalance?.status === "loading" ? (
              <span
                className="inline-block size-3 animate-spin rounded-full border-2 border-[#0e3616] border-r-transparent align-middle"
                aria-label="Loading balance"
              />
            ) : (
              "—"
            )}
          </span>
        </p>
      </div>
      <TokenSelectDialog
        open={originDialogOpen}
        onClose={() => setOriginDialogOpen(false)}
        title="You pay with"
        selectedAssetId={originToken?.assetId}
        showBalances
        balanceOwners={balanceOwners}
        allowedBlockchains={PAYER_BLOCKCHAINS}
        onSelect={({ token }) => {
          onOriginTokenChange(token);
          const kind = token.chain.chainKind;
          const owner = kind === "evm" || kind === "near" || kind === "solana" || kind === "tron"
            ? balanceOwners[kind]
            : undefined;
          if (owner) void fetchOneBalance(owner, token);
        }}
      />
    </>
  );
}
