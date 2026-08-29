import type { MouseEvent } from "react";
import { IconLogout } from "@/components/icons/logout";
import { IconWallet } from "@/components/icons/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/utils";
import type { ChainKind } from "@/wallet";

function stop(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function ChainWalletStatus({ kind }: { kind: ChainKind }) {
  const wallet = useWallet(kind);
  const address = wallet.account?.address;
  const walletIcon = wallet.account?.icon?.trim() || "";

  if (!address) {
    return (
      <button
        type="button"
        onClick={(event) => {
          stop(event);
          wallet.connect();
        }}
        className="flex h-8 shrink-0 cursor-pointer items-center rounded-full border border-[#D9D9D9] bg-white px-3 font-montserrat text-xs font-medium text-black hover:bg-[#F6F6F6]"
      >
        {wallet.isConnecting ? "Connecting…" : "Connect"}
      </button>
    );
  }

  return (
    <div
      className="flex h-8 max-w-[134px] shrink-0 items-center gap-1.5 rounded-full border border-[#D9D9D9] bg-white px-2.5"
      onClick={stop}
    >
      {walletIcon ? (
        <img src={walletIcon} alt="" className="size-3.5 shrink-0 rounded-[2px] object-cover" />
      ) : (
        <IconWallet className="size-3.5 shrink-0 text-[#606060]" />
      )}
      <span className="min-w-0 truncate font-montserrat text-xs font-medium text-[#606060]">
        {formatAddress(address)}
      </span>
      <button
        type="button"
        aria-label="Disconnect"
        onClick={(event) => {
          stop(event);
          wallet.disconnect();
        }}
        className="shrink-0 cursor-pointer text-[#606060] hover:text-black"
      >
        <IconLogout className="size-3" />
      </button>
    </div>
  );
}
