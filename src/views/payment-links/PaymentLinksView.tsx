import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { usePaymentLinkMutations, usePaymentLinksQuery } from "@/hooks/use-payment-links-api";
import useToast from "@/hooks/use-toast";
import type { PayPaymentLink } from "@/types/payment-links";
import { CreatePaymentLinkDrawer } from "./components/create/CreatePaymentLinkDrawer";
import { LinkPaymentsDrawer } from "./components/LinkPaymentsDrawer";
import { LinksStatsCard } from "./components/LinksStatsCard";
import { PaymentLinksTable } from "./components/PaymentLinksTable";
import { isCreatePaymentLinkPath, PAYMENT_LINKS_PAGE_SIZE, PAYMENT_LINKS_PATH } from "./config";
import { buildPaymentLinkUrl, isPaymentLinkActive, paymentLinksError } from "./utils";

export function PaymentLinksView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const linksQuery = usePaymentLinksQuery();
  const { deleteMutation, enableMutation, disableMutation } = usePaymentLinkMutations();
  const links = linksQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<PayPaymentLink | null>(null);
  const [deleting, setDeleting] = useState<PayPaymentLink | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return links;
    return links.filter((link) => link.title.toLowerCase().includes(needle));
  }, [links, query]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAYMENT_LINKS_PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paged = filtered.slice(
    (safePage - 1) * PAYMENT_LINKS_PAGE_SIZE,
    safePage * PAYMENT_LINKS_PAGE_SIZE,
  );

  const viewingLink = viewing
    ? (links.find((link) => link.linkId === viewing.linkId) ?? null)
    : null;

  const total = links.length;
  const active = links.filter((link) => isPaymentLinkActive(link.status)).length;
  const inactive = total - active;

  async function copyLink(link: PayPaymentLink) {
    try {
      await navigator.clipboard.writeText(buildPaymentLinkUrl(window.location.origin, link.linkId));
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  }

  function toggleStatus(link: PayPaymentLink, nextActive: boolean) {
    const action = nextActive
      ? enableMutation.mutateAsync(link.linkId)
      : disableMutation.mutateAsync(link.linkId);
    void action.catch((error) => {
      toast.fail({ title: paymentLinksError(error, "Could not update payment link") });
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const linkId = deleting.linkId;
    void deleteMutation
      .mutateAsync(linkId)
      .then(() => {
        if (viewing?.linkId === linkId) setViewing(null);
        setDeleting(null);
      })
      .catch((error) => {
        toast.fail({ title: paymentLinksError(error, "Could not delete payment link") });
      });
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
      <CreatePaymentLinkDrawer
        open={isCreatePaymentLinkPath(pathname)}
        onClose={() => navigate(PAYMENT_LINKS_PATH)}
      >
        <Outlet />
      </CreatePaymentLinkDrawer>
      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete payment link?"
      >
        <p className="font-montserrat text-sm font-medium text-[#606060]">
          {deleting
            ? `Delete "${deleting.title}"? The issued link will be invalid.`
            : "The issued link will be invalid."}
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant={BUTTON_VARIANT.Danger}
            size={BUTTON_SIZE.Md}
            className="flex-1"
            loading={deleteMutation.isPending}
            onClick={confirmDelete}
          >
            Delete
          </Button>
          <Button
            variant={BUTTON_VARIANT.Normal}
            size={BUTTON_SIZE.Md}
            className="flex-1"
            disabled={deleteMutation.isPending}
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
