export const OVERVIEW_METRIC = {
  Volume: "volume",
  Transaction: "transaction",
} as const;

export type OverviewMetric = (typeof OVERVIEW_METRIC)[keyof typeof OVERVIEW_METRIC];

export const OVERVIEW_RANGE = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
} as const;

export type OverviewRange = (typeof OVERVIEW_RANGE)[keyof typeof OVERVIEW_RANGE];

export interface OverviewOrganization {
  name: string;
  initials: string;
  organizationId: string;
  slug: string;
  apiKeyCount: number;
  logoUrl: string;
}

export interface OverviewStats {
  totalRevenue: number;
  totalTransactions: number;
  activeLinks: number;
  apiKeys: number;
}

export interface OverviewChartPoint {
  label: string;
  volume: number;
  transactions: number;
}

export interface OverviewRevenueLink {
  id: string;
  name: string;
  amount: number;
}

export interface OverviewDashboard {
  organization: OverviewOrganization;
  stats: OverviewStats;
  chart: OverviewChartPoint[];
  topRevenueLinks: OverviewRevenueLink[];
}

const OVERVIEW_DASHBOARD: OverviewDashboard = {
  organization: {
    name: "Eureka Labs",
    initials: "EL",
    organizationId: "s4HdfCZsVQn3Y5qEtkMrJjdnh5LCKsYC",
    slug: "org-HE0QuaHm",
    apiKeyCount: 3,
    logoUrl: "",
  },
  stats: {
    totalRevenue: 2526.78,
    totalTransactions: 146,
    activeLinks: 3,
    apiKeys: 3,
  },
  chart: [
    { label: "Aug 1", volume: 42000, transactions: 8 },
    { label: "Aug 3", volume: 58000, transactions: 11 },
    { label: "Aug 6", volume: 51000, transactions: 9 },
    { label: "Aug 9", volume: 72000, transactions: 14 },
    { label: "Aug 12", volume: 64000, transactions: 12 },
    { label: "Aug 15", volume: 88000, transactions: 18 },
    { label: "Aug 18", volume: 76000, transactions: 15 },
    { label: "Aug 21", volume: 22000, transactions: 4 },
    { label: "Aug 24", volume: 54000, transactions: 10 },
    { label: "Aug 27", volume: 91000, transactions: 19 },
  ],
  topRevenueLinks: [
    { id: "1", name: "Near AI Credits", amount: 12350.56 },
    { id: "2", name: "Near AI Standard Package", amount: 12350.56 },
    { id: "3", name: "Near AI Monthly Package", amount: 12350.56 },
  ],
};

export function getOverviewDashboard(): OverviewDashboard {
  return OVERVIEW_DASHBOARD;
}
