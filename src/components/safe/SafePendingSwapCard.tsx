import { safeQueueUrl } from "@/config/chains";
import { useSafePendingSwapStore } from "@/stores/safe-pending-swap";
import { safeAwaitingSignaturesMessage, SAFE_AWAITING_SIGNATURES_TITLE } from "@/wallet/evm/safe";

/**
 * The proposal started for this payment.
 *
 * Signing and executing both happen inside Safe{Wallet}, so this only reports state
 * and links out. It has to stay visible: the payer's money has not moved yet, and
 * without it the page looks as if the payment was never started.
 */
export function SafePendingSwapCard({ paymentId }: { paymentId: string }) {
  const items = useSafePendingSwapStore((state) => state.items);
  const mine = paymentId ? items.filter((item) => item.paymentId === paymentId) : [];
  if (mine.length === 0) return null;

  const now = Date.now();

  return (
    <div className="mb-4 rounded-[16px] border border-[#003bff]/20 bg-[#003bff]/5 p-4">
      <p className="font-montserrat text-sm font-medium text-black">
        {SAFE_AWAITING_SIGNATURES_TITLE}
      </p>
      {mine.map((item) => {
        const queueUrl = safeQueueUrl(item.chainId, item.safeAddress);
        const deadlineMs = Date.parse(item.deadline);
        const expired = Number.isFinite(deadlineMs) && deadlineMs <= now;
        return (
          <div key={item.id} className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-montserrat text-xs text-[#606060]">
              {safeAwaitingSignaturesMessage(item.threshold)}
              {expired ? " The quote has expired — reject it in your Safe." : ""}
            </p>
            {queueUrl ? (
              <a
                href={queueUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-montserrat text-sm font-medium text-[#003bff]"
              >
                Open Safe queue
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
