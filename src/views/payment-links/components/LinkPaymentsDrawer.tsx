import type { ReactNode } from "react";
import { useState } from "react";
import { IconCheck } from "@/components/icons/check";
import { IconCopy } from "@/components/icons/copy";
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
import useToast from "@/hooks/use-toast";
import { PAYMENT_LINK_STATUS, PAYMENT_LINK_TYPE } from "@/mocks/payment-links";
import type { PaymentLink } from "@/mocks/payment-links";
import { formatAddress, formatDate } from "@/utils";
import {
  LINK_TRANSACTIONS_TABLE_COLUMNS,
  PAYMENT_LINKS_PAGE_SIZE,
  PAYMENT_LINK_STATUS_LABEL,
} from "../config";
import {
  buildPaymentLinkUrl,
  downloadLinkTransactionsCsv,
  formatTokenNetwork,
  splitUsdAmount,
  transactionExplorerUrl,
} from "../utils";
import { ListEmptyState } from "./ListEmptyState";

export function LinkPaymentsDrawer({
  link,
  onClose,
}: {
  link: PaymentLink | null;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const toast = useToast();
  const open = Boolean(link);

  async function copyPaymentLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(buildPaymentLinkUrl(window.location.origin, link.id));
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
              {link.name}
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
      {link ? <LinkPaymentsDrawerBody key={link.id} link={link} /> : null}
    </Drawer>
  );
}

function LinkPaymentsDrawerBody({ link }: { link: PaymentLink }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const isActive = link.status === PAYMENT_LINK_STATUS.Active;
  const price = splitUsdAmount(link.price);
  const revenue = splitUsdAmount(link.revenue);
  const tokenLabel =
    link.type === PAYMENT_LINK_TYPE.Open ? "No limit" : formatTokenNetwork(link.token, link.network);
  const totalPage = Math.max(1, Math.ceil(link.transactions.length / PAYMENT_LINKS_PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const pagedTransactions = link.transactions.slice(
    (safePage - 1) * PAYMENT_LINKS_PAGE_SIZE,
    safePage * PAYMENT_LINKS_PAGE_SIZE,
  );

  async function copyPayer(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 rounded-[12px] bg-[#f6f6f6] px-4 py-3 md:grid-cols-5 md:gap-6">
        <SummaryField label="Status">
          <span className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${isActive ? "bg-[#769400]" : "bg-[#9fa7ba]"}`}
            />
            {PAYMENT_LINK_STATUS_LABEL[link.status]}
          </span>
        </SummaryField>
        <SummaryField label="Payment Token">{tokenLabel}</SummaryField>
        <SummaryField label="Price">
          {price.whole}
          {price.fraction ? <span className="text-[#9fa7ba]">{price.fraction}</span> : null}
        </SummaryField>
        <SummaryField label="Revenue">
          {revenue.whole}
          {revenue.fraction ? <span className="text-[#9fa7ba]">{revenue.fraction}</span> : null}
        </SummaryField>
        <SummaryField label="Transactions">{link.paymentCount}</SummaryField>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="font-montserrat text-base font-medium text-black">Transactions</p>
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Sm}
          className="h-9 w-full rounded-[6px] text-sm md:w-auto"
          onClick={() => downloadLinkTransactionsCsv(link)}
        >
          Export CSV
          <IconExportLink className="size-3.5" />
        </Button>
      </div>

      <Table
        className="w-full border-0 bg-transparent p-0 shadow-none"
        columns={LINK_TRANSACTIONS_TABLE_COLUMNS}
        footer={
          link.transactions.length === 0 ? undefined : (
            <div className="mt-3 flex justify-end">
              <Pagination page={safePage} totalPage={totalPage} onPageChange={setPage} />
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
          {link.transactions.length === 0 ? (
            <ListEmptyState>No transactions yet</ListEmptyState>
          ) : (
            pagedTransactions.map((row) => {
              const explorer = transactionExplorerUrl(row);
              const paidValue = splitUsdAmount(row.paidValue);
              return (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.paidAt)}</TableCell>
                  <TableCell className="gap-1.5">
                    <span>{formatAddress(row.payer)}</span>
                    <button
                      type="button"
                      aria-label="Copy payer address"
                      className="cursor-pointer text-[#aaa] hover:text-black"
                      onClick={() => void copyPayer(row.payer)}
                    >
                      <IconCopy className="size-3.5" />
                    </button>
                  </TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell>{formatTokenNetwork(row.token, row.network)}</TableCell>
                  <TableCell>
                    {paidValue.whole}
                    {paidValue.fraction ? (
                      <span className="text-[#9fa7ba]">{paidValue.fraction}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="gap-2">
                    <span className="flex items-center gap-1.5 text-[#769400]">
                      <IconCheck className="size-3 text-[#769400]" />
                      Complete
                    </span>
                    {explorer ? (
                      <a
                        href={explorer}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View transaction"
                        className="text-[#aaa] hover:text-black"
                      >
                        <IconOutLink className="size-2.5" />
                      </a>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
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
