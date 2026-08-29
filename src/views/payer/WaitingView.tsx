import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCheckoutSessionQuery } from "@/hooks/use-checkout-session";
import { usePayPaymentQuery } from "@/hooks/use-pay-payment";
import { useQuickPayCommitQueue } from "@/hooks/use-quick-pay-commit-queue";
import { txExplorerUrl } from "@/config/chains";
import { onQuickPayCommitSuccess } from "@/stores/quick-pay-commit-queue";
import { PayerLayout } from "./components/PayerLayout";
import { WaitingCard } from "./components/WaitingCard";
import {
  CHECKOUT_PATH,
  CHECKOUT_REDIRECT_SECONDS,
  CHECKOUT_SESSION_QUERY,
  PAYER_PATH_PREFIX,
  PAYER_PAYMENT_QUERY,
  PAYER_WAIT_STATUS,
  PAYER_WAITING_STATE,
  checkoutPath,
  payerPath,
  payerWaitingPath,
} from "./config";
import {
  buildCheckoutSuccessUrl,
  isCheckoutFailedWithoutPayment,
  isCheckoutSuspended,
  payerWaitDetailsFromSources,
  shouldCheckoutShowForm,
  waitStatusFromPayment,
} from "./utils";

export function WaitingView() {
  const { pathname, state } = useLocation();
  const { linkId: idParam } = useParams();
  const [searchParams] = useSearchParams();
  const isCheckout = pathname.startsWith(CHECKOUT_PATH);
  const linkId = isCheckout ? "" : (idParam?.trim() || "");
  const sessionId = isCheckout ? (searchParams.get(CHECKOUT_SESSION_QUERY)?.trim() || "") : "";
  const queryPaymentId = searchParams.get(PAYER_PAYMENT_QUERY)?.trim() || "";
  const awaitingSubmit = Boolean(
    !isCheckout && (state as { awaitingSubmit?: boolean } | null)?.awaitingSubmit === PAYER_WAITING_STATE.awaitingSubmit,
  );
  const navigate = useNavigate();
  useQuickPayCommitQueue();

  const checkoutQuery = useCheckoutSessionQuery(isCheckout ? sessionId : undefined, { poll: true });
  const checkout = checkoutQuery.data;
  const checkoutPaymentsId = checkout?.paymentsId.trim() || "";
  const paymentId = isCheckout ? checkoutPaymentsId : queryPaymentId;
  const paymentQuery = usePayPaymentQuery(paymentId);
  const payment = paymentQuery.data;

  useEffect(() => {
    if (isCheckout || queryPaymentId) return;
    return onQuickPayCommitSuccess((result) => {
      if (!result.paymentsId || !linkId) return;
      navigate(payerWaitingPath(linkId, result.paymentsId), { replace: true });
    });
  }, [isCheckout, linkId, navigate, queryPaymentId]);

  const waitStatus = (() => {
    if (isCheckout && checkout && isCheckoutSuspended(checkout)) {
      return PAYER_WAIT_STATUS.Suspended;
    }
    if (isCheckout && checkout && isCheckoutFailedWithoutPayment(checkout)) {
      return PAYER_WAIT_STATUS.Failed;
    }
    return waitStatusFromPayment(payment?.status);
  })();

  const redirectUrl = checkout && waitStatus === PAYER_WAIT_STATUS.Success
    ? buildCheckoutSuccessUrl(checkout)
    : null;
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  useEffect(() => {
    if (waitStatus !== PAYER_WAIT_STATUS.Success || !redirectUrl) {
      setRedirectIn(null);
      return;
    }
    setRedirectIn(CHECKOUT_REDIRECT_SECONDS);
    const timer = window.setInterval(() => {
      setRedirectIn((current) => {
        if (current == null || current <= 1) {
          window.clearInterval(timer);
          window.location.assign(redirectUrl);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [redirectUrl, waitStatus]);

  const details = useMemo(() => payerWaitDetailsFromSources({
    checkout,
    payment,
    fallbackRecipient: checkout?.recipient,
    fallbackAmount: checkout?.amount,
    fallbackSymbol: checkout?.symbol,
    fallbackNetwork: checkout?.network,
  }), [checkout, payment]);

  const explorerUrl = useMemo(() => {
    const destHash = payment?.destinationTxHash.trim();
    if (destHash && details.destNetwork) return txExplorerUrl(details.destNetwork, destHash);
    const originHash = payment?.txHash.trim();
    if (originHash && details.originNetwork) return txExplorerUrl(details.originNetwork, originHash);
    return null;
  }, [details.destNetwork, details.originNetwork, payment]);

  if (isCheckout) {
    if (!sessionId) {
      return <Navigate to={CHECKOUT_PATH} replace />;
    }
    if (checkoutQuery.isPending) {
      return <PayerLayout />;
    }
    if (checkoutQuery.isError || !checkout) {
      return <Navigate to={checkoutPath(sessionId)} replace />;
    }
    if (shouldCheckoutShowForm(checkout)) {
      return <Navigate to={checkoutPath(sessionId)} replace />;
    }
  } else {
    if (!linkId) {
      return <Navigate to={PAYER_PATH_PREFIX} replace />;
    }
    if (!queryPaymentId && !awaitingSubmit) {
      return <Navigate to={payerPath(linkId)} replace />;
    }
  }

  const payPath = isCheckout ? checkoutPath(sessionId) : payerPath(linkId);

  return (
    <PayerLayout
      footer={
        waitStatus === PAYER_WAIT_STATUS.Pending
          ? "You will be redirected once your transaction is complete."
          : undefined
      }
    >
      <WaitingCard
        status={waitStatus}
        details={details}
        explorerUrl={explorerUrl}
        redirectIn={redirectUrl && waitStatus === PAYER_WAIT_STATUS.Success ? redirectIn : null}
        onBack={() => {
          navigate(payPath);
        }}
      />
    </PayerLayout>
  );
}
