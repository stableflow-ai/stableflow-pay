export const PAYMENT_LINK_TYPE = {
  Fixed: "fixed",
  Open: "open",
} as const;

export type PaymentLinkType = (typeof PAYMENT_LINK_TYPE)[keyof typeof PAYMENT_LINK_TYPE];

export const PAYMENT_LINK_STATUS = {
  Active: "active",
  Inactive: "inactive",
} as const;

export type PaymentLinkStatus = (typeof PAYMENT_LINK_STATUS)[keyof typeof PAYMENT_LINK_STATUS];

export interface PaymentLinkTransaction {
  id: string;
  paidAt: string;
  payer: string;
  paid: string;
  token: string;
  network: string;
  paidValue: number;
  txHash: string;
}

export interface PaymentLink {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  recipientAddress: string;
  type: PaymentLinkType;
  amount: string | null;
  token: string;
  network: string;
  revenue: number;
  paymentCount: number;
  status: PaymentLinkStatus;
  createdAt: string;
  price: number;
  transactions: PaymentLinkTransaction[];
}

const PAYER_ICON_URL = "/pay/naer-ai.svg";
const PAYER_RECIPIENT = "nearaibot.near";

const PAYER = "0x541a1234567890abcdef123456789038Dc1";

const TX_NEAR: PaymentLinkTransaction = {
  id: "tx-1",
  paidAt: "2026-08-01T11:56:00",
  payer: PAYER,
  paid: "10",
  token: "USDC",
  network: "near",
  paidValue: 10,
  txHash: "0xnearhash1000apicredits01",
};

const TX_ETH: PaymentLinkTransaction = {
  id: "tx-2",
  paidAt: "2026-07-15T11:56:00",
  payer: PAYER,
  paid: "10",
  token: "USDT",
  network: "eth",
  paidValue: 10,
  txHash: "0xethhash1000apicredits02",
};

function buildTransactions(count: number, prefix: string): PaymentLinkTransaction[] {
  return Array.from({ length: count }, (_, index) => {
    const template = index % 2 === 0 ? TX_NEAR : TX_ETH;
    return {
      ...template,
      id: `${prefix}-${index + 1}`,
      txHash: `${template.txHash}-${index + 1}`,
    };
  });
}

const FIGMA_LINKS: PaymentLink[] = [
  {
    id: "1",
    name: "1000 Credit",
    description: null,
    iconUrl: PAYER_ICON_URL,
    recipientAddress: PAYER_RECIPIENT,
    type: PAYMENT_LINK_TYPE.Fixed,
    amount: "10",
    token: "USDT",
    network: "near",
    revenue: 120,
    paymentCount: 12,
    status: PAYMENT_LINK_STATUS.Active,
    createdAt: "2026-08-01T11:56:00",
    price: 10,
    transactions: [{ ...TX_NEAR, id: "tx-1-a", token: "USDT", paid: "10", paidValue: 10, txHash: "0xnearhash-test-api-1" }],
  },
  {
    id: "2",
    name: "1000 Credit",
    description: null,
    iconUrl: PAYER_ICON_URL,
    recipientAddress: PAYER_RECIPIENT,
    type: PAYMENT_LINK_TYPE.Open,
    amount: null,
    token: "USDT",
    network: "near",
    revenue: 558.78,
    paymentCount: 28,
    status: PAYMENT_LINK_STATUS.Active,
    createdAt: "2026-08-01T11:56:00",
    price: 20,
    transactions: buildTransactions(28, "tx-2"),
  },
  {
    id: "3",
    name: "Standard Package",
    description: null,
    iconUrl: PAYER_ICON_URL,
    recipientAddress: PAYER_RECIPIENT,
    type: PAYMENT_LINK_TYPE.Fixed,
    amount: "20",
    token: "USDC",
    network: "near",
    revenue: 1020,
    paymentCount: 34,
    status: PAYMENT_LINK_STATUS.Active,
    createdAt: "2026-07-20T09:12:00",
    price: 20,
    transactions: [{ ...TX_NEAR, id: "tx-3-a", paid: "20", paidValue: 20, txHash: "0xnearhash-standard-1" }],
  },
  {
    id: "4",
    name: "Advance Package",
    description: null,
    iconUrl: PAYER_ICON_URL,
    recipientAddress: PAYER_RECIPIENT,
    type: PAYMENT_LINK_TYPE.Fixed,
    amount: "50",
    token: "USDC",
    network: "near",
    revenue: 864,
    paymentCount: 72,
    status: PAYMENT_LINK_STATUS.Inactive,
    createdAt: "2026-06-10T14:30:00",
    price: 50,
    transactions: [],
  },
];

const EXTRA_LINKS: PaymentLink[] = Array.from({ length: 20 }, (_, index) => {
  const n = index + 5;
  const isOpen = n % 3 === 0;
  return {
    id: String(n),
    name: `API Credits Pack ${n}`,
    description: null,
    iconUrl: PAYER_ICON_URL,
    recipientAddress: PAYER_RECIPIENT,
    type: isOpen ? PAYMENT_LINK_TYPE.Open : PAYMENT_LINK_TYPE.Fixed,
    amount: isOpen ? null : n % 2 === 0 ? "50" : "20",
    token: "USDC",
    network: "near",
    revenue: 40 + n * 12,
    paymentCount: n,
    status: n % 5 === 0 ? PAYMENT_LINK_STATUS.Inactive : PAYMENT_LINK_STATUS.Active,
    createdAt: "2026-05-01T10:00:00",
    price: isOpen ? 20 : n % 2 === 0 ? 50 : 20,
    transactions: [],
  };
});

const PAYMENT_LINKS: PaymentLink[] = [...FIGMA_LINKS, ...EXTRA_LINKS];

export function getPaymentLinks(): PaymentLink[] {
  return PAYMENT_LINKS.map((link) => ({
    ...link,
    transactions: link.transactions.map((row) => ({ ...row })),
  }));
}

export function getPaymentLinkById(id: string): PaymentLink | null {
  const link = PAYMENT_LINKS.find((row) => row.id === id);
  if (!link) return null;
  return {
    ...link,
    transactions: link.transactions.map((row) => ({ ...row })),
  };
}

export interface CreatePaymentLinkInput {
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: PaymentLinkType;
  amount: string | null;
  token: string;
  network: string;
  recipientAddress: string;
}

export interface CreatedPaymentLink {
  id: string;
}

const LINK_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomPaymentLinkId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(21));
  let body = "";
  for (const byte of bytes) {
    body += LINK_ID_ALPHABET[byte % LINK_ID_ALPHABET.length];
  }
  return `pl_${body}`;
}

export function createPaymentLink(_input: CreatePaymentLinkInput): CreatedPaymentLink {
  return { id: randomPaymentLinkId() };
}
