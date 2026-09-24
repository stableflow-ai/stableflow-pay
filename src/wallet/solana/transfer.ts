/**
 * Solana native SOL and SPL transfers to a deposit address.
 */

import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionExpiredBlockheightExceededError,
  TransactionMessage,
  VersionedTransaction,
  type Connection,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { getSolanaConnection } from "@/lib/rpc/solana";
import {
  SOLANA_ATA_ALLOW_OWNER_OFF_CURVE,
  SOLANA_ATA_INIT_FAILED_MESSAGE,
  SOLANA_EXPIRED_MESSAGE,
  SOLANA_SEND_MAX_RETRIES,
} from "./config";
import { getSolanaSigner } from "./session";

function requireSigner() {
  const signer = getSolanaSigner();
  if (!signer) throw new Error("Connect a Solana wallet to send this payout");
  return signer;
}

function recentBlockhashOf(tx: Transaction | VersionedTransaction): string {
  if (tx instanceof VersionedTransaction) return tx.message.recentBlockhash;
  return tx.recentBlockhash || "";
}

function isExpiredBlockhashError(error: unknown): boolean {
  if (error instanceof TransactionExpiredBlockheightExceededError) return true;
  if (!(error instanceof Error)) return false;
  return /block height exceeded|blockhash not found|blockhash.*expired/i.test(error.message);
}

const ATA_INIT_PATTERN = /failed to initialize the associated token account/i;

function isEmptySimulationMessage(message: string): boolean {
  return /simulation failed/i.test(message)
    && /transaction simulation failed/i.test(message)
    && /logs:\s*\[\s*\]/i.test(message);
}

function hasAnySignature(signature: Uint8Array | Buffer | null | undefined): boolean {
  return !!signature && signature.length > 0 && Array.from(signature).some((byte) => byte !== 0);
}

function isUnsigned(tx: Transaction | VersionedTransaction): boolean {
  if (tx instanceof VersionedTransaction) {
    return tx.signatures.every((signature) => !hasAnySignature(signature));
  }
  return tx.signatures.every(({ signature }) => !hasAnySignature(signature));
}

async function readLogs(error: unknown): Promise<string[]> {
  if (!error || typeof error !== "object") return [];
  const getLogs = (error as { getLogs?: () => unknown }).getLogs;
  if (typeof getLogs !== "function") return [];
  try {
    const result = await getLogs.call(error);
    if (!Array.isArray(result)) return [];
    return result.filter((line): line is string => typeof line === "string");
  } catch {
    return [];
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

function hasFreshLogLines(message: string, logs: string[]): boolean {
  return logs.some((line) => line.trim().length > 0 && !message.includes(line));
}

async function toBroadcastError(error: unknown): Promise<Error> {
  const logs = await readLogs(error);
  const base = errorText(error) || "Solana transfer failed";
  const detail = [base, ...logs].join("\n");
  if (ATA_INIT_PATTERN.test(detail)) return new Error(SOLANA_ATA_INIT_FAILED_MESSAGE);
  if (isExpiredBlockhashError(error) || (isEmptySimulationMessage(base) && !hasFreshLogLines(base, logs))) {
    return new Error(SOLANA_EXPIRED_MESSAGE);
  }
  return error instanceof Error ? error : new Error(base);
}

async function isRetryablePreflightFailure(error: unknown): Promise<boolean> {
  if (error instanceof Error && (
    error.message === SOLANA_EXPIRED_MESSAGE
    || error.message === SOLANA_ATA_INIT_FAILED_MESSAGE
  )) {
    return false;
  }
  if (isExpiredBlockhashError(error)) return true;
  const logs = await readLogs(error);
  const base = errorText(error);
  const detail = [base, ...logs].join("\n");
  if (ATA_INIT_PATTERN.test(detail)) return true;
  return isEmptySimulationMessage(base) && !hasFreshLogLines(base, logs);
}

async function blockhashAlreadyExpired(connection: Connection, lastValidBlockHeight: number): Promise<boolean> {
  try {
    const blockHeight = await connection.getBlockHeight("confirmed");
    return blockHeight > lastValidBlockHeight;
  } catch {
    return false;
  }
}

async function refreshBlockhash(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  feePayer: PublicKey,
): Promise<{ blockhash: string; lastValidBlockHeight: number } | null> {
  if (!isUnsigned(transaction)) return null;
  const latest = await connection.getLatestBlockhash("confirmed");
  if (transaction instanceof VersionedTransaction) {
    (transaction.message as { recentBlockhash: string }).recentBlockhash = latest.blockhash;
  } else {
    transaction.recentBlockhash = latest.blockhash;
    transaction.feePayer = feePayer;
  }
  return latest;
}

/**
 * Broadcast and return, matching the EVM and Tron transfers. Preflight is kept
 * so an underfunded transfer fails before the wallet moves anything; landing is
 * settled by the commit queue and the waiting page, not here.
 *
 * A slow Ledger confirmation can outlive the blockhash. When `rebuild` is set,
 * one fresh transaction is signed after that expiry or a retryable preflight failure.
 */
export async function broadcastSolanaTransaction(
  transaction: Transaction | VersionedTransaction,
  options?: {
    rebuild?: () => Promise<Transaction | VersionedTransaction>;
  },
): Promise<{ signature: string; signed: Transaction | VersionedTransaction }> {
  const signer = requireSigner();
  const connection = getSolanaConnection();
  let current = transaction;
  let rebuilt = false;

  for (;;) {
    const latest = await refreshBlockhash(connection, current, signer.publicKey);
    const signed = await signer.signTransaction(current);
    if (latest && await blockhashAlreadyExpired(connection, latest.lastValidBlockHeight)) {
      if (!rebuilt && options?.rebuild) {
        current = await options.rebuild();
        rebuilt = true;
        continue;
      }
      throw new Error(SOLANA_EXPIRED_MESSAGE);
    }

    try {
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: SOLANA_SEND_MAX_RETRIES,
      });
      return { signature, signed };
    } catch (error) {
      if (!rebuilt && options?.rebuild && await isRetryablePreflightFailure(error)) {
        current = await options.rebuild();
        rebuilt = true;
        continue;
      }
      throw await toBroadcastError(error);
    }
  }
}

