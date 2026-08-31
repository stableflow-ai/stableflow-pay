import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCheckoutSessionQuery } from "@/hooks/use-checkout-session";
import { usePayPaymentQuery } from "@/hooks/use-pay-payment";
import { usePaymentLinkQuery } from "@/hooks/use-payment-link";
import { useQuickPayCommitQueue } from "@/hooks/use-quick-pay-commit-queue";
import { txExplorerUrl } from "@/config/chains";
import { onQuickPayCommitSuccess, peekLastQuickPayCommitSuccess } from "@/stores/quick-pay-commit-queue";
import { PayerLayout } from "./components/PayerLayout";
import { WaitingCard } from "./components/WaitingCard";
import {
  CHECKOUT_PATH,
  CHECKOUT_REDIRECT_SECONDS,
  CHECKOUT_SESSION_QUERY,
  PAYER_FEES_QUERY,
  PAYER_PATH_PREFIX,
  PAYER_PAYMENT_QUERY,
  PAYER_PAYOUT_QUERY,
  PAYER_WAIT_STATUS,
  PAYER_WAITING_STATE,
  checkoutPath,
  checkoutWaitingPath,
  payerPath,
  payerWaitingPath,
} from "./config";
import {
  buildCheckoutSuccessUrl,
  isCheckoutFailedWithoutPayment,
  isCheckoutSuspended,
  payerWaitDetailsFromSources,
  paymentLinkCardIconUrl,
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
  const feesUsd = searchParams.get(PAYER_FEES_QUERY)?.trim() || "";
  const payoutUsd = searchParams.get(PAYER_PAYOUT_QUERY)?.trim() || "";
  const awaitingSubmit = Boolean(
    !isCheckout && (state as { awaitingSubmit?: boolean } | null)?.awaitingSubmit === PAYER_WAITING_STATE.awaitingSubmit,
  );
  const navigate = useNavigate();
  useQuickPayCommitQueue();

  const checkoutQuery = useCheckoutSessionQuery(isCheckout ? sessionId : undefined, {
    poll: isCheckout && !queryPaymentId,
  });
  const checkout = checkoutQuery.data;
  const linkQuery = usePaymentLinkQuery(isCheckout ? undefined : linkId);
  const iconUrl = isCheckout ? checkout?.organization.logo : paymentLinkCardIconUrl(linkQuery.data);
  const checkoutPaymentsId = checkout?.paymentsId.trim() || "";
  const paymentId = queryPaymentId || (isCheckout ? checkoutPaymentsId : "");
  const paymentQuery = usePayPaymentQuery(paymentId);
  const payment = paymentQuery.data;

  useEffect(() => {
    const quoteQuery = { feesUsd, payoutUsd };
    function applyPaymentsId(paymentsId: string) {
      if (!paymentsId) return;
      if (isCheckout) {
        if (!sessionId) return;
        navigate(checkoutWaitingPath(sessionId, { ...quoteQuery, paymentId: paymentsId }), { replace: true });
        return;
      }
      if (!linkId) return;
      navigate(
        payerWaitingPath(linkId, { ...quoteQuery, paymentId: paymentsId }),
        { replace: true, state: PAYER_WAITING_STATE },
      );
    }

    if (!queryPaymentId) {
      const last = peekLastQuickPayCommitSuccess();
      if (last?.paymentsId) applyPaymentsId(last.paymentsId);
    }

    if (queryPaymentId) return;
    return onQuickPayCommitSuccess((result) => {
      applyPaymentsId(result.paymentsId);
    });
  }, [feesUsd, isCheckout, linkId, navigate, payoutUsd, queryPaymentId, sessionId]);

  const waitStatus = (() => {
    if (paymentId) return waitStatusFromPayment(payment?.status);
    if (isCheckout && checkout && isCheckoutSuspended(checkout)) {
      return PAYER_WAIT_STATUS.Suspended;
    }
    if (isCheckout && checkout && isCheckoutFailedWithoutPayment(checkout)) {
      return PAYER_WAIT_STATUS.Failed;
    }
    return PAYER_WAIT_STATUS.Pending;
  })();

  const redirectUrl = checkout && waitStatus === PAYER_WAIT_STATUS.Success
    ? buildCheckoutSuccessUrl(checkout, payment)
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
    feesUsd,
    payoutUsd,
  }), [checkout, feesUsd, payment, payoutUsd]);

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
    if (!queryPaymentId && checkoutQuery.isPending) {
      return <PayerLayout iconUrl={iconUrl} />;
    }
    if (!queryPaymentId && (checkoutQuery.isError || !checkout)) {
      return <Navigate to={checkoutPath(sessionId)} replace />;
    }
    if (!queryPaymentId && checkout && shouldCheckoutShowForm(checkout)) {
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
      iconUrl={iconUrl}
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
