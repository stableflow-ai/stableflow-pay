import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./api-error";
import { http, httpBlob } from "./http";
import { useAuthStore } from "@/stores/auth";

const API_BASE = "https://test-api.stableflow.ai";

const SAMPLE_USER = { id: 1, email: "a@b.com", name: "Ada", guideCompleted: false };

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function applySession(token = "tok-1") {
  useAuthStore.getState().applySession(token, SAMPLE_USER);
}

function resetSession() {
  useAuthStore.setState({ token: null, user: null });
}

describe("http", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", API_BASE);
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    resetSession();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetSession();
  });

  it("unwraps data when code is 200", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: { ok: true } }));
    const data = await http<{ ok: boolean }>("/v1/pay/auth/login", {
      method: "POST",
      body: { email: "a@b.com", password: "x" },
      auth: false,
    });
    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/v1/pay/auth/login`);
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.com", password: "x" }));
  });

  it("throws ApiError when business code is not 200", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ code: 400, message: "Invalid credentials", data: null }),
    );
    await expect(
      http("/v1/pay/auth/login", { method: "POST", body: {}, auth: false }),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid credentials",
      status: 200,
      code: "400",
    } satisfies Partial<ApiError>);
  });

  it("sends Authorization Bearer when auth is true", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: { id: 9 } }));
    await http<{ id: number }>("/v1/pay/order/9");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-1");
  });

  it("throws without fetching when auth is required and no token is stored", async () => {
    await expect(http("/v1/pay/batch/quote", { method: "POST", body: {} })).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHENTICATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests a same-origin path when sameOrigin is true", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: { ok: true } }));
    await http("/v1/pay/checkout/sessions", {
      method: "POST",
      body: { amount: "1" },
      apiKey: "sk-test",
      sameOrigin: true,
    });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/pay/checkout/sessions");
  });

  it("sends x-api-key and omits Bearer when apiKey is set", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: { ok: true } }));
    await http("/v1/pay/checkout/sessions", {
      method: "POST",
      body: { amount: "1" },
      apiKey: "sk-test",
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-test");
    expect(headers.Authorization).toBeUndefined();
  });

  it("does not clear the session on HTTP 401 when apiKey is set", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 401, message: "Bad key" }, 401));
    await expect(
      http("/v1/pay/checkout/sessions", { method: "POST", body: {}, apiKey: "sk-test" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Bad key",
    });
    expect(useAuthStore.getState().token).toBe("tok-1");
  });

  it("omits Authorization when auth is false", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: {} }));
    await http("/v1/pay/auth/register", { method: "POST", body: {}, auth: false });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("appends GET query params and skips nullish values", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 200, data: [] }));
    await http("/v1/pay/order/1", { query: { page: 2, q: "ada", empty: undefined, none: null } });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/v1/pay/order/1?page=2&q=ada`);
  });

  it("clears the session on HTTP 401", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 401, message: "Expired" }, 401));

    await expect(http("/v1/pay/order/1")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Expired",
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout is a no-op when nothing is stored", () => {
    expect(() => useAuthStore.getState().logout()).not.toThrow();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("returns 1Click JSON as-is when envelope is false", async () => {
    applySession();
    const quote = {
      correlationId: "aa85",
      quote: { depositAddress: "27fb", amountInFormatted: "1.0" },
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(quote));
    const data = await http<typeof quote>("/v1/nearintents/quote", {
      method: "POST",
      body: {},
      envelope: false,
    });
    expect(data).toEqual(quote);
  });

  it("throws the upstream message when envelope is false and HTTP fails", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: "Amount is too low for bridge, try at least 18634672511199040" },
        400,
      ),
    );
    await expect(
      http("/v1/nearintents/quote", { method: "POST", body: {}, envelope: false }),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Amount is too low for bridge, try at least 18634672511199040",
      status: 400,
    });
  });
});

describe("httpBlob", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("VITE_API_BASE_URL", API_BASE);
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    resetSession();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    resetSession();
  });

  it("returns the file blob and Content-Disposition filename", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(
      new Response("id,amount\n1,10", {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="payments.csv"',
        },
      }),
    );
    const result = await httpBlob("/v1/pay/payments/export", {
      fallbackFilename: "transaction-history.csv",
    });
    expect(result.filename).toBe("payments.csv");
    expect(await result.blob.text()).toBe("id,amount\n1,10");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/v1/pay/payments/export`);
    expect((init.headers as Record<string, string>).Accept).toBe("text/csv, application/json");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-1");
  });

  it("uses the fallback filename and appends query params", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(
      new Response("id\n1", {
        status: 200,
        headers: { "Content-Type": "text/csv" },
      }),
    );
    const result = await httpBlob("/v1/pay/payments/export", {
      query: { q: "ada", status: "completed", empty: undefined },
      fallbackFilename: "transaction-history.csv",
    });
    expect(result.filename).toBe("transaction-history.csv");
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/v1/pay/payments/export?q=ada&status=completed`);
  });

  it("decodes filename* from Content-Disposition", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(
      new Response("ok", {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename*=UTF-8''report%20export.csv",
        },
      }),
    );
    const result = await httpBlob("/v1/pay/payments/export");
    expect(result.filename).toBe("report export.csv");
  });

  it("throws without fetching when auth is required and no token is stored", async () => {
    await expect(httpBlob("/v1/pay/payments/export")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHENTICATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws an envelope error when HTTP is 200 but code is not 200", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 400, message: "Nothing to export" }));
    await expect(httpBlob("/v1/pay/payments/export")).rejects.toMatchObject({
      name: "ApiError",
      message: "Nothing to export",
      status: 200,
      code: "400",
    });
  });

  it("clears the session on HTTP 401", async () => {
    applySession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 401, message: "Expired" }, 401));

    await expect(httpBlob("/v1/pay/payments/export")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Expired",
    });
    expect(useAuthStore.getState().token).toBeNull();
  });
});
