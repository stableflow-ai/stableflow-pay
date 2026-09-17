import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { paySwapSubmit } from "@/api/pay";
import { useCheckoutSessionQuery } from "@/hooks/use-checkout-session";
import { usePayPaymentQuery } from "@/hooks/use-pay-payment";
import { usePaymentLinkQuery } from "@/hooks/use-payment-link";
import { txExplorerUrl } from "@/config/chains";
import {
  MULTISIG_WATCH_STATUS,
  isWatchablePendingMultisig,
  pendingMultisigSessionId,
  txHashForSubmit,
  watchMultisigProposal,
} from "@/wallet/multisig";
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
} from "./config";
import { dropWaitingMultisig, parseWaitingMultisig } from "./multisig-query";
import {
  buildCheckoutSuccessUrl,
  isCheckoutFailedWithoutPayment,
  isCheckoutSuspended,
  payerWaitDetailsFromSources,
  paymentLinkCardIconUrl,
  shouldCheckoutShowForm,
  waitStatusFromPayment,
} from "./utils";
import { canStayOnWaitingPage, waitingCardCopy } from "./waiting-copy";

export function WaitingView() {
  const { pathname, state } = useLocation();
  const { linkId: idParam } = useParams();
  const [searchParams] = useSearchParams();
  const isCheckout = pathname.startsWith(CHECKOUT_PATH);
  const linkId = isCheckout ? "" : (idParam?.trim() || "");
  const sessionId = isCheckout ? (searchParams.get(CHECKOUT_SESSION_QUERY)?.trim() || "") : "";
  const queryPaymentId = searchParams.get(PAYER_PAYMENT_QUERY)?.trim() || "";
  const pendingMultisig = useMemo(() => parseWaitingMultisig(searchParams), [searchParams]);
  const awaitingSubmit = Boolean(
    !isCheckout && (state as { awaitingSubmit?: boolean } | null)?.awaitingSubmit === PAYER_WAITING_STATE.awaitingSubmit,
  );
  const canStay = canStayOnWaitingPage({
    paymentId: queryPaymentId,
    awaitingSubmit,
    hasMultisigQuery: Boolean(pendingMultisig),
  });
  const navigate = useNavigate();
  const [msSigned, setMsSigned] = useState<number | null>(null);
  const [msRequired, setMsRequired] = useState<number | null>(null);
  const [msFailed, setMsFailed] = useState(false);
  const submittedRef = useRef(false);

  const checkoutQuery = useCheckoutSessionQuery(isCheckout ? sessionId : undefined, {
    poll: isCheckout && !queryPaymentId && !pendingMultisig,
  });
  const checkout = checkoutQuery.data;
  const linkQuery = usePaymentLinkQuery(isCheckout ? undefined : linkId);
  const iconUrl = isCheckout ? checkout?.organization.logo : paymentLinkCardIconUrl(linkQuery.data);
  const checkoutPaymentsId = checkout?.paymentsId.trim() || "";
  const paymentId = queryPaymentId || (isCheckout ? checkoutPaymentsId : "");
  const paymentQuery = usePayPaymentQuery(paymentId);
  const payment = paymentQuery.data;
  const multisigPending = Boolean(pendingMultisig) && !paymentId && !msFailed;

  const waitStatus = (() => {
    if (msFailed) return PAYER_WAIT_STATUS.Failed;
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

  const watchKey = pendingMultisig && !queryPaymentId
    ? `${pendingMultisig.swapId}:${pendingMultisigSessionId(pendingMultisig.proposal)}`
    : "";

  const waitingSearch = searchParams.toString();

  useEffect(() => {
    if (!watchKey || !pendingMultisig || queryPaymentId) {
      submittedRef.current = false;
      return;
    }
    const current = pendingMultisig;
    const controller = new AbortController();
    submittedRef.current = false;
    setMsFailed(false);
    setMsSigned(null);
    setMsRequired(null);

    async function run() {
      const { swapId, proposal } = current;
      const snap = isWatchablePendingMultisig(proposal)
        ? await watchMultisigProposal(proposal, (next) => {
          if (controller.signal.aborted) return;
          setMsSigned(next.signed);
          setMsRequired(next.required);
        }, controller.signal)
        : {
          signed: null,
          required: null,
          status: MULTISIG_WATCH_STATUS.Success,
          txHash: null,
        };
      if (controller.signal.aborted) return;
      if (snap.status !== MULTISIG_WATCH_STATUS.Success) {
        setMsFailed(true);
        return;
      }
      if (submittedRef.current) return;
      submittedRef.current = true;
      const next = new URLSearchParams(waitingSearch);
      dropWaitingMultisig(next);
      try {
        const submitted = await paySwapSubmit(
          { swapId, txHash: txHashForSubmit(snap.txHash) },
          { auth: false },
        );
        const paymentsId = submitted.paymentsId.trim();
        if (paymentsId) next.set(PAYER_PAYMENT_QUERY, paymentsId);
        navigate({ search: next.toString() }, {
          replace: true,
          state: paymentsId ? undefined : PAYER_WAITING_STATE,
        });
      } catch {
        navigate({ search: next.toString() }, {
          replace: true,
          state: PAYER_WAITING_STATE,
        });
      }
    }

    void run().catch((error) => {
      if (controller.signal.aborted) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMsFailed(true);
    });
    return () => controller.abort();
  }, [navigate, pendingMultisig, queryPaymentId, waitingSearch, watchKey]);

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

  const copy = waitingCardCopy({
    status: waitStatus,
    multisigPending,
    signed: msSigned,
    required: msRequired,
  });

  if (isCheckout) {
    if (!sessionId) {
      return <Navigate to={CHECKOUT_PATH} replace />;
    }
    if (!canStay && checkoutQuery.isPending) {
      return <PayerLayout iconUrl={iconUrl} />;
    }
    if (!canStay && (checkoutQuery.isError || !checkout)) {
      return <Navigate to={checkoutPath(sessionId)} replace />;
    }
    if (!canStay && checkout && shouldCheckoutShowForm(checkout)) {
      return <Navigate to={checkoutPath(sessionId)} replace />;
    }
  } else {
    if (!linkId) {
      return <Navigate to={PAYER_PATH_PREFIX} replace />;
    }
    if (!canStay) {
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
        title={copy.title}
        subtitle={copy.subtitle}
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
