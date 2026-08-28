import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { usePayOriginToken } from "@/hooks/use-pay-origin-token";
import { usePaymentLink } from "@/hooks/use-payment-link";
import { usePaymentWallet } from "@/hooks/use-payment-wallet";
import { useQuickPayCommitQueue } from "@/hooks/use-quick-pay-commit-queue";
import { useSinglePayQuote, useSinglePaySwap } from "@/hooks/use-single-payout-api";
import useToast from "@/hooks/use-toast";
import { QUICK_PAY_SLIPPAGE_TOLERANCE } from "@/config/payout";
import { useAuthStore } from "@/stores/auth";
import { useIntentsTokensStore, normalizeSymbol } from "@/stores/intents-tokens";
import { usePayerSessionStore } from "@/stores/payer-session";
import { enqueueQuickPayCommit } from "@/stores/quick-pay-commit-queue";
import { useTokenBalancesStore } from "@/stores/token-balances";
import type { PaySingleQuoteParam, PaySingleSwapParam } from "@/types/payout";
import { formatAmount } from "@/utils";
import { transferToDepositAddress } from "@/wallet/transfer-deposit";
import type { ChainKind } from "@/wallet";
import {
  PAYMENT_LINK_STATUS,
  PAYMENT_LINK_TYPE,
} from "@/mocks/payment-links";
import { PayerLayout } from "./components/PayerLayout";
import { PayCard } from "./components/PayCard";
import {
  AMOUNT_MAX_DECIMALS,
  PAYER_CARD_STATE,
  QUOTE_DEBOUNCE_MS,
  payerWaitingPath,
} from "./config";
import {
  formatQuoteErrorMessage,
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
  const { id: idParam } = useParams();
  const linkId = idParam?.trim() || "";
  const link = usePaymentLink(linkId);
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

  const isOpenAmount = link?.type === PAYMENT_LINK_TYPE.Open;
  const amountInput = isOpenAmount ? openAmount : (link?.amount ?? "");
  const destToken = useMemo(() => {
    if (!link) return null;
    const symbol = normalizeSymbol(link.token);
    if (!symbol) return null;
    return findByChainAndSymbol(link.network, symbol) ?? null;
  }, [findByChainAndSymbol, link, tokens]);

  const destinationAddress = link?.recipientAddress.trim() ?? "";
  const amountForQuote = parsePositiveDecimal(amountInput, AMOUNT_MAX_DECIMALS);
  const debouncedAmountForQuote = useDebouncedValue(amountForQuote, QUOTE_DEBOUNCE_MS);
  const linkPayable = Boolean(link && link.status === PAYMENT_LINK_STATUS.Active);

  const quoteBody = useMemo((): PaySingleQuoteParam | null => {
    if (
      !originToken
      || !destToken
      || !debouncedAmountForQuote
      || !destinationAddress
      || !walletReady
      || !connectedAddress
      || !linkPayable
    ) {
      return null;
    }
    const origin = payoutNetworkToken(originToken);
    const dest = payoutNetworkToken(destToken);
    return {
      amount: debouncedAmountForQuote,
      destinationAddress,
      destinationNetwork: dest.network,
      destinationToken: dest.token,
      network: origin.network,
      token: origin.token,
      refundTo: connectedAddress,
      slippageTolerance: QUICK_PAY_SLIPPAGE_TOLERANCE,
      payer: connectedAddress,
    };
  }, [
    originToken,
    destToken,
    debouncedAmountForQuote,
    destinationAddress,
    walletReady,
    connectedAddress,
    linkPayable,
  ]);

  const dryQuoteQuery = useSinglePayQuote(quoteBody, guestAuth);
  const swapMutation = useSinglePaySwap(guestAuth);
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
  const feeDisplay = feeUsd ? formatAmount(feeUsd) : "—";
  const durationDisplay = quote?.timeEstimate != null ? `~${quote.timeEstimate}s` : "—";
  const fetchOneBalance = useTokenBalancesStore((s) => s.fetchOne);

  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!originToken || !destToken || !amountForQuote || !quote || !destinationAddress || !connectedAddress || !link) {
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
      const swapBody: PaySingleSwapParam = {
        amount: amountForQuote,
        destinationAddress,
        destinationNetwork: dest.network,
        destinationToken: dest.token,
        network: origin.network,
        token: origin.token,
        refundTo: paymentWalletAddress,
        slippageTolerance: QUICK_PAY_SLIPPAGE_TOLERANCE,
        payer: paymentWalletAddress,
      };
      const memoValue = link.description?.trim();
      if (memoValue) swapBody.memo = memoValue;

      const swapped = await swapMutation.mutateAsync(swapBody);
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
      enqueueQuickPayCommit({ orderId: swapped.orderId, txHash });
      const youPayAmount = swapped.amountInFormatted
        ? formatAmount(swapped.amountInFormatted, { prefix: "", maxDecimals: AMOUNT_MAX_DECIMALS })
        : amountInDisplay;
      const payoutUsd = swapped.amountInUsd || quote.amountInUsd || "";
      const fees = payoutUsd && amountForQuote ? usdFee(payoutUsd, amountForQuote) : null;
      setSession({
        linkId,
        depositAddress,
        orderId: swapped.orderId,
        txHash,
        iconUrl: link.iconUrl,
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
      });
      navigate(payerWaitingPath(linkId));
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
    && linkPayable,
  );

  const cardState = (() => {
    if (!linkId || !link || link.status !== PAYMENT_LINK_STATUS.Active) {
      return PAYER_CARD_STATE.Unavailable;
    }
    return PAYER_CARD_STATE.Pay;
  })();

  function handlePay() {
    if (!connectedAddress) {
      paymentWallet.connectWallet();
      return;
    }
    if (!linkPayable) {
      toast.fail({ title: "This payment link is not available" });
      return;
    }
    void settleMutation.mutateAsync();
  }

  return (
    <PayerLayout iconUrl={link?.iconUrl}>
      <PayCard
        state={cardState}
        paymentTitle={link?.name ?? ""}
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
