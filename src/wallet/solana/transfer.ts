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
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { getSolanaConnection } from "@/lib/rpc/solana";
import { SOLANA_ATA_ALLOW_OWNER_OFF_CURVE, SOLANA_EXPIRED_MESSAGE, SOLANA_SEND_MAX_RETRIES } from "./config";
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

/**
 * Broadcast and return, matching the EVM and Tron transfers. Preflight is kept
 * so an underfunded transfer fails before the wallet moves anything; landing is
 * settled by the commit queue and the waiting page, not here.
 */
export async function broadcastSolanaTransaction(
  transaction: Transaction | VersionedTransaction,
): Promise<{ signature: string; signed: Transaction | VersionedTransaction }> {
  const signer = requireSigner();
  const connection = getSolanaConnection();
  if (transaction instanceof Transaction) {
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = signer.publicKey;
  }
  const signed = await signer.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    maxRetries: SOLANA_SEND_MAX_RETRIES,
  });
  return { signature, signed };
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
  const transaction = await buildSolanaDepositTransfer({
    from: signer.publicKey.toBase58(),
    to: input.to,
    amountIn: input.amountIn,
  });
  const { signature } = await broadcastSolanaTransaction(transaction);
  return signature;
}

export async function transferSpl(input: {
  mint: string;
  to: string;
  amountIn: bigint;
}): Promise<string> {
  const signer = requireSigner();
  const transaction = await buildSolanaDepositTransfer({
    from: signer.publicKey.toBase58(),
    to: input.to,
    amountIn: input.amountIn,
    mint: input.mint,
  });
  const { signature } = await broadcastSolanaTransaction(transaction);
  return signature;
}
