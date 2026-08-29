import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import { ApiError } from "@/lib/api-error";
import type { PayApiKey, PayApiKeyBody } from "@/types/api-keys";

function mapApiKey(raw: unknown): PayApiKey {
  const row = asRecord(raw) ?? {};
  return {
    id: apiNumber(row.id) ?? 0,
    userId: apiNumber(row.user_id ?? row.userId) ?? 0,
    name: apiText(row.name),
    apiKey: apiText(row.api_key ?? row.apiKey),
    createdAt: apiText(row.created_at ?? row.createdAt),
    status: apiNumber(row.status) ?? 0,
  };
}

function mapApiKeyList(data: unknown): PayApiKey[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.list)
      ? (asRecord(data)?.list as unknown[])
      : [];
  return list.map(mapApiKey).filter((row) => row.id > 0);
}

export async function listApiKeys(): Promise<PayApiKey[]> {
  return mapApiKeyList(await http<unknown>(`${PAY_API_PREFIX}/apiKeys`));
}

export async function createApiKey(body: PayApiKeyBody): Promise<PayApiKey> {
  const key = mapApiKey(await http<unknown>(`${PAY_API_PREFIX}/apiKeys`, { method: "POST", body }));
  if (key.id <= 0) {
    throw new ApiError("Create API key did not return an id", 400, "PAY_API_KEY");
  }
  return key;
}

export function updateApiKey(id: number, body: PayApiKeyBody) {
  return http<string>(`${PAY_API_PREFIX}/apiKeys/${id}`, { method: "POST", body });
}

export function deleteApiKey(id: number) {
  return http<void>(`${PAY_API_PREFIX}/apiKeys/${id}`, { method: "DELETE" });
}
