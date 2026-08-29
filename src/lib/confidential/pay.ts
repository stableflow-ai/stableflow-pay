/**
 * Public payer settlement lives on `/paylink/:linkId` and `/checkout?sessionId=`.
 * Link detail is `GET /v1/pay/links/{linkId}`. Checkout session is
 * `GET /v1/pay/checkout/sessions/{sessionId}`. Bearer is sent only when a
 * session token exists. Quote is `POST /v1/pay/quote`. Deposit addresses come
 * from `POST /v1/pay/swap/link/{linkId}` or `POST /v1/pay/swap/checkout/{sessionId}`.
 * Submit is `POST /v1/pay/swap/submit` (`swapId` + `txHash`) with a retry queue.
 * Waiting polls `GET /v1/nearintents/status`.
 */
export {};
