/**
 * Send origin tokens to the 1Click deposit address returned by single swap.
 *
 * EVM Safe and NEAR Trezu / SputnikDAO can return `pending-multisig`. Other
 * chains always resolve to an executed transaction hash.
 */

import { isNativeToken, isNearWrappedGasToken, type IntentsToken } from "@/stores/intents-tokens";
import { transferErc20, transferNativeEvm } from "./evm/transfer";
import { executedBroadcast, type BroadcastResult } from "./types";
import { transferFt, transferNativeNear, transferNearViaWrap } from "./near/transfer";
import { transferNativeSol, transferSpl } from "./solana/transfer";
import { transferNativeTrx, transferTrc20 } from "./tron/transfer";
import { transferNativeZec } from "./zec/transfer";

export async function transferToDepositAddress(input: {
  token: IntentsToken;
  depositAddress: string;
  amountIn: bigint;
}): Promise<BroadcastResult> {
  const { token, depositAddress, amountIn } = input;
  const to = depositAddress.trim();
  if (!to) throw new Error("Missing deposit address");
  if (amountIn <= 0n) throw new Error("Invalid transfer amount");

  const kind = token.chain.chainKind;
  const native = isNativeToken(token);

  if (kind === "evm") {
    const chainId = token.chain.chainId;
    if (!chainId) throw new Error("Missing EVM chain id");
    if (native) {
      return transferNativeEvm({ chainId, to, amountIn });
    }
    if (!token.contractAddress) throw new Error("Missing token contract address");
    return transferErc20({
      chainId,
      tokenAddress: token.contractAddress,
      to,
      amountIn,
    });
  }

  if (kind === "solana") {
    if (native) return executedBroadcast(await transferNativeSol({ to, amountIn }));
    if (!token.contractAddress) throw new Error("Missing token mint");
    return executedBroadcast(await transferSpl({ mint: token.contractAddress, to, amountIn }));
  }

  if (kind === "near") {
    if (isNearWrappedGasToken(token)) {
      if (!token.contractAddress) throw new Error("Missing token contract");
      return transferNearViaWrap({ tokenContract: token.contractAddress, to, amountIn });
    }
    if (native) return transferNativeNear({ to, amountIn });
    if (!token.contractAddress) throw new Error("Missing token contract");
    return transferFt({ tokenContract: token.contractAddress, to, amountIn });
  }

  if (kind === "tron") {
    if (native) return executedBroadcast(await transferNativeTrx({ to, amountIn }));
    if (!token.contractAddress) throw new Error("Missing token contract");
    return executedBroadcast(await transferTrc20({ contractAddress: token.contractAddress, to, amountIn }));
  }

  if (kind === "zec") {
    if (!native) throw new Error("Zcash only supports native ZEC");
    return executedBroadcast(await transferNativeZec({ to, amountIn, decimals: token.decimals }));
  }

  throw new Error(`Unsupported origin chain: ${kind}`);
}
