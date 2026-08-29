import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useNearintentsStatusQuery } from "@/hooks/use-nearintents-status";
import { txExplorerUrl } from "@/config/chains";
import { usePayerSessionStore } from "@/stores/payer-session";
import { PayerLayout } from "./components/PayerLayout";
import { WaitingCard } from "./components/WaitingCard";
import { PAYER_WAIT_STATUS, payerPath } from "./config";
import { waitStatusFromOneClick } from "./utils";

export function WaitingView() {
  const { linkId: idParam } = useParams();
  const linkId = idParam?.trim() || "";
  const navigate = useNavigate();
  const session = usePayerSessionStore((s) => s.session);
  const clearSession = usePayerSessionStore((s) => s.clearSession);
  const [hydrated, setHydrated] = useState(() => usePayerSessionStore.persist.hasHydrated());
  const statusQuery = useNearintentsStatusQuery(
    hydrated && session?.linkId === linkId ? session.depositAddress : null,
  );

  useEffect(() => {
    if (hydrated) return;
    return usePayerSessionStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  const waitStatus = waitStatusFromOneClick(statusQuery.data?.status);
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

  if (!linkId || !session || session.linkId !== linkId) {
    return <Navigate to={payerPath(linkId || "")} replace />;
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
        onBack={() => {
          clearSession();
          navigate(payerPath(linkId));
        }}
      />
    </PayerLayout>
  );
}
