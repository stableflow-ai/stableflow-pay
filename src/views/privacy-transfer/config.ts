export const PRIVACY_TRANSFER_PATH = "/privacy-transfer";
export const PRIVACY_TRANSFER_TITLE = "Privacy Transfer";
export const PRIVACY_TRANSFER_MAX_RECIPIENTS = 10;
export const PRIVACY_TRANSFER_PRODUCT_FEE_BPS = 0;
export const PRIVACY_TRANSFER_AMOUNT_MAX_DECIMALS = Number.parseInt(
  import.meta.env.VITE_AMOUNT_MAX_DECIMALS ?? "6",
  10,
) || 6;

export const PRIVACY_TRANSFER_STAGE_LABEL = {
  created: "Starting",
  funding_pending_confirmation: "Confirming wallet transfer",
  funded: "Waiting for deposit",
  deposit_confirmed: "Deposit confirmed",
  signing: "Signing withdrawals",
  submit_pending_confirmation: "Submitting withdrawals",
  submitted: "Waiting for withdrawals",
  completed: "Completed",
  failed: "Failed",
} as const;
