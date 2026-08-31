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
  revenue: string;
  payments: number;
  organization: { logo: string };
}

export interface PayPaymentLinkBody {
  title: string;
  description: string;
  amount: string;
  symbol: string;
  network: string;
  recipient: string;
}

export interface PayPaymentLinksQuery {
  page: number;
  pageSize: number;
  q?: string;
}

export interface PayPaymentLinksResp {
  total: number;
  totalPage: number;
  list: PayPaymentLink[];
}

export interface PayPaymentLinkPaymentsQuery {
  page: number;
  pageSize: number;
}
