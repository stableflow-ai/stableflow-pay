/**
 * EVM native gas-token and ERC-20 transfers to a deposit address.
 */

import { encodeFunctionData, erc20Abi, type Address, type Hash, type Hex } from "viem";
import { getMatchedEvmWalletClient } from "./switch-chain";

async function sendEvm(input: {
  chainId: number;
  to: Address;
  data?: Hex;
  value?: bigint;
}): Promise<Hash> {
  const client = await getMatchedEvmWalletClient(input.chainId);
  return client.sendTransaction({
    to: input.to,
    data: input.data,
    value: input.value ?? 0n,
    chain: client.chain,
  });
}

export async function transferNativeEvm(input: {
  chainId: number;
  to: string;
  amountIn: bigint;
}): Promise<Hash> {
  return sendEvm({
    chainId: input.chainId,
    to: input.to as Address,
    value: input.amountIn,
  });
}

export async function transferErc20(input: {
  chainId: number;
  tokenAddress: string;
  to: string;
  amountIn: bigint;
}): Promise<Hash> {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [input.to as Address, input.amountIn],
  });
  return sendEvm({
    chainId: input.chainId,
    to: input.tokenAddress as Address,
    data,
  });
}
