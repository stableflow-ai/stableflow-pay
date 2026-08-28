import { ApiError } from "@/lib/api-error";

export function maskApiKey(key: string): string {
  if (key.length <= 11) return key;
  return `${key.slice(0, 7)}*****${key.slice(-4)}`;
}

export function apiKeysError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
