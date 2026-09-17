import { PublicKey } from "@solana/web3.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IntentsToken } from "@/stores/intents-tokens";
import { pendingSquadsMultisigBroadcast } from "./types";
import { transferToDepositAddress } from "./transfer-deposit";

const INNER = { inner: true };
const MEMBER = "Member1111111111111111111111111111111111111";
const VAULT = "Vault11111111111111111111111111111111111111";

vi.mock("./solana/transfer", () => ({
  buildSolanaDepositTransfer: vi.fn(async () => INNER),
  broadcastSolanaTransaction: vi.fn(async () => ({ signature: "sig", signed: INNER })),
}));

vi.mock("./solana/multisig", () => ({
  activeSquadsMode: vi.fn(() => null),
  sendViaSquads: vi.fn(),
  sendViaSquadsSdk: vi.fn(),
}));

vi.mock("./solana/session", () => ({
  getSolanaSigner: vi.fn(),
  getSquadsSdkBinding: vi.fn(),
}));

import { activeSquadsMode, sendViaSquads, sendViaSquadsSdk } from "./solana/multisig";
import { getSolanaSigner, getSquadsSdkBinding } from "./solana/session";
import { broadcastSolanaTransaction, buildSolanaDepositTransfer } from "./solana/transfer";

const solToken = {
  assetId: "native:sol",
  decimals: 9,
  blockchain: "sol",
  symbol: "SOL",
  providerSymbol: "SOL",
  price: 1,
  contractAddress: null,
  chain: {
    blockchain: "sol",
    chainName: "Solana",
    chainKind: "solana",
    logo: "",
    payerEnabled: true,
    batchEnabled: true,
    txExplorer: "https://solscan.io/tx/",
  },
  logo: "",
} as IntentsToken;

describe("transferToDepositAddress Solana Squads", () => {
  beforeEach(() => {
    vi.mocked(activeSquadsMode).mockReturnValue(null);
    vi.mocked(sendViaSquads).mockReset();
    vi.mocked(sendViaSquadsSdk).mockReset();
    vi.mocked(broadcastSolanaTransaction).mockClear();
    vi.mocked(buildSolanaDepositTransfer).mockClear();
    vi.mocked(getSolanaSigner).mockReturnValue({
      publicKey: { toBase58: () => MEMBER } as PublicKey,
      signTransaction: async (tx) => tx,
    });
    vi.mocked(getSquadsSdkBinding).mockReturnValue(null);
  });

  it("broadcasts an EOA transfer as executed", async () => {
    await expect(transferToDepositAddress({
      token: solToken,
      depositAddress: "Deposit1111111111111111111111111111111111",
      amountIn: 10n,
    })).resolves.toEqual({ kind: "executed", txHash: "sig" });
    expect(buildSolanaDepositTransfer).toHaveBeenCalledWith(expect.objectContaining({ from: MEMBER }));
    expect(broadcastSolanaTransaction).toHaveBeenCalledWith(INNER);
    expect(sendViaSquads).not.toHaveBeenCalled();
    expect(sendViaSquadsSdk).not.toHaveBeenCalled();
  });

  it("sends through SquadsX wrap", async () => {
    vi.mocked(activeSquadsMode).mockReturnValue("squadsx");
    vi.mocked(sendViaSquads).mockResolvedValue(pendingSquadsMultisigBroadcast({ vaultAddress: MEMBER }));
    await expect(transferToDepositAddress({
      token: solToken,
      depositAddress: "Deposit1111111111111111111111111111111111",
      amountIn: 10n,
    })).resolves.toEqual(pendingSquadsMultisigBroadcast({ vaultAddress: MEMBER }));
    expect(sendViaSquads).toHaveBeenCalledWith(INNER);
    expect(sendViaSquadsSdk).not.toHaveBeenCalled();
    expect(broadcastSolanaTransaction).not.toHaveBeenCalled();
  });

  it("proposes through the Squads SDK from the vault", async () => {
    vi.mocked(activeSquadsMode).mockReturnValue("sdk");
    vi.mocked(getSquadsSdkBinding).mockReturnValue({
      member: MEMBER,
      vaultAddress: VAULT,
      multisigPda: "Pda11111111111111111111111111111111111111",
      vaultIndex: 0,
    });
    vi.mocked(sendViaSquadsSdk).mockResolvedValue(pendingSquadsMultisigBroadcast({
      vaultAddress: VAULT,
      multisigPda: "Pda11111111111111111111111111111111111111",
      transactionIndex: 8n,
    }));
    await expect(transferToDepositAddress({
      token: solToken,
      depositAddress: "Deposit1111111111111111111111111111111111",
      amountIn: 10n,
    })).resolves.toMatchObject({
      kind: "pending-multisig",
      chainKind: "solana",
      vaultAddress: VAULT,
    });
    expect(buildSolanaDepositTransfer).toHaveBeenCalledWith(expect.objectContaining({ from: VAULT }));
    expect(sendViaSquadsSdk).toHaveBeenCalledWith(INNER);
    expect(sendViaSquads).not.toHaveBeenCalled();
    expect(broadcastSolanaTransaction).not.toHaveBeenCalled();
  });
});
