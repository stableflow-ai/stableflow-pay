import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useCheckoutSessionQuery } from "@/hooks/use-checkout-session";
import { usePayOriginToken } from "@/hooks/use-pay-origin-token";
import { usePaymentLinkQuery } from "@/hooks/use-payment-link";
import { usePaymentWallet } from "@/hooks/use-payment-wallet";
import { useQuickPayCommitQueue } from "@/hooks/use-quick-pay-commit-queue";
import { usePayQuote, usePaySwap } from "@/hooks/use-pay-quote-api";
import useToast from "@/hooks/use-toast";
import { QUICK_PAY_SLIPPAGE_TOLERANCE } from "@/config/payout";
import { useAuthStore } from "@/stores/auth";
import { useIntentsTokensStore, normalizeSymbol } from "@/stores/intents-tokens";
import { PAYER_KIND, usePayerSessionStore } from "@/stores/payer-session";
import { enqueueQuickPayCommit } from "@/stores/quick-pay-commit-queue";
import { useTokenBalancesStore } from "@/stores/token-balances";
import { PAY_SWAP_TYPE, type PayQuoteParam, type PaySwapParam } from "@/types/pay";
import { formatAmount } from "@/utils";
import { transferToDepositAddress } from "@/wallet/transfer-deposit";
import type { ChainKind } from "@/wallet";
import { isPaymentLinkActive, isPaymentLinkOpen } from "@/views/payment-links/utils";
import { PayerLayout } from "./components/PayerLayout";
import { PayCard } from "./components/PayCard";
import {
  AMOUNT_MAX_DECIMALS,
  CHECKOUT_PATH,
  CHECKOUT_SESSION_QUERY,
  PAYER_CARD_STATE,
  QUOTE_DEBOUNCE_MS,
  checkoutWaitingPath,
  payerWaitingPath,
} from "./config";
import {
  formatQuoteErrorMessage,
  isCheckoutOpenAmount,
  isCheckoutPayable,
  isDryQuoteStale,
  parsePositiveDecimal,
  payoutNetworkToken,
  usdFee,
} from "./utils";

class BalanceGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BalanceGateError";
  }
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function PayView() {
  const { pathname } = useLocation();
  const { linkId: idParam } = useParams();
  const [searchParams] = useSearchParams();
  const isCheckout = pathname === CHECKOUT_PATH || pathname.startsWith(`${CHECKOUT_PATH}/`);
  const linkId = isCheckout ? "" : (idParam?.trim() || "");
  const sessionId = isCheckout ? (searchParams.get(CHECKOUT_SESSION_QUERY)?.trim() || "") : "";
  const linkQuery = usePaymentLinkQuery(linkId);
  const checkoutQuery = useCheckoutSessionQuery(sessionId);
  const link = linkQuery.data;
  const checkout = checkoutQuery.data;
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const guestAuth = { auth: Boolean(token) };
  const toast = useToast();
  useQuickPayCommitQueue();
  const setSession = usePayerSessionStore((s) => s.setSession);
  const ensureFresh = useIntentsTokensStore((s) => s.ensureFresh);
  const tokens = useIntentsTokensStore((s) => s.tokens);
  const findByChainAndSymbol = useIntentsTokensStore((s) => s.findByChainAndSymbol);
  const { originToken, setOriginToken } = usePayOriginToken();
  const originKind: ChainKind = originToken?.chain.chainKind ?? "evm";
  const paymentWallet = usePaymentWallet(originKind);
  const wallet = paymentWallet.wallet;
  const connectedAddress = paymentWallet.connectedAddress;
  const walletReady = Boolean(connectedAddress);
  const [openAmount, setOpenAmount] = useState("");
  const [phase, setPhase] = useState<"idle" | "quoting" | "sending">("idle");

  useEffect(() => {
    void ensureFresh();
  }, [ensureFresh]);

  const payment = useMemo(() => {
    if (isCheckout) {
      if (!checkout) return null;
      return {
        kind: PAYER_KIND.Checkout,
        id: checkout.sessionId || sessionId,
        title: checkout.outOrderNo.trim() || "Payment",
        amount: checkout.amount,
        symbol: checkout.symbol,
        network: checkout.network,
        recipient: checkout.recipient,
        payable: isCheckoutPayable(checkout),
        isOpenAmount: isCheckoutOpenAmount(checkout),
        checkout,
      };
    }
    if (!link) return null;
    return {
      kind: PAYER_KIND.Paylink,
      id: link.linkId || linkId,
      title: link.title,
      amount: link.amount,
      symbol: link.symbol,
      network: link.network,
      recipient: link.recipient,
      payable: isPaymentLinkActive(link.status),
      isOpenAmount: isPaymentLinkOpen(link),
      checkout: undefined,
    };
  }, [checkout, isCheckout, link, linkId, sessionId]);

  const isOpenAmount = Boolean(payment?.isOpenAmount);
  const amountInput = isOpenAmount ? openAmount : (payment?.amount ?? "");
  const destToken = useMemo(() => {
    if (!payment) return null;
    const symbol = normalizeSymbol(payment.symbol);
    if (!symbol) return null;
    return findByChainAndSymbol(payment.network, symbol) ?? null;
  }, [findByChainAndSymbol, payment, tokens]);

  const destinationAddress = payment?.recipient.trim() ?? "";
  const amountForQuote = parsePositiveDecimal(amountInput, AMOUNT_MAX_DECIMALS);
  const debouncedAmountForQuote = useDebouncedValue(amountForQuote, QUOTE_DEBOUNCE_MS);
  const payable = Boolean(payment?.payable);

  const quoteBody = useMemo((): PayQuoteParam | null => {
    if (
      !originToken
      || !destToken
      || !debouncedAmountForQuote
      || !destinationAddress
      || !walletReady
      || !connectedAddress
      || !payable
    ) {
      return null;
    }
    const origin = payoutNetworkToken(originToken);
    const dest = payoutNetworkToken(destToken);
    return {
      amount: debouncedAmountForQuote,
      destinationAmount: debouncedAmountForQuote,
      destinationNetwork: dest.network,
      destinationSymbol: dest.token,
      network: origin.network,
      recipient: destinationAddress,
      refundTo: connectedAddress,
      slippageTolerance: QUICK_PAY_SLIPPAGE_TOLERANCE,
      swapType: PAY_SWAP_TYPE.ExactOutput,
      symbol: origin.token,
    };
  }, [
    originToken,
    destToken,
    debouncedAmountForQuote,
    destinationAddress,
    walletReady,
    connectedAddress,
    payable,
  ]);

  const dryQuoteQuery = usePayQuote(quoteBody, guestAuth);
  const swapMutation = usePaySwap(guestAuth);
  const quote = amountForQuote && destinationAddress && destToken ? dryQuoteQuery.data : undefined;
  const dryQuoteStale = isDryQuoteStale({
    amountForQuote,
    debouncedAmountForQuote,
    isPlaceholderData: dryQuoteQuery.isPlaceholderData,
    isPending: dryQuoteQuery.isPending,
    isFetching: dryQuoteQuery.isFetching,
  });
  const quoteError = dryQuoteQuery.isError ? formatQuoteErrorMessage(dryQuoteQuery.error, 2) : null;
  const amountInDisplay = quote?.amountInFormatted
    ? formatAmount(quote.amountInFormatted, { prefix: "", maxDecimals: AMOUNT_MAX_DECIMALS })
    : "—";
  const fiatDisplay = quote?.amountInUsd
    ? formatAmount(quote.amountInUsd, { maxDecimals: 2 })
    : "";
  const feeUsd = quote?.amountInUsd && amountForQuote
    ? usdFee(quote.amountInUsd, amountForQuote)
    : null;
  const feeDisplay = feeUsd ? formatAmount(feeUsd, { maxDecimals: 2, showDust: true }) : "—";
  const durationDisplay = quote?.timeEstimate != null ? `~${quote.timeEstimate}s` : "—";
  const fetchOneBalance = useTokenBalancesStore((s) => s.fetchOne);

  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!originToken || !destToken || !amountForQuote || !quote || !destinationAddress || !connectedAddress || !payment) {
        throw new Error("Missing payment inputs");
      }
      if (!wallet.isConnected || !wallet.account?.address) {
        paymentWallet.connectWallet();
        throw new Error("Connect your payment wallet first");
      }
      const paymentWalletAddress = wallet.account.address;
      setPhase("quoting");
      const origin = payoutNetworkToken(originToken);
      const dest = payoutNetworkToken(destToken);
      const swapBody: PaySwapParam = {
        amount: amountForQuote,
        destinationAmount: amountForQuote,
        destinationNetwork: dest.network,
        destinationSymbol: dest.token,
        network: origin.network,
        recipient: destinationAddress,
        refundTo: paymentWalletAddress,
        slippageTolerance: QUICK_PAY_SLIPPAGE_TOLERANCE,
        swapType: PAY_SWAP_TYPE.ExactOutput,
        symbol: origin.token,
        payer: paymentWalletAddress,
      };

      const swapped = await swapMutation.mutateAsync({
        kind: payment.kind,
        id: payment.id,
        body: swapBody,
      });
      const depositAddress = swapped.depositAddress?.trim();
      if (!depositAddress) {
        throw new Error("Missing deposit address");
      }
      const amountIn = BigInt(swapped.amountIn || "0");

      const balance = await fetchOneBalance(paymentWalletAddress, originToken);
      if (!balance || balance.status !== "success" || balance.raw == null) {
        toast.fail({ title: "Could not read wallet balance" });
        throw new BalanceGateError("Could not read wallet balance");
      }
      if (balance.raw < amountIn && import.meta.env.VITE_VIRIFY_BALANCE !== "false") {
        toast.fail({ title: "Insufficient balance" });
        throw new BalanceGateError("Insufficient balance");
      }
      setPhase("sending");
      const txHash = await transferToDepositAddress({
        token: originToken,
        depositAddress,
        amountIn,
      });
      enqueueQuickPayCommit({ swapId: swapped.swapId, txHash });
      const youPayAmount = swapped.amountInFormatted
        ? formatAmount(swapped.amountInFormatted, { prefix: "", maxDecimals: AMOUNT_MAX_DECIMALS })
        : amountInDisplay;
      const payoutUsd = swapped.amountInUsd || quote.amountInUsd || "";
      const fees = payoutUsd && amountForQuote ? usdFee(payoutUsd, amountForQuote) : null;
      const checkoutSnap = payment.checkout;
      setSession({
        kind: payment.kind,
        paymentId: payment.id,
        depositAddress,
        swapId: swapped.swapId,
        txHash,
        iconUrl: null,
        recipientAddress: destinationAddress,
        requestAmount: amountForQuote,
        destSymbol: destToken.symbol,
        destNetwork: destToken.blockchain,
        youPayAmount,
        originSymbol: originToken.symbol,
        originNetwork: originToken.blockchain,
        payerAddress: paymentWalletAddress,
        amountInUsd: payoutUsd,
        feesUsd: fees ?? "",
        payoutUsd,
        timeEstimate: swapped.timeEstimate ?? quote.timeEstimate,
        paidAt: Date.now(),
        checkout: checkoutSnap
          ? {
              amount: amountForQuote,
              createdAt: checkoutSnap.createdAt,
              expiresAt: checkoutSnap.expiresAt,
              network: checkoutSnap.network,
              outOrderNo: checkoutSnap.outOrderNo,
              recipient: checkoutSnap.recipient,
              sessionId: checkoutSnap.sessionId,
              symbol: checkoutSnap.symbol,
              successUrl: checkoutSnap.successUrl,
            }
          : undefined,
      });
      navigate(
        payment.kind === PAYER_KIND.Checkout
          ? checkoutWaitingPath(payment.id)
          : payerWaitingPath(payment.id),
      );
    },
    onError: (err) => {
      setPhase("idle");
      if (err instanceof BalanceGateError) return;
      toast.fail({ title: formatQuoteErrorMessage(err, 2) });
    },
  });

  const sending = settleMutation.isPending || phase === "quoting" || phase === "sending";
  const quoteLoading = Boolean(amountForQuote && destinationAddress && destToken && originToken && walletReady)
    && (dryQuoteStale || dryQuoteQuery.isFetching);
  const canPay = Boolean(
    destinationAddress
    && destToken
    && amountForQuote
    && originToken
    && quote
    && !dryQuoteStale
    && !quoteError
    && !sending
    && payable,
  );

  const detailPending = isCheckout ? checkoutQuery.isPending : linkQuery.isPending;
  const missingId = isCheckout ? !sessionId : !linkId;

  const cardState = (() => {
    if (isCheckout && !sessionId) {
      return PAYER_CARD_STATE.Unavailable;
    }
    if (missingId || detailPending) {
      return PAYER_CARD_STATE.Loading;
    }
    if (isCheckout && (checkoutQuery.isError || !checkout)) {
      return PAYER_CARD_STATE.Unavailable;
    }
    if (!isCheckout && (linkQuery.isError || !link)) {
      return PAYER_CARD_STATE.Unavailable;
    }
    if (!payment || !payment.payable) {
      return PAYER_CARD_STATE.Unavailable;
    }
    return PAYER_CARD_STATE.Pay;
  })();

  function handlePay() {
    if (!connectedAddress) {
      paymentWallet.connectWallet();
      return;
    }
    if (!payable) {
      toast.fail({ title: "This payment is not available" });
      return;
    }
    void settleMutation.mutateAsync();
  }

  return (
    <PayerLayout>
      <PayCard
        state={cardState}
        paymentTitle={payment?.title ?? ""}
        isOpenAmount={isOpenAmount}
        amount={amountInput}
        onAmountChange={setOpenAmount}
        destToken={destToken}
        youPayAmount={amountInDisplay}
        fiatDisplay={fiatDisplay}
        originToken={originToken}
        onOriginTokenChange={setOriginToken}
        walletAddress={connectedAddress}
        walletConnected={wallet.isConnected}
        walletIcon={originKind === "evm" ? paymentWallet.walletInfo.icon : null}
        connecting={wallet.isConnecting}
        onConnectWallet={() => paymentWallet.connectWallet()}
        onDisconnectWallet={() => paymentWallet.disconnect()}
        feeDisplay={feeDisplay}
        durationDisplay={durationDisplay}
        quoteError={quoteError}
        payLoading={sending || quoteLoading}
        canPay={canPay}
        walletReady={walletReady}
        onPay={handlePay}
      />
    </PayerLayout>
  );
}
