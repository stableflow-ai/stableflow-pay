import type { Address, Hash, Hex } from "viem";
import { waitForTransactionReceipt } from "wagmi/actions";
import { readErc20Allowance } from "./evm/balance";
import { wagmiConfig } from "./evm/config";
import { getMatchedEvmWalletClient } from "./evm/switch-chain";
import { verifyPostApproveAllowance } from "./verify-post-approve-allowance";

type SupportedEvmChainId = (typeof wagmiConfig)["chains"][number]["id"];

function toHexData(callData: string): Hex {
  const trimmed = callData.trim();
  if (!trimmed) throw new Error("Missing call data");
  if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) return trimmed as Hex;
  return `0x${trimmed}` as Hex;
}

export async function broadcastQuickPayCallData(input: {
  chainId: number;
  contract: string;
  callData: string;
  value?: bigint;
}): Promise<Hash> {
  const client = await getMatchedEvmWalletClient(input.chainId);
  return client.sendTransaction({
    to: input.contract as Address,
    data: toHexData(input.callData),
    value: input.value ?? 0n,
    chain: client.chain,
  });
}

export async function broadcastBatchPayCallData(input: {
  chainId: number;
  tokenAddress: string;
  approvals: string[];
  callData: string;
  contract: string;
  owner: string;
  spender: string;
  requiredAmount: bigint;
  network: string;
  value?: bigint;
  verifyAllowance?: boolean;
}): Promise<Hash> {
  const chainId = input.chainId as SupportedEvmChainId;
  const verifyAllowance = input.verifyAllowance !== false;
  let approveBlockNumber: bigint | undefined;
  for (const approval of input.approvals) {
    if (!approval.trim()) continue;
    const hash = await broadcastQuickPayCallData({
      chainId: input.chainId,
      contract: input.tokenAddress,
      callData: approval,
    });
    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId });
    if (receipt.status !== "success") {
      throw new Error("Token approval failed");
    }
    approveBlockNumber = receipt.blockNumber;
  }
  if (verifyAllowance) {
    await verifyPostApproveAllowance({
      requiredAmount: input.requiredAmount,
      readAllowance: () => readErc20Allowance({
        network: input.network,
        tokenAddress: input.tokenAddress as Address,
        owner: input.owner as Address,
        spender: input.spender as Address,
        blockNumber: approveBlockNumber,
      }),
    });
  }
  return broadcastQuickPayCallData({
    chainId: input.chainId,
    contract: input.contract,
    callData: input.callData,
    value: input.value,
  });
}
