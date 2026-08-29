import { FIXED_CHAINS } from "@/config/chains";
import { Big, formatAmount, stampDownloadFilename } from "@/utils";
import type { PayPaymentLink } from "@/types/payment-links";
import {
  CREATE_LINK_QR_SIZE_PX,
  PAYMENT_LINK_STATUS,
  PAYMENT_LINK_STATUS_LABEL,
  PAYMENT_LINK_TYPE,
  type PaymentLinkStatus,
} from "./config";

export function isPaymentLinkOpen(link: PayPaymentLink) {
  return !link.amount.trim();
}

export function isPaymentLinkActive(status: string) {
  const value = status.trim().toLowerCase();
  return value === "active" || value === "enabled";
}

export function paymentLinkType(link: PayPaymentLink) {
  return isPaymentLinkOpen(link) ? PAYMENT_LINK_TYPE.Open : PAYMENT_LINK_TYPE.Fixed;
}

export function paymentLinkStatusLabel(status: string) {
  const key: PaymentLinkStatus = isPaymentLinkActive(status)
    ? PAYMENT_LINK_STATUS.Active
    : PAYMENT_LINK_STATUS.Inactive;
  return PAYMENT_LINK_STATUS_LABEL[key];
}

export function splitUsdAmount(value: number): { whole: string; fraction: string } {
  const formatted = formatAmount(value, { maxDecimals: 2, padDecimals: true });
  const dot = formatted.lastIndexOf(".");
  if (dot < 0) return { whole: formatted, fraction: "" };
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot) };
}

export function buildPaymentLinkUrl(origin: string, linkId: string): string {
  return `${origin.replace(/\/+$/, "")}/paylink/${linkId}`;
}

export function formatTokenNetwork(token: string, network: string): string {
  return `${token} · ${chainDisplayName(network)}`;
}

export function formatLinkAmount(link: PayPaymentLink): string {
  const asset = formatTokenNetwork(link.symbol, link.network);
  if (isPaymentLinkOpen(link)) return asset;
  return `${link.amount} ${asset}`;
}

export function chainDisplayName(network: string): string {
  const chain = FIXED_CHAINS.find(
    (entry) => entry.blockchain === network || entry.chainName === network,
  );
  return chain?.chainName ?? network;
}

export function isPositiveAmount(value: string): boolean {
  try {
    return Big(value.trim()).gt(0);
  } catch {
    return false;
  }
}

export async function paymentLinkQrDataUrl(url: string): Promise<string> {
  const { toDataURL } = await import("qrcode");
  return toDataURL(url, {
    width: CREATE_LINK_QR_SIZE_PX * 2,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export function downloadPaymentLinkQr(dataUrl: string, linkId: string, now = new Date()) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = stampDownloadFilename(`payment-link-${linkId}-qr.png`, now);
  anchor.click();
}

export function paymentLinksError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
