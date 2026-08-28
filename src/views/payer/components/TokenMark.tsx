import { chainLogoUrl } from "@/lib/logo";
import { cn } from "@/lib/utils";
import type { IntentsToken } from "@/stores/intents-tokens";
import { formatTokenNetwork } from "@/views/payment-links/utils";

export function TokenMark(props: {
  token: IntentsToken;
  showSymbol?: boolean;
  size?: "sm" | "md";
}) {
  const size = props.size ?? "md";
  const logo = size === "sm" ? "size-4 rounded-[8px]" : "size-5 rounded-[12px]";
  const chain = size === "sm" ? "size-2" : "size-2.5";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("relative shrink-0", size === "sm" ? "size-4" : "size-5")}>
        <img src={props.token.logo} alt="" className={cn(logo, "object-cover")} />
        <img
          src={chainLogoUrl(props.token.blockchain)}
          alt=""
          className={cn(
            "absolute -right-0.5 -bottom-0.5 rounded-[2px] border border-white object-cover",
            chain,
          )}
        />
      </span>
      {props.showSymbol === false ? null : (
        <span className="font-montserrat text-sm font-medium text-black">
          {formatTokenNetwork(props.token.symbol, props.token.blockchain)}
        </span>
      )}
    </span>
  );
}
