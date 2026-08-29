/**
 * Payer settlement for a merchant payment link lives on `/paylink/:linkId`.
 * Link detail is `GET /v1/pay/links/{linkId}` with Bearer only when a session
 * token exists. Quote / swap / submit use `POST /v1/pay/single/*` the same way.
 * Waiting polls `GET /v1/nearintents/status`.
 */
export {};
