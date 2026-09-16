const MAX_RECIPIENTS = 10;

function rawAmount(value: string, field: string, allowZero = false): bigint {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error(`${field} must be a canonical integer string.`);
  }
  const result = BigInt(value);
  if (!allowZero && result <= 0n) throw new Error(`${field} must be positive.`);
  return result;
}

export function randomFraction(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]! / 0xffffffff;
}

/**
 * Split a raw integer into 1–10 shares, each about even ±20%.
 * `values` must be frozen on the quote plan so resume cannot reshuffle.
 */
export function splitConfidentialRawAmount(
  totalRaw: string,
  count: number,
  values?: readonly number[],
): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_RECIPIENTS) {
    throw new Error("A batch requires 1 to 10 recipients.");
  }
  const total = rawAmount(totalRaw, "Amount");
  if (total < BigInt(count)) throw new Error("Amount too small for every recipient.");
  const minimum = total * 80n / (100n * BigInt(count));
  const lowBound = minimum > 0n ? minimum : 1n;
  const denominator = 100n * BigInt(count);
  const maximum = (total * 120n + denominator - 1n) / denominator;
  const highBound = maximum > lowBound ? maximum : lowBound;
  const shares: bigint[] = [];
  let remaining = total;
  for (let i = 0; i < count - 1; i++) {
    const left = BigInt(count - i - 1);
    const low = remaining - highBound * left > lowBound ? remaining - highBound * left : lowBound;
    const high = remaining - lowBound * left < highBound ? remaining - lowBound * left : highBound;
    if (low > high) throw new Error("Amount cannot be split safely.");
    const fraction = values?.[i] ?? randomFraction();
    if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
      throw new Error("Random fractions must be within [0, 1].");
    }
    const share = low + (high - low) * BigInt(Math.floor(fraction * 1_000_000)) / 1_000_000n;
    shares.push(share);
    remaining -= share;
  }
  if (remaining < lowBound || remaining > highBound) {
    throw new Error("Final share outside safe bounds.");
  }
  return [...shares, remaining].map(String);
}
