export const PAYMENT_LINKS_PATH = "/payment-links";
export const CREATE_PAYMENT_LINK_PATH = "/payment-links/create";
export const CREATE_PAYMENT_LINK_PREVIEW_PATH = "/payment-links/create/preview";

export function isCreatePaymentLinkPath(pathname: string): boolean {
  return pathname === CREATE_PAYMENT_LINK_PATH || pathname.startsWith(`${CREATE_PAYMENT_LINK_PATH}/`);
}

export const CREATE_PAYMENT_LINK_STEP = {
  Form: "form",
  Preview: "preview",
} as const;

export type CreatePaymentLinkStep =
  (typeof CREATE_PAYMENT_LINK_STEP)[keyof typeof CREATE_PAYMENT_LINK_STEP];

export type CreatePaymentLinkPreviewState = {
  linkId: string;
};

export const PAYMENT_TITLE_MAX_LENGTH = 50;
export const PAYMENT_DESCRIPTION_MAX_LENGTH = 200;
export const CREATE_LINK_AMOUNT_MAX_DECIMALS = 6;
export const CREATE_LINK_QR_SIZE_PX = 147;

export const PAYMENT_LINK_TYPE = {
  Fixed: "fixed",
  Open: "open",
} as const;

export type PaymentLinkType = (typeof PAYMENT_LINK_TYPE)[keyof typeof PAYMENT_LINK_TYPE];

export const PAYMENT_LINK_STATUS = {
  Active: "active",
  Inactive: "inactive",
} as const;

export type PaymentLinkStatus = (typeof PAYMENT_LINK_STATUS)[keyof typeof PAYMENT_LINK_STATUS];

export const PAYMENT_LINK_TYPE_LABEL: Record<PaymentLinkType, string> = {
  [PAYMENT_LINK_TYPE.Fixed]: "Fixed Amount",
  [PAYMENT_LINK_TYPE.Open]: "Open Amount",
};

export const PAYMENT_LINK_STATUS_LABEL: Record<PaymentLinkStatus, string> = {
  [PAYMENT_LINK_STATUS.Active]: "Active",
  [PAYMENT_LINK_STATUS.Inactive]: "Disable",
};

export const PAYMENT_LINKS_PAGE_SIZE = 20;
export const LINK_PAYMENTS_PAGE_SIZE = 20;

export const PAYMENT_LINKS_TABLE_COLUMNS =
  "minmax(180px,1.4fr) minmax(120px,0.9fr) minmax(140px,1fr) minmax(100px,0.8fr) minmax(120px,0.85fr) minmax(72px,0.55fr) minmax(44px,0.3fr) minmax(36px,0.1fr) minmax(36px,0.1fr)  minmax(36px,0.1fr)";

export const LINK_TRANSACTIONS_TABLE_COLUMNS =
  "minmax(150px,1.1fr) minmax(140px,1fr) minmax(70px,0.5fr) minmax(140px,1fr) minmax(90px,0.7fr) minmax(140px,0.9fr)";
