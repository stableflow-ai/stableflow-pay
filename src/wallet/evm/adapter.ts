/**
 * EVM wallet adapter backed by wagmi + RainbowKit.
 *
 * Message signing uses ERC-191 (`personal_sign`) after switching onto the
 * target chain so the connector and wagmi connection agree.
 */

import { useCallback, useMemo } from "react";
import { isAddress } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import { useEvmWalletInfo } from "@/hooks/use-evm-wallet-info";
import type { GeneratedIntent, IntentSignInput, IntentSignedPayload, UseWalletResult, WalletAccount } from "../types";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getMatchedEvmWalletClient, readEvmConnectorChainId } from "./switch-chain";
import {
  buildEvmFamilyPayload,
  encodeSecp256k1Signature,
  isoDeadline,
  nonceToBase64,
  payloadAsText,
} from "../intents-sign";

export function useEvmWallet(): UseWalletResult {
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const walletInfo = useEvmWalletInfo();

  const account = useMemo<WalletAccount | null>(() => {
    if (!address) return null;
    return {
      address,
      chainKind: "evm",
      chainId,
      icon: walletInfo.icon || null,
    };
  }, [address, chainId, walletInfo.icon]);

  const signMessage = useCallback(
    async (input: IntentSignInput): Promise<IntentSignedPayload> => {
      if (!address) {
        throw new Error("[wallet:evm] No connected account to sign with.");
      }
      const targetChainId = input.chainId ?? chainId;
      if (targetChainId == null) {
        throw new Error("[wallet:evm] Connect an EVM wallet on a supported network.");
      }
      const payload = buildEvmFamilyPayload(
        input.signerId,
        nonceToBase64(input.nonce),
        isoDeadline(input.deadlineMs),
      );
      const client = await getMatchedEvmWalletClient(targetChainId);
      const signature = await client.signMessage({ message: payload });
      return {
        standard: "erc191",
        payload,
        signature: encodeSecp256k1Signature(signature),
      };
    },
    [address, chainId],
  );

  const signGeneratedIntent = useCallback(
    async (intent: GeneratedIntent): Promise<IntentSignedPayload> => {
      if (!address) {
        throw new Error("[wallet:evm] No connected account to sign with.");
      }
      const targetChainId = (await readEvmConnectorChainId()) ?? chainId;
      if (targetChainId == null) {
        throw new Error("[wallet:evm] Connect an EVM wallet on a supported network.");
      }
      const payload = payloadAsText(intent.payload);
      const client = await getMatchedEvmWalletClient(targetChainId);
      const signature = await client.signMessage({ message: payload });
      return {
        standard: "erc191",
        payload,
        signature: encodeSecp256k1Signature(signature),
      };
    },
    [address, chainId],
  );

  return useMemo<UseWalletResult>(() => ({
    kind: "evm",
    account,
    isConnected: Boolean(isConnected && address),
    isConnecting: isConnecting || isReconnecting,
    connect: () => openConnectModal?.(),
    disconnect,
    signMessage,
    signGeneratedIntent,
    isAddressValid: isAddress,
  }), [
    account,
    address,
    disconnect,
    isConnected,
    isConnecting,
    isReconnecting,
    openConnectModal,
    signMessage,
    signGeneratedIntent,
  ]);
}
