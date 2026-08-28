import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { usePaymentLinks } from "@/hooks/use-payment-links";
import useToast from "@/hooks/use-toast";
import { PAYMENT_LINK_STATUS } from "@/mocks/payment-links";
import type { PaymentLink } from "@/mocks/payment-links";
import { LinkPaymentsDrawer } from "./components/LinkPaymentsDrawer";
import { LinksStatsCard } from "./components/LinksStatsCard";
import { PaymentLinksTable } from "./components/PaymentLinksTable";
import { PAYMENT_LINKS_PAGE_SIZE } from "./config";
import { buildPaymentLinkUrl } from "./utils";

export function PaymentLinksView() {
  const fixtures = usePaymentLinks();
  const toast = useToast();
  const [links, setLinks] = useState(fixtures);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<PaymentLink | null>(null);
  const [deleting, setDeleting] = useState<PaymentLink | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return links;
    return links.filter((link) => link.name.toLowerCase().includes(needle));
  }, [links, query]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAYMENT_LINKS_PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paged = filtered.slice(
    (safePage - 1) * PAYMENT_LINKS_PAGE_SIZE,
    safePage * PAYMENT_LINKS_PAGE_SIZE,
  );

  const viewingLink = viewing ? (links.find((link) => link.id === viewing.id) ?? null) : null;

  const total = links.length;
  const active = links.filter((link) => link.status === PAYMENT_LINK_STATUS.Active).length;
  const inactive = total - active;

  async function copyLink(link: PaymentLink) {
    try {
      await navigator.clipboard.writeText(buildPaymentLinkUrl(window.location.origin, link.id));
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  }

  function toggleStatus(link: PaymentLink, nextActive: boolean) {
    setLinks((current) =>
      current.map((row) =>
        row.id === link.id
          ? {
              ...row,
              status: nextActive ? PAYMENT_LINK_STATUS.Active : PAYMENT_LINK_STATUS.Inactive,
            }
          : row,
      ),
    );
  }

  function confirmDelete() {
    if (!deleting) return;
    setLinks((current) => current.filter((row) => row.id !== deleting.id));
    if (viewing?.id === deleting.id) setViewing(null);
    setDeleting(null);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <LinksStatsCard total={total} active={active} inactive={inactive} />
      <PaymentLinksTable
        links={paged}
        query={query}
        onQueryChange={handleQueryChange}
        page={safePage}
        totalPage={totalPage}
        onPageChange={setPage}
        onView={setViewing}
        onCopyLink={(link) => void copyLink(link)}
        onToggleStatus={toggleStatus}
        onDelete={setDeleting}
      />
      <LinkPaymentsDrawer link={viewingLink} onClose={() => setViewing(null)} />
      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete payment link?"
      >
        <p className="font-montserrat text-sm font-medium text-[#606060]">
          {deleting
            ? `Delete "${deleting.name}"? The issued link will be invalid.`
            : "The issued link will be invalid."}
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant={BUTTON_VARIANT.Danger}
            size={BUTTON_SIZE.Md}
            className="flex-1"
            onClick={confirmDelete}
          >
            Delete
          </Button>
          <Button
            variant={BUTTON_VARIANT.Normal}
            size={BUTTON_SIZE.Md}
            className="flex-1"
            onClick={() => setDeleting(null)}
          >
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default PaymentLinksView;
