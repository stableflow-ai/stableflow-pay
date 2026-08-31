import { useState, type ReactNode } from "react";
import { IconCheck, IconLoading } from "@/components/icons";
import { IconExportLink, IconLink, IconOutLink } from "@/components/icons/link";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";
import { DESKTOP_MEDIA_QUERY } from "@/components/ui/overlay/config";
import { Pagination } from "@/components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useExportPaymentLinkPaymentsMutation,
  usePaymentLinkPaymentsQuery,
  usePaymentLinkStatsQuery,
} from "@/hooks/use-payment-links-api";
import useToast from "@/hooks/use-toast";
import type { PayPaymentLink } from "@/types/payment-links";
import { formatAddress, formatAmount, formatDate } from "@/utils";
import { LINK_PAYMENTS_PAGE_SIZE, LINK_TRANSACTIONS_TABLE_COLUMNS } from "../config";
import {
  buildPaymentLinkUrl,
  formatTokenNetwork,
  isPaymentLinkActive,
  isPaymentLinkOpen,
  paymentLinkStatusLabel,
  paymentLinksError,
} from "../utils";
import { ListEmptyState } from "./ListEmptyState";
import { txExplorerUrl } from "@/config/chains";
import { cn } from "@/lib/utils";

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
      panelClassName={isDesktop ? "w-[min(100%,948px)]" : undefined}
      cardClassName={
        isDesktop
          ? "w-full md:rounded-r-none"
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
  const toast = useToast();
  const [page, setPage] = useState(1);
  const statsQuery = usePaymentLinkStatsQuery(link.linkId);
  const paymentsQuery = usePaymentLinkPaymentsQuery(link.linkId, {
    page,
    pageSize: LINK_PAYMENTS_PAGE_SIZE,
  });
  const exportMutation = useExportPaymentLinkPaymentsMutation();
  const detail = statsQuery.data ?? link;
  const isActive = isPaymentLinkActive(detail.status);
  const rows = paymentsQuery.data?.list ?? [];
  const totalPage = Math.max(1, paymentsQuery.data?.totalPage ?? 1);

  function handleExport() {
    void exportMutation.mutateAsync(link.linkId).catch((error) => {
      toast.fail({ title: paymentLinksError(error, "Could not export CSV") });
    });
  }

  console.log(rows)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 rounded-[12px] bg-[#f6f6f6] px-4 py-3 md:grid-cols-5 md:gap-6">
        <SummaryField label="Status">
          <span className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${isActive ? "bg-[#769400]" : "bg-[#9fa7ba]"}`}
            />
            {paymentLinkStatusLabel(detail.status)}
          </span>
        </SummaryField>
        <SummaryField label="Payment Token">
          {formatTokenNetwork(detail.symbol, detail.network)}
        </SummaryField>
        <SummaryField label="Price">
          {isPaymentLinkOpen(detail) ? "No limit" : formatAmount(detail.amount, { prefix: "", maxDecimals: 2, showDust: true })}
        </SummaryField>
        <SummaryField label="Revenue">{detail.revenue || "0"}</SummaryField>
        <SummaryField label="Transactions">{detail.payments}</SummaryField>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="font-montserrat text-base font-medium text-black">Transactions</p>
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Sm}
          className="h-9 w-auto rounded-[6px] border-[#e3e3e3] px-3 text-black"
          loading={exportMutation.isPending}
          onClick={handleExport}
        >
          Export CSV
          <IconExportLink className="size-3.5 shrink-0" />
        </Button>
      </div>

      <Table
        className="w-full border-0 bg-transparent p-0 shadow-none"
        columns={LINK_TRANSACTIONS_TABLE_COLUMNS}
        footer={
          rows.length === 0 ? undefined : (
            <div className="mt-3 flex justify-end">
              <Pagination page={page} totalPage={totalPage} onPageChange={setPage} />
            </div>
          )
        }
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
          {paymentsQuery.isPending ? (
            <div className="flex items-center justify-center py-10">
              <IconLoading className="size-4 animate-spin text-[#909090]" />
            </div>
          ) : rows.length === 0 ? (
            <ListEmptyState>No transactions yet</ListEmptyState>
          ) : (
            rows.map((row) => {
              const isSuccess = row.status === "completed";
              return (
                <TableRow key={row.paymentsId || row.id || `${row.txHash}-${row.submittedAt}`}>
                  <TableCell>{formatDate(row.submittedAt) || "—"}</TableCell>
                  <TableCell>{row.payer ? formatAddress(row.payer) : "—"}</TableCell>
                  <TableCell>
                    {row.amount
                      ? formatAmount(row.amount, { prefix: "", maxDecimals: 6, showDust: true })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {row.symbol ? formatTokenNetwork(row.symbol, row.network) : "—"}
                  </TableCell>
                  <TableCell>
                    {row.destinationAmount
                      ? formatAmount(row.destinationAmount, { prefix: "$", maxDecimals: 2, showDust: true })
                      : "—"}
                  </TableCell>
                  <TableCell className={cn("capitalize flex items-center gap-1.5", isSuccess ? "text-[#769400]" : "text-[#9fa7ba]")}>
                    {
                      isSuccess && (
                        <IconCheck className="size-3" />
                      )
                    }
                    <span>{row.status || "—"}</span>
                    {
                      isSuccess && (
                        <a
                          target="_blank"
                          href={txExplorerUrl(row.destinationNetwork, row.destinationTxHash) || ""}
                        >
                          <IconOutLink className="size-3" />
                        </a>
                      )
                    }
                  </TableCell>
                </TableRow>
              )
            })
          )}
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
