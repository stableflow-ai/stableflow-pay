import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useNearintentsStatusQuery } from "@/hooks/use-nearintents-status";
import { txExplorerUrl } from "@/config/chains";
import { PAYER_KIND, usePayerSessionStore } from "@/stores/payer-session";
import { PayerLayout } from "./components/PayerLayout";
import { WaitingCard } from "./components/WaitingCard";
import {
  CHECKOUT_PATH,
  CHECKOUT_REDIRECT_SECONDS,
  CHECKOUT_SESSION_QUERY,
  PAYER_WAIT_STATUS,
  checkoutPath,
  payerPath,
} from "./config";
import { buildCheckoutSuccessUrl, waitStatusFromOneClick } from "./utils";

export function WaitingView() {
  const { pathname } = useLocation();
  const { linkId: idParam } = useParams();
  const [searchParams] = useSearchParams();
  const isCheckout = pathname.startsWith(CHECKOUT_PATH);
  const linkId = isCheckout ? "" : (idParam?.trim() || "");
  const sessionId = isCheckout ? (searchParams.get(CHECKOUT_SESSION_QUERY)?.trim() || "") : "";
  const paymentId = isCheckout ? sessionId : linkId;
  const navigate = useNavigate();
  const session = usePayerSessionStore((s) => s.session);
  const clearSession = usePayerSessionStore((s) => s.clearSession);
  const [hydrated, setHydrated] = useState(() => usePayerSessionStore.persist.hasHydrated());
  const sessionMatches = Boolean(
    session
    && session.paymentId === paymentId
    && session.kind === (isCheckout ? PAYER_KIND.Checkout : PAYER_KIND.Paylink),
  );
  const statusQuery = useNearintentsStatusQuery(
    hydrated && sessionMatches ? session?.depositAddress ?? null : null,
  );

  useEffect(() => {
    if (hydrated) return;
    return usePayerSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  const waitStatus = waitStatusFromOneClick(statusQuery.data?.status);
  const redirectUrl = session?.checkout ? buildCheckoutSuccessUrl(session.checkout) : null;
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

  const explorerUrl = useMemo(() => {
    if (!session) return null;
    const details = statusQuery.data?.swapDetails;
    const fromStatus = details?.destinationChainTxHashes?.[0]?.explorerUrl
      || details?.originChainTxHashes?.[0]?.explorerUrl
      || null;
    if (fromStatus) return fromStatus;
    const destHash = details?.destinationChainTxHashes?.[0]?.hash;
    if (destHash) return txExplorerUrl(session.destNetwork, destHash);
    return txExplorerUrl(session.originNetwork, session.txHash);
  }, [session, statusQuery.data]);

  if (!hydrated) {
    return <PayerLayout />;
  }

  const payPath = isCheckout ? checkoutPath(sessionId) : payerPath(linkId || "");

  if (!paymentId || !session || !sessionMatches) {
    return <Navigate to={payPath} replace />;
  }

  return (
    <PayerLayout
      iconUrl={session.iconUrl}
      footer={
        waitStatus === PAYER_WAIT_STATUS.Pending
          ? "You will be redirected once your transaction is complete."
          : undefined
      }
    >
      <WaitingCard
        status={waitStatus}
        session={session}
        explorerUrl={explorerUrl}
        redirectIn={redirectUrl && waitStatus === PAYER_WAIT_STATUS.Success ? redirectIn : null}
        onBack={() => {
          clearSession();
          navigate(payPath);
        }}
      />
    </PayerLayout>
  );
}
