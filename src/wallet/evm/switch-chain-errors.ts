export function isUserRejected(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { name?: string; code?: number; message?: string };
  if (record.name === "UserRejectedRequestError" || record.code === 4001) return true;
  return /rejected|denied|cancel/i.test(record.message ?? "");
}

export function isAlreadyOnChain(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /already on this chain/i.test(error.message);
}

export function isChainMismatch(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { name?: string; message?: string };
  if (
    record.name === "ConnectorChainMismatchError" ||
    record.name === "ChainMismatchError"
  ) {
    return true;
  }
  return /does not match the connection's chain/i.test(record.message ?? "");
}
