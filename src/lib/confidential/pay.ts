/**
 * Payer settlement for a merchant payment link lives on `/p/:id`.
 * Link detail is mocked until the merchant-link API exists. Quote / swap / submit
 * use `POST /v1/pay/single/*` with Bearer only when a session token exists.
 * Waiting polls `GET /v1/nearintents/status` the same way.
 */
export {};
