import { FIXED_CHAINS } from "@/config/chains";
import { Big, formatAmount, formatDate, stampDownloadFilename } from "@/utils";
import { PAYMENT_LINK_TYPE } from "@/mocks/payment-links";
import type { PaymentLink, PaymentLinkTransaction } from "@/mocks/payment-links";
import { CREATE_LINK_QR_SIZE_PX } from "./config";

export function splitUsdAmount(value: number): { whole: string; fraction: string } {
  const formatted = formatAmount(value, { maxDecimals: 2, padDecimals: true });
  const dot = formatted.lastIndexOf(".");
  if (dot < 0) return { whole: formatted, fraction: "" };
  return { whole: formatted.slice(0, dot), fraction: formatted.slice(dot) };
}

export function buildPaymentLinkUrl(origin: string, id: string): string {
  return `${origin.replace(/\/+$/, "")}/p/${id}`;
}

export function formatTokenNetwork(token: string, network: string): string {
  return `${token} · ${chainDisplayName(network)}`;
}

export function formatLinkAmount(link: PaymentLink): string {
  const asset = formatTokenNetwork(link.token, link.network);
  if (link.type === PAYMENT_LINK_TYPE.Open || !link.amount) return asset;
  return `${link.amount} ${asset}`;
}

export function chainDisplayName(network: string): string {
  const chain = FIXED_CHAINS.find(
    (entry) => entry.blockchain === network || entry.chainName === network,
  );
  return chain?.chainName ?? network;
}

export function transactionExplorerUrl(row: PaymentLinkTransaction): string | null {
  if (!row.txHash) return null;
  const chain = FIXED_CHAINS.find(
    (entry) => entry.blockchain === row.network || entry.chainName === row.network,
  );
  if (!chain) return null;
  return `${chain.txExplorer}${row.txHash}`;
}

export function downloadLinkTransactionsCsv(link: PaymentLink, now = new Date()) {
  const header = ["Time", "Paid by", "Paid", "Asset", "Paid Value", "Status"];
  const lines = [
    header.join(","),
    ...link.transactions.map((row) =>
      [
        csvCell(formatDate(row.paidAt)),
        csvCell(row.payer),
        csvCell(row.paid),
        csvCell(formatTokenNetwork(row.token, row.network)),
        csvCell(formatAmount(row.paidValue, { maxDecimals: 2 })),
        "Complete",
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = stampDownloadFilename(`payment-link-${link.id}-transactions.csv`, now);
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
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
