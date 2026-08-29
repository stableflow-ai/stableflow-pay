import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { FLOATING_SIDE } from "@/components/ui/overlay/use-floating-position";
import { FIXED_CHAINS, chainLabel, type ChainConfig } from "@/config/chains";
import { cn } from "@/lib/utils";
import type { IntentsToken } from "@/stores/intents-tokens";
import { useWalletStore } from "@/stores/wallet";
import type { WalletChainKind } from "@/utils";
import { sortTokenSelectChains } from "./utils";

export type ChainPaneProps = {
  chainFilter: string;
  onSelectFilter: (filter: string) => void;
  tokens: IntentsToken[];
  lockChainKind?: WalletChainKind | null;
};

function isLocked(chain: ChainConfig, lockChainKind: WalletChainKind | null | undefined): boolean {
  return Boolean(lockChainKind && chain.chainKind !== lockChainKind);
}

export function ChainPane({
  chainFilter,
  onSelectFilter,
  tokens,
  lockChainKind = null,
}: ChainPaneProps) {
  const owners = useWalletStore((state) => state.owners);
  const availableCodes = new Set(tokens.map((token) => token.blockchain));
  const chains = sortTokenSelectChains(
    FIXED_CHAINS.filter((chain) => availableCodes.has(chain.blockchain)),
  );

  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-y-auto py-1">
      {chains.map((chain) => {
        const selected = chainFilter === chain.blockchain;
        const locked = isLocked(chain, lockChainKind);
        const connected = Boolean(owners[chain.chainKind]);
        const button = (
          <button
            type="button"
            disabled={locked}
            aria-label={chain.chainName}
            aria-pressed={selected}
            onClick={() => {
              if (locked) return;
              onSelectFilter(chain.blockchain);
            }}
            className={cn(
              "relative flex h-[61px] w-16 items-center justify-center rounded-[12px]",
              selected && "border border-white bg-[#FDFDFD] shadow-[0_0_40px_0_rgba(0,0,0,0.1)]",
              locked ? "cursor-not-allowed opacity-40" : "cursor-pointer",
              !selected && !locked && "hover:bg-[#F6F6F6]",
            )}
          >
            <span className="relative size-8 shrink-0">
              <img src={chain.logo} alt="" className="size-8 rounded-[6px] object-cover" />
              {connected ? (
                <span
                  className="absolute -right-0.5 -bottom-0.5 size-[9px] rounded-full border border-white bg-[#22C55E]"
                  aria-hidden
                />
              ) : null}
            </span>
          </button>
        );

        if (locked && lockChainKind) {
          return (
            <Tooltip
              key={chain.blockchain}
              side={FLOATING_SIDE.Right}
              content={`Recipient address is on ${chainLabel(lockChainKind)}; edit the recipient to change chain`}
            >
              {button}
            </Tooltip>
          );
        }

        return <span key={chain.blockchain}>{button}</span>;
      })}
    </div>
  );
}
