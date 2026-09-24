import {
  Keypair,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
  type Connection,
} from "@solana/web3.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSolanaConnection } from "@/lib/rpc/solana";
import { SOLANA_EXPIRED_MESSAGE } from "./config";
import { setSolanaSigner } from "./session";
import { broadcastSolanaTransaction } from "./transfer";

vi.mock("@/lib/rpc/solana", () => ({
  getSolanaConnection: vi.fn(),
}));

const PLACEHOLDER_BLOCKHASH = "11111111111111111111111111111111";
const EMPTY_SIMULATION_MESSAGE = "Simulation failed. Message: Transaction simulation failed. Logs: []. Catch the `SendTransactionError` and call `getLogs()` on it for full details.";

function unsignedVersioned(blockhash = PLACEHOLDER_BLOCKHASH): VersionedTransaction {
  const message = new TransactionMessage({
    payerKey: Keypair.generate().publicKey,
    recentBlockhash: blockhash,
    instructions: [],
  }).compileToV0Message();
  return new VersionedTransaction(message);
}

describe("broadcastSolanaTransaction", () => {
  const payer = Keypair.generate();
  const freshBlockhash = Keypair.generate().publicKey.toBase58();

  afterEach(() => {
    setSolanaSigner(null);
  });

  function connectionFor(input: {
    blockHeights: number[];
    sendRawTransaction: ReturnType<typeof vi.fn>;
    signedBlockhashes: string[];
  }) {
    let heightIndex = 0;
    const connection = {
      getLatestBlockhash: vi.fn(async () => ({
        blockhash: freshBlockhash,
        lastValidBlockHeight: 100,
      })),
      getBlockHeight: vi.fn(async () => input.blockHeights[Math.min(heightIndex++, input.blockHeights.length - 1)]),
      sendRawTransaction: input.sendRawTransaction,
    } as unknown as Connection;
    vi.mocked(getSolanaConnection).mockReturnValue(connection);
    setSolanaSigner({
      publicKey: payer.publicKey,
      signTransaction: async (tx) => {
        if (tx instanceof VersionedTransaction) {
          input.signedBlockhashes.push(VersionedMessage.deserialize(tx.message.serialize()).recentBlockhash);
        }
        return tx;
      },
    });
    return connection;
  }

  it("signs a versioned transaction with a freshly serialized blockhash", async () => {
    const sendRawTransaction = vi.fn(async () => "sig");
    const signedBlockhashes: string[] = [];
    connectionFor({ blockHeights: [50], sendRawTransaction, signedBlockhashes });

    await expect(broadcastSolanaTransaction(unsignedVersioned())).resolves.toMatchObject({ signature: "sig" });
    expect(signedBlockhashes).toEqual([freshBlockhash]);
    expect(sendRawTransaction).toHaveBeenCalledTimes(1);
  });

  it("rebuilds and signs once when the blockhash expires before send", async () => {
    const sendRawTransaction = vi.fn(async () => "sig");
    const signedBlockhashes: string[] = [];
    const rebuild = vi.fn(async () => unsignedVersioned());
    connectionFor({ blockHeights: [101, 50], sendRawTransaction, signedBlockhashes });

    await expect(broadcastSolanaTransaction(unsignedVersioned(), { rebuild })).resolves.toMatchObject({
      signature: "sig",
    });
    expect(rebuild).toHaveBeenCalledTimes(1);
    expect(sendRawTransaction).toHaveBeenCalledTimes(1);
    expect(signedBlockhashes).toEqual([freshBlockhash, freshBlockhash]);
  });

  it("does not rebuild a second time when the replacement also fails preflight", async () => {
    const sendRawTransaction = vi.fn(async () => {
      throw new Error(EMPTY_SIMULATION_MESSAGE);
    });
    const signedBlockhashes: string[] = [];
    const rebuild = vi.fn(async () => unsignedVersioned());
    connectionFor({ blockHeights: [50], sendRawTransaction, signedBlockhashes });

    await expect(broadcastSolanaTransaction(unsignedVersioned(), { rebuild })).rejects.toThrow(SOLANA_EXPIRED_MESSAGE);
    expect(rebuild).toHaveBeenCalledTimes(1);
    expect(sendRawTransaction).toHaveBeenCalledTimes(2);
  });
});
