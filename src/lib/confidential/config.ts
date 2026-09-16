export const ONE_CLICK_API_URL = "https://1click.chaindefuser.com";
export const ACCESS_REFRESH_SKEW_MS = 60_000;
export const NEARINTENTS_USER_SESSION_STORAGE_PREFIX = "stableflow-pay.nearintents-user-session.v2.";

/**
 * Same-origin 1Click path in `pnpm dev` / `preview` (Vite proxy).
 * Production still needs a backend or CDN proxy.
 */
export function oneClickBrowserUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) return normalized;
  return `${ONE_CLICK_API_URL}${normalized}`;
}

export const PRIVATE_INDEXER_ORIGIN = (
  import.meta.env.VITE_PRIVATE_INDEXER_URL ?? "https://privateindexer.refburrow.top"
).replace(/\/+$/, "");

/** Same-origin prefix; Vite (dev/preview) proxies this to PRIVATE_INDEXER_ORIGIN. */
export const PRIVATE_INDEXER_PREFIX = "/v3/private";

export const PRIVACY_TRANSFER_QUOTE_DEADLINE_MS = 10 * 60_000;
export const PRIVACY_TRANSFER_MAX_QUOTE_AGE_MS = 60_000;
export const PRIVACY_TRANSFER_POLL_INTERVAL_MS = 5_000;
export const PRIVACY_TRANSFER_MAX_RECIPIENTS = 10;

/** First 4 bytes of sha256("versioned_nonce"); marks a V1 Intents nonce. */
export const VERSIONED_NONCE_MAGIC = new Uint8Array([0x56, 0x28, 0xf6, 0xc6]);
export const VERSIONED_NONCE_VERSION = 0;
export const VERSIONED_NONCE_RANDOM_LENGTH = 15;
export const INTENTS_SALT_TTL_MS = 5 * 60_000;
export const INTENTS_SALT_METHOD = "current_salt";
