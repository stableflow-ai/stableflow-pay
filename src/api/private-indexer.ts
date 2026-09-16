import { ApiError } from "@/lib/api-error";
import { PRIVATE_INDEXER_PREFIX } from "@/lib/confidential/config";
import { getNearintentsAccessToken } from "@/stores/nearintents-user-session";
import type {
  PrivateOrder,
  PrivateOrderPage,
  PrivateWithdrawRequest,
} from "@/types/nearintents";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError("Indexer returned an invalid object.", 502, "INDEXER");
  }
  return value as Record<string, unknown>;
}

async function indexerRequest(
  path: string,
  method: string,
  body?: unknown,
  accessToken?: string | null,
): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${PRIVATE_INDEXER_PREFIX}/${path.replace(/^\/+/, "")}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError("Indexer returned invalid JSON.", response.status, "INDEXER");
    }
  }
  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload
      ? String((payload as { message?: unknown }).message ?? "")
      : "";
    throw new ApiError(message || `Indexer request failed (${response.status}).`, response.status, "INDEXER");
  }
  if (payload && typeof payload === "object" && "code" in payload) {
    const envelope = record(payload);
    if (envelope.code !== 0 && envelope.code !== 200) {
      throw new ApiError("Indexer returned an unsuccessful envelope.", response.status, "INDEXER");
    }
    return envelope.data;
  }
  return payload;
}

export async function submitPrivateWithdraws(request: PrivateWithdrawRequest): Promise<string> {
  const token = await getNearintentsAccessToken(request.signer_id);
  const data = record(await indexerRequest("withdraws", "POST", request, token));
  const orderId = data.order_id;
  if (typeof orderId !== "string" || !orderId.trim()) {
    throw new ApiError("Indexer returned no private order id.", 502, "INDEXER");
  }
  return orderId.trim();
}

export async function getPrivateOrders(
  signerId: string,
  limit = 50,
  offset = 0,
): Promise<PrivateOrderPage> {
  const query = new URLSearchParams({
    signer_id: signerId,
    limit: String(limit),
    offset: String(offset),
  });
  const data = await indexerRequest(
    `orders?${query}`,
    "GET",
    undefined,
    await getNearintentsAccessToken(signerId),
  );
  const page = Array.isArray(data) ? { list: data, has_next_page: false } : record(data);
  const list = page.list ?? page.orders ?? page.items;
  if (!Array.isArray(list)) {
    throw new ApiError("Invalid private order list.", 502, "INDEXER");
  }
  return {
    list: list.map((item) => {
      const wrapper = record(item);
      const order = wrapper.order
        ? { ...record(wrapper.order), transactions: wrapper.transactions ?? [] }
        : wrapper;
      return order as unknown as PrivateOrder;
    }),
    hasNextPage: Boolean(page.has_next_page ?? page.hasNextPage),
  };
}
