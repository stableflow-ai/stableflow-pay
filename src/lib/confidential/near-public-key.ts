import { nearViewFunction } from "@/lib/rpc/near";
import { INTENTS_RECIPIENT, encodeEd25519 } from "@/wallet/intents-sign";
import { broadcastNearActions } from "@/wallet/near/transfer";
import { getNearSelector } from "@/wallet/near/session";

const ADD_PUBLIC_KEY_GAS = "30000000000000";

function isImplicitNearAccount(accountId: string): boolean {
  return /^[0-9a-f]{64}$/i.test(accountId.trim());
}

async function walletPublicKey(accountId: string): Promise<string> {
  const selector = getNearSelector();
  if (!selector) throw new Error("Connect a NEAR wallet to register the Intents public key.");
  const wallet = await selector.wallet();
  const accounts = await wallet.getAccounts();
  const match = accounts.find((account) => account.accountId.toLowerCase() === accountId.toLowerCase())
    ?? accounts[0];
  const raw = match?.publicKey?.trim();
  if (!raw) {
    throw new Error("NEAR wallet did not expose a public key. Reconnect the wallet and try again.");
  }
  return encodeEd25519(raw);
}

/**
 * Named NEAR accounts must add their signing key on intents.near before
 * submit-intent. Implicit 64-hex accounts skip this.
 */
export async function ensureNearIntentsPublicKey(accountId: string): Promise<void> {
  const signer = accountId.trim();
  if (!signer) throw new Error("NEAR account is required.");
  if (isImplicitNearAccount(signer)) return;

  const publicKey = await walletPublicKey(signer);
  const registered = await nearViewFunction<boolean>(INTENTS_RECIPIENT, "has_public_key", {
    account_id: signer,
    public_key: publicKey,
  });
  if (registered === true) return;

  await broadcastNearActions({
    receiverId: INTENTS_RECIPIENT,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: "add_public_key",
          args: { public_key: publicKey },
          gas: ADD_PUBLIC_KEY_GAS,
          deposit: "1",
        },
      },
    ],
  });

  const confirmed = await nearViewFunction<boolean>(INTENTS_RECIPIENT, "has_public_key", {
    account_id: signer,
    public_key: publicKey,
  });
  if (confirmed !== true) {
    throw new Error("NEAR signing key registration is not confirmed.");
  }
}
