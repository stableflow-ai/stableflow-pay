/**
 * Public payer settlement lives on `/paylink/:linkId` and `/checkout?sessionId=`.
 * Link detail is `GET /v1/pay/links/{linkId}`. Checkout session is
 * `GET /v1/pay/checkout/sessions/{sessionId}` (`status` plus `payments_id`).
 * Bearer is sent only when a session token exists. Preview and pay use
 * `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}`
 * (no quote).
 * Submit is `POST /v1/pay/swap/submit` (`swapId` + `txHash`) and returns
 * `payments_id`. Waiting polls `GET /v1/pay/payments/{paymentId}`.
 */
export {};
