export const PAY_SWAP_TYPE = {
  ExactOutput: "EXACT_OUTPUT",
} as const;

export type PaySwapType = (typeof PAY_SWAP_TYPE)[keyof typeof PAY_SWAP_TYPE];

export interface PayQuoteParam {
  amount: string;
  destinationAmount: string;
  destinationNetwork: string;
  destinationSymbol: string;
  network: string;
  recipient: string;
  refundTo: string;
  slippageTolerance: number;
  swapType: PaySwapType;
  symbol: string;
}

export interface PaySwapParam extends PayQuoteParam {
  payer: string;
}

export interface PayQuoteResp {
  amountIn: string;
  amountInFormatted: string;
  amountInUsd: string;
  amountOut: string;
  amountOutFormatted: string;
  amountOutUsd: string;
  deadline: string;
  timeEstimate: number;
}

export interface PaySwapResp extends PayQuoteResp {
  depositAddress: string;
  swapId: string;
}

export interface PaySwapSubmitParam {
  swapId: string;
  txHash: string;
}

export interface PaySwapSubmitResp {
  paymentsId: string;
  status: string;
}

export interface PayCheckoutSessionBody {
  amount: string;
  network: string;
  out_order_no: string;
  recipient: string;
  success_url: string;
  symbol: string;
}

export interface PayCheckoutSession {
  amount: string;
  createdAt: string;
  expiresAt: string;
  network: string;
  outOrderNo: string;
  paymentsId: string;
  recipient: string;
  sessionId: string;
  status: string;
  successUrl: string;
  symbol: string;
}

export interface PayPaymentDetail {
  amount: string;
  destinationAmount: string;
  destinationNetwork: string;
  destinationSymbol: string;
  destinationTxHash: string;
  id: string;
  network: string;
  paidAt: string;
  payer: string;
  paymentsId: string;
  recipient: string;
  status: string;
  submittedAt: string;
  symbol: string;
  txHash: string;
}