export async function buildSolanaDepositTransfer(input: {
  from: string;
  to: string;
  amountIn: bigint;
  mint?: string | null;
}): Promise<VersionedTransaction> {
  const from = new PublicKey(input.from);
  const to = new PublicKey(input.to);
  const connection = getSolanaConnection();
  const { blockhash } = await connection.getLatestBlockhash();
  const mintAddress = input.mint?.trim();
  const instructions = mintAddress
    ? await splTransferInstructions({
        connection,
        from,
        to,
        mint: new PublicKey(mintAddress),
        amountIn: input.amountIn,
      })
    : [
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports: input.amountIn,
        }),
      ];
  const message = new TransactionMessage({
    payerKey: from,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(message);
}

async function splTransferInstructions(input: {
  connection: ReturnType<typeof getSolanaConnection>;
  from: PublicKey;
  to: PublicKey;
  mint: PublicKey;
  amountIn: bigint;
}) {
  const mintInfo = await input.connection.getAccountInfo(input.mint);
  const programId = mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
  const fromTokenAccount = getAssociatedTokenAddressSync(
    input.mint,
    input.from,
    SOLANA_ATA_ALLOW_OWNER_OFF_CURVE,
    programId,
  );
  const toTokenAccount = getAssociatedTokenAddressSync(
    input.mint,
    input.to,
    SOLANA_ATA_ALLOW_OWNER_OFF_CURVE,
    programId,
  );
  const instructions = [];
  try {
    await getAccount(input.connection, toTokenAccount, "confirmed", programId);
  } catch {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        input.from,
        toTokenAccount,
        input.to,
        input.mint,
        programId,
      ),
    );
  }
  instructions.push(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      input.from,
      input.amountIn,
      [],
      programId,
    ),
  );
  return instructions;
}

export async function broadcastSerializedSolanaTx(input: {
  serializedTransaction: string;
  lastValidBlockHeight?: number;
}): Promise<string> {
  const signer = requireSigner();
  const connection = getSolanaConnection();
  const raw = Buffer.from(input.serializedTransaction, "base64");
  let unsigned: Transaction | VersionedTransaction;
  try {
    unsigned = Transaction.from(raw);
  } catch {
    unsigned = VersionedTransaction.deserialize(raw);
  }
  const signed = await signer.signTransaction(unsigned);
  const signature = await connection.sendRawTransaction(signed.serialize());
  const lastValidBlockHeight = input.lastValidBlockHeight
    ?? (await connection.getLatestBlockhash("confirmed")).lastValidBlockHeight;
  try {
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: recentBlockhashOf(signed),
        lastValidBlockHeight,
      },
      "confirmed",
    );
    if (confirmation.value.err) {
      throw new Error(SOLANA_EXPIRED_MESSAGE);
    }
  } catch (error) {
    if (error instanceof Error && error.message === SOLANA_EXPIRED_MESSAGE) throw error;
    if (isExpiredBlockhashError(error)) {
      throw new Error(SOLANA_EXPIRED_MESSAGE);
    }
    throw error;
  }
  return signature;
}

export async function transferNativeSol(input: {
  to: string;
  amountIn: bigint;
}): Promise<string> {
  const signer = requireSigner();
  const build = () => buildSolanaDepositTransfer({
    from: signer.publicKey.toBase58(),
    to: input.to,
    amountIn: input.amountIn,
  });
  const transaction = await build();
  const { signature } = await broadcastSolanaTransaction(transaction, { rebuild: build });
  return signature;
}

export async function transferSpl(input: {
  mint: string;
  to: string;
  amountIn: bigint;
}): Promise<string> {
  const signer = requireSigner();
  const build = () => buildSolanaDepositTransfer({
    from: signer.publicKey.toBase58(),
    to: input.to,
    amountIn: input.amountIn,
    mint: input.mint,
  });
  const transaction = await build();
  const { signature } = await broadcastSolanaTransaction(transaction, { rebuild: build });
  return signature;
}
