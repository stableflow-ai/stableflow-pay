import type { ReactNode } from "react";
import { IconLink } from "@/components/icons/link";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { DESKTOP_MEDIA_QUERY } from "@/components/ui/overlay/config";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table/Table";
import { useMediaQuery } from "@/hooks/use-media-query";
import useToast from "@/hooks/use-toast";
import type { PayPaymentLink } from "@/types/payment-links";
import { formatDate } from "@/utils";
import { LINK_TRANSACTIONS_TABLE_COLUMNS } from "../config";
import {
  buildPaymentLinkUrl,
  formatTokenNetwork,
  isPaymentLinkActive,
  isPaymentLinkOpen,
  paymentLinkStatusLabel,
} from "../utils";
import { ListEmptyState } from "./ListEmptyState";

export function LinkPaymentsDrawer({
  link,
  onClose,
}: {
  link: PayPaymentLink | null;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const toast = useToast();
  const open = Boolean(link);

  async function copyPaymentLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(buildPaymentLinkUrl(window.location.origin, link.linkId));
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side={isDesktop ? DRAWER_SIDE.Right : DRAWER_SIDE.Bottom}
      cardClassName={
        isDesktop
          ? "w-[min(100%,948px)]"
          : "w-full max-h-[90vh] rounded-b-none"
      }
      titleClassName="min-h-0 min-w-0 flex-1"
      title={
        link ? (
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-montserrat text-[18px] font-semibold leading-normal text-black">
              {link.title}
            </span>
            <span className="font-montserrat text-xs font-medium text-[#aaa]">
              {formatDate(link.createdAt)}
            </span>
          </span>
        ) : null
      }
      headerAction={
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 font-montserrat text-xs font-medium text-[#aaa] hover:text-black"
          onClick={() => void copyPaymentLink()}
        >
          <IconLink className="size-3.5" />
          Payment Link
        </button>
      }
    >
      {link ? <LinkPaymentsDrawerBody key={link.linkId} link={link} /> : null}
    </Drawer>
  );
}

function LinkPaymentsDrawerBody({ link }: { link: PayPaymentLink }) {
  const isActive = isPaymentLinkActive(link.status);
  const tokenLabel = isPaymentLinkOpen(link)
    ? "No limit"
    : formatTokenNetwork(link.symbol, link.network);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 rounded-[12px] bg-[#f6f6f6] px-4 py-3 md:grid-cols-5 md:gap-6">
        <SummaryField label="Status">
          <span className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${isActive ? "bg-[#769400]" : "bg-[#9fa7ba]"}`}
            />
            {paymentLinkStatusLabel(link.status)}
          </span>
        </SummaryField>
        <SummaryField label="Payment Token">{tokenLabel}</SummaryField>
        <SummaryField label="Price">—</SummaryField>
        <SummaryField label="Revenue">—</SummaryField>
        <SummaryField label="Transactions">—</SummaryField>
      </div>

      <p className="font-montserrat text-base font-medium text-black">Transactions</p>

      <Table
        className="w-full border-0 bg-transparent p-0 shadow-none"
        columns={LINK_TRANSACTIONS_TABLE_COLUMNS}
      >
        <TableHeader className="border-b border-black/10">
          <TableHead>Time</TableHead>
          <TableHead>Paid by</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Paid Value</TableHead>
          <TableHead>Status</TableHead>
        </TableHeader>
        <TableBody>
          <ListEmptyState>No transactions yet</ListEmptyState>
        </TableBody>
      </Table>
    </div>
  );
}

function SummaryField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-montserrat text-xs font-medium text-[#aaa]">{label}</p>
      <p className="mt-1.5 truncate font-montserrat text-sm font-medium text-black">{children}</p>
    </div>
  );
}
