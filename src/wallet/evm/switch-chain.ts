import { getAccount, getWalletClient, switchChain } from "wagmi/actions";
import { wagmiConfig } from "./config";
import { isAlreadyOnChain, isChainMismatch, isUserRejected } from "./switch-chain-errors";

type SupportedEvmChainId = (typeof wagmiConfig)["chains"][number]["id"];

function isSupportedEvmChainId(chainId: number): chainId is SupportedEvmChainId {
  return wagmiConfig.chains.some((chain) => chain.id === chainId);
}

export async function readEvmConnectorChainId(): Promise<number | undefined> {
  const connector = getAccount(wagmiConfig).connector;
  if (!connector) return undefined;
  return connector.getChainId();
}

function syncConnectionChain(chainId: SupportedEvmChainId): void {
  const connector = getAccount(wagmiConfig).connector;
  if (!connector) return;
  if (getAccount(wagmiConfig).chainId === chainId) return;
  connector.emitter.emit("change", { chainId });
}

/**
 * Switch the connected EVM wallet onto `chainId` when the wallet and wagmi
 * disagree (e.g. MetaMask 42161 vs RainbowKit connection 137).
 */
export async function ensureEvmChain(chainId: number): Promise<SupportedEvmChainId> {
  if (!isSupportedEvmChainId(chainId)) {
    throw new Error(`Unsupported EVM chain ${chainId}.`);
  }
  const connector = getAccount(wagmiConfig).connector;
  if (!connector) {
    throw new Error("Connect an EVM wallet on a supported network.");
  }

  let connectorChainId = await connector.getChainId();
  if (connectorChainId !== chainId) {
    try {
      await switchChain(wagmiConfig, { chainId, connector });
    } catch (error) {
      if (isAlreadyOnChain(error)) {
        // Wallet is already on the target; still sync wagmi below.
      } else if (isUserRejected(error)) {
        throw new Error("Switch the wallet to the required network and retry.");
      } else {
        throw error;
      }
    }
    connectorChainId = await connector.getChainId();
  }

  if (connectorChainId !== chainId) {
    throw new Error("Switch the wallet to the required network and retry.");
  }

  syncConnectionChain(chainId);
  return chainId;
}

export async function withMatchingEvmChain<T>(
  chainId: number,
  run: (matchedChainId: SupportedEvmChainId) => Promise<T>,
): Promise<T> {
  const matched = await ensureEvmChain(chainId);
  try {
    return await run(matched);
  } catch (error) {
    if (!isChainMismatch(error)) throw error;
    const retried = await ensureEvmChain(chainId);
    return await run(retried);
  }
}

export async function getMatchedEvmWalletClient(chainId: number) {
  return withMatchingEvmChain(chainId, async (matchedChainId) => {
    const client = await getWalletClient(wagmiConfig, { chainId: matchedChainId });
    if (!client) throw new Error("Connect an EVM wallet on a supported network.");
    return client;
  });
}
