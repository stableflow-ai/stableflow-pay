export const PAY_API_PREFIX = "/v1/pay";
export const NEARINTENTS_API_PREFIX = "/v1/nearintents";

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
}

export function checkoutSessionsUrl(): string {
  return `${getApiBaseUrl()}${PAY_API_PREFIX}/checkout/sessions`;
}
