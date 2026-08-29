export interface PayPaymentLink {
  linkId: string;
  title: string;
  description: string;
  amount: string;
  symbol: string;
  network: string;
  recipient: string;
  status: string;
  createdAt: string;
}

export interface PayPaymentLinkBody {
  title: string;
  description: string;
  amount: string;
  symbol: string;
  network: string;
  recipient: string;
}
