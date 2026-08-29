import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE } from "@/components/ui/button/config";
import type { PayerSession } from "@/stores/payer-session";
import { formatAddress, formatAmount, formatDate } from "@/utils";
import { formatTokenNetwork } from "@/views/payment-links/utils";
import { PAYER_WAIT_STATUS, type PayerWaitStatus } from "../config";
import { CouponShell } from "./CouponShell";
import { DetailRow, PrivateBadge } from "./DetailRow";
import { StatusMark } from "./StatusMark";
import { IconCopy } from "@/components/icons";
import useToast from "@/hooks/use-toast";

export function WaitingCard(props: {
  status: PayerWaitStatus;
  session: PayerSession;
  explorerUrl: string | null;
  redirectIn?: number | null;
  onBack: () => void;
}) {
  const { status, session, explorerUrl, redirectIn, onBack } = props;

  const toast = useToast();

  const isSuccess = status === PAYER_WAIT_STATUS.Success;
  const isFailed = status === PAYER_WAIT_STATUS.Failed;
  const title = isSuccess
    ? "Payment Successful!"
    : isFailed
      ? "Payment Failed"
      : "Waiting for Payment...";
  const subtitle = isSuccess || isFailed ? null : "This can take 0-3 minutes";
  const tilde = isSuccess ? "" : "~";

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  };

  return (
    <CouponShell
      top={
        <div className="flex flex-col items-center">
          <StatusMark status={status} />
          <p className="mt-5 text-center font-montserrat text-lg font-medium text-black">{title}</p>
          {subtitle ? (
            <p className="mt-3 text-center font-montserrat text-sm font-medium text-[#606060]">
              {subtitle}
            </p>
          ) : null}
          {isSuccess && redirectIn != null && redirectIn > 0 ? (
            <p className="mt-3 text-center font-montserrat text-sm font-medium text-[#606060]">
              Redirecting in {redirectIn}s
            </p>
          ) : null}
        </div>
      }
      bottom={
        <>
          <p className="font-montserrat text-base font-medium text-black">Payment Details</p>
          <div className="mt-6 flex flex-col gap-[22px]">
            <DetailRow
              label="Recipient Address"
              value={(
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    {formatAddress(session.recipientAddress)}
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer text-[#606060] hover:text-[#000]"
                    onClick={() => {
                      handleCopy(session.recipientAddress);
                    }}
                  >
                    <IconCopy className="size-3" />
                  </button>
                </div>
              )}
            />
            <DetailRow
              label="Request Payment"
              value={`${session.requestAmount} ${formatTokenNetwork(session.destSymbol, session.destNetwork)}`}
            />
            <DetailRow
              label="You Pay"
              value={`${session.youPayAmount} ${formatTokenNetwork(session.originSymbol, session.originNetwork)}`}
            />
            <DetailRow
              label="Pay from"
              extra={<PrivateBadge />}
              value={(
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    {formatAddress(session.payerAddress)}
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer text-[#606060] hover:text-[#000]"
                    onClick={() => {
                      handleCopy(session.payerAddress);
                    }}
                  >
                    <IconCopy className="size-3" />
                  </button>
                </div>
              )}
            />
            <DetailRow label="Route" value="Near intents" />
            <DetailRow
              label="Total Fees"
              value={session.feesUsd ? `${tilde}${formatAmount(session.feesUsd, { maxDecimals: 2, showDust: true })}` : "—"}
            />
            <DetailRow
              label="Total Payout"
              value={session.payoutUsd ? `${tilde}${formatAmount(session.payoutUsd, { maxDecimals: 2, showDust: true })}` : "—"}
            />
            {isSuccess ? (
              <>
                <DetailRow label="Status" value="Complete" valueClassName="text-[#84a20f]" />
                <DetailRow label="Date" value={formatDate(session.paidAt)} />
              </>
            ) : null}
          </div>
          {isSuccess ? (
            <Button
              size={BUTTON_SIZE.Xl}
              className="mt-8 w-full"
              disabled={!explorerUrl}
              onClick={() => {
                if (!explorerUrl) return;
                window.open(explorerUrl, "_blank", "noopener,noreferrer");
              }}
            >
              View on Explorer
            </Button>
          ) : null}
          {isFailed ? (
            <Button size={BUTTON_SIZE.Xl} className="mt-8 w-full" onClick={onBack}>
              Back to Payment Page
            </Button>
          ) : null}
        </>
      }
    />
  );
}
