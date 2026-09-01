import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRangePicker } from "@/components/date-range-picker/DateRangePicker";
import { lastNDaysRange, rangeToUnixSeconds } from "@/components/date-range-picker/utils";
import { IconExportLink } from "@/components/icons/link";
import { Icon2Right } from "@/components/icons/to-right";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import { Card } from "@/components/ui/card/Card";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { Pagination } from "@/components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import { FIXED_CHAINS, txExplorerUrl } from "@/config/chains";
import { useApiKeysQuery } from "@/hooks/use-api-keys-api";
import { usePaymentLinksInfiniteQuery } from "@/hooks/use-payment-links-api";
import {
  useExportReportPaymentsMutation,
  useReportAnalyticsQuery,
  useReportPaymentsQuery,
} from "@/hooks/use-report-api";
import useToast from "@/hooks/use-toast";
import { formatAmount, formatDate } from "@/utils";
import { ReportsAddressCell } from "./components/ReportsAddressCell";
import { ReportsAssetCell } from "./components/ReportsAssetCell";
import { ReportsLineChart } from "./components/ReportsLineChart";
import { ReportsSourceToggle } from "./components/ReportsSourceToggle";
import {
  REPORT_AMOUNT_FILTER,
  REPORT_AMOUNT_OPTIONS,
  REPORT_FILTER_ALL,
  REPORT_LINKS_PAGE_SIZE,
  REPORT_SOURCE,
  REPORT_TABLE_COLUMNS,
  REPORT_TIME_PRESET,
  REPORT_TOKENS,
  REPORT_TX_CHART_COLOR,
  REPORT_VOLUME_CHART_COLOR,
  type ReportSource,
} from "./config";
import {
  eachDateKey,
  reportDailyDateKey,
  reportOptionalApiKeyId,
  reportOptionalFilter,
  reportOptionalLinkId,
  reportPaymentsFilters,
  reportPaymentsListQuery,
  reportsError,
} from "./utils";

const NETWORK_OPTIONS = [
  { value: REPORT_FILTER_ALL, label: "All" },
  ...FIXED_CHAINS.map((chain) => ({ value: chain.blockchain, label: chain.chainName })),
];

const TOKEN_OPTIONS = [
  { value: REPORT_FILTER_ALL, label: "All" },
  ...REPORT_TOKENS.map((symbol) => ({ value: symbol, label: symbol })),
];

function chartNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ReportsView() {
  const toast = useToast();
  const keysQuery = useApiKeysQuery();
  const linksQuery = usePaymentLinksInfiniteQuery({ pageSize: REPORT_LINKS_PAGE_SIZE });
  const [range, setRange] = useState(() => lastNDaysRange(REPORT_TIME_PRESET.Days30));
  const [apiKey, setApiKey] = useState(REPORT_FILTER_ALL);
  const [linkId, setLinkId] = useState(REPORT_FILTER_ALL);
  const [network, setNetwork] = useState(REPORT_FILTER_ALL);
  const [sourceNetwork, setSourceNetwork] = useState(REPORT_FILTER_ALL);
  const [sourceToken, setSourceToken] = useState(REPORT_FILTER_ALL);
  const [destNetwork, setDestNetwork] = useState(REPORT_FILTER_ALL);
  const [destToken, setDestToken] = useState(REPORT_FILTER_ALL);
  const [amountFilter, setAmountFilter] = useState<string>(REPORT_AMOUNT_FILTER.All);
  const [page, setPage] = useState(1);
  const [reportSource, setReportSource] = useState<ReportSource>(REPORT_SOURCE.ApiKey);
  const [tableSource, setTableSource] = useState<ReportSource>(REPORT_SOURCE.ApiKey);
  const [tableApiKey, setTableApiKey] = useState(REPORT_FILTER_ALL);
  const [tableLinkId, setTableLinkId] = useState(REPORT_FILTER_ALL);

  const apiKeyOptions = useMemo(() => {
    return [
      { value: REPORT_FILTER_ALL, label: "All" },
      ...(keysQuery.data ?? []).map((key) => ({ value: String(key.id), label: key.name })),
    ];
  }, [keysQuery.data]);

  const linkOptions = useMemo(() => {
    const links = linksQuery.data?.pages.flatMap((chunk) => chunk.list) ?? [];
    return [
      { value: REPORT_FILTER_ALL, label: "All" },
      ...links.map((link) => ({
        value: link.linkId,
        label: link.title.trim() || link.linkId,
      })),
    ];
  }, [linksQuery.data]);

  const loadMoreLinks = useCallback(() => {
    if (!linksQuery.hasNextPage || linksQuery.isFetchingNextPage) return;
    void linksQuery.fetchNextPage();
  }, [linksQuery.fetchNextPage, linksQuery.hasNextPage, linksQuery.isFetchingNextPage]);

  const times = rangeToUnixSeconds(range);
  const analyticsQuery = useReportAnalyticsQuery({
    start_time: times.start_time,
    end_time: times.end_time,
    api_key_id: reportOptionalApiKeyId(apiKey),
    link_id: reportOptionalLinkId(linkId),
    network: reportOptionalFilter(network),
    type: reportSource,
  });

  const paymentFilters = useMemo(
    () =>
      reportPaymentsFilters({
        source: tableSource,
        apiKey: tableApiKey,
        linkId: tableLinkId,
        sourceNetwork,
        sourceToken,
        destNetwork,
        destToken,
        amountFilter,
      }),
    [amountFilter, destNetwork, destToken, sourceNetwork, sourceToken, tableApiKey, tableLinkId, tableSource],
  );
  const paymentsQuery = useReportPaymentsQuery(reportPaymentsListQuery(page, paymentFilters));
  const exportMutation = useExportReportPaymentsMutation();

  const dailyByDate = useMemo(() => {
    const map = new Map<string, { volume: number; count: number }>();
    for (const item of analyticsQuery.data?.dailyStats ?? []) {
      map.set(reportDailyDateKey(item.date), {
        volume: chartNumber(item.volume),
        count: item.transactions,
      });
    }
    return map;
  }, [analyticsQuery.data?.dailyStats]);

  const volumePoints = useMemo(() => {
    return eachDateKey(range).map((key) => ({
      label: key,
      value: dailyByDate.get(key)?.volume ?? 0,
    }));
  }, [dailyByDate, range]);

  const txPoints = useMemo(() => {
    return eachDateKey(range).map((key) => ({
      label: key,
      value: dailyByDate.get(key)?.count ?? 0,
    }));
  }, [dailyByDate, range]);

  const totalPage = Math.max(1, paymentsQuery.data?.totalPage ?? 1);
  const safePage = Math.min(page, totalPage);
  const pageRows = paymentsQuery.data?.list ?? [];

  useEffect(() => {
    if (page > totalPage) setPage(totalPage);
  }, [page, totalPage]);
  const analyticsError = analyticsQuery.isError
    ? reportsError(analyticsQuery.error, "Failed to load report stats")
    : null;
  const paymentsError = paymentsQuery.isError
    ? reportsError(paymentsQuery.error, "Failed to load transactions")
    : null;

  const resetPage = () => setPage(1);

  function handleExport() {
    void exportMutation.mutateAsync(paymentFilters).catch((error) => {
      toast.fail({ title: reportsError(error, "Could not export CSV") });
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <ReportsSourceToggle
          value={reportSource}
          onChange={(value) => {
            setReportSource(value);
            if (value === REPORT_SOURCE.ApiKey) setLinkId(REPORT_FILTER_ALL);
            if (value === REPORT_SOURCE.Link) setApiKey(REPORT_FILTER_ALL);
          }}
        />
        {reportSource === REPORT_SOURCE.ApiKey ? (
          <Dropdown
            label="API Key"
            value={apiKey}
            onChange={setApiKey}
            options={apiKeyOptions}
            className="min-w-[min(100%,160px)] flex-1 lg:flex-none"
            triggerClassName="w-full"
          />
        ) : (
          <Dropdown
            label="Payment Link"
            value={linkId}
            onChange={setLinkId}
            options={linkOptions}
            onReachEnd={loadMoreLinks}
            loadingMore={linksQuery.isFetchingNextPage}
            className="min-w-[min(100%,160px)] flex-1 lg:flex-none"
            triggerClassName="w-full"
            panelClassName="max-h-60 overflow-y-auto"
          />
        )}
        <Dropdown
          label="Networks"
          value={network}
          onChange={setNetwork}
          options={NETWORK_OPTIONS}
          className="min-w-[min(100%,160px)] flex-1 lg:flex-none"
          triggerClassName="w-full"
        />
        <DateRangePicker
          value={range}
          onChange={setRange}
          className="w-full min-w-0 sm:w-auto sm:min-w-[179px]"
        />
      </div>

      <Card className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <section>
          <h2 className="font-montserrat text-base font-medium capitalize text-black">
            Total Volume
          </h2>
          <p className="mt-2 font-montserrat text-[26px] font-medium text-black">
            {analyticsQuery.isPending
              ? "—"
              : formatAmount(analyticsQuery.data?.totalVolume || "0", { padDecimals: true, showDust: true })}
          </p>
        </section>
        <section>
          <h2 className="font-montserrat text-base font-medium capitalize text-black">
            Transactions
          </h2>
          <p className="mt-2 font-montserrat text-[26px] font-medium text-black">
            {analyticsQuery.isPending ? "—" : (analyticsQuery.data?.transactions ?? 0)}
          </p>
        </section>
      </Card>
      {analyticsError ? (
        <p className="font-montserrat text-sm text-danger">{analyticsError}</p>
      ) : null}

      <ReportsLineChart
        title="Volume by Days"
        points={volumePoints}
        color={REPORT_VOLUME_CHART_COLOR}
        currency
      />
      <ReportsLineChart
        title="Transactions by Days"
        points={txPoints}
        color={REPORT_TX_CHART_COLOR}
      />

      <Table
        columns={REPORT_TABLE_COLUMNS}
        toolbar={
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-montserrat text-base font-medium text-black">Transactions</h2>
              <Button
                variant={BUTTON_VARIANT.Normal}
                size={BUTTON_SIZE.Sm}
                className="h-9 w-full rounded-[6px] border-[#e3e3e3] px-3 text-black sm:w-auto"
                loading={exportMutation.isPending}
                onClick={handleExport}
              >
                Export CSV
                <IconExportLink className="size-3.5 shrink-0" />
              </Button>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ReportsSourceToggle
                value={tableSource}
                onChange={(value) => {
                  setTableSource(value);
                  if (value === REPORT_SOURCE.ApiKey) setTableLinkId(REPORT_FILTER_ALL);
                  if (value === REPORT_SOURCE.Link) setTableApiKey(REPORT_FILTER_ALL);
                  resetPage();
                }}
              />
              {tableSource === REPORT_SOURCE.ApiKey ? (
                <Dropdown
                  label="API Key"
                  value={tableApiKey}
                  onChange={(value) => {
                    setTableApiKey(value);
                    resetPage();
                  }}
                  options={apiKeyOptions}
                  className="min-w-0 w-full"
                  triggerClassName="w-full"
                />
              ) : (
                <Dropdown
                  label="Payment Link"
                  value={tableLinkId}
                  onChange={(value) => {
                    setTableLinkId(value);
                    resetPage();
                  }}
                  options={linkOptions}
                  onReachEnd={loadMoreLinks}
                  loadingMore={linksQuery.isFetchingNextPage}
                  className="min-w-0 w-full"
                  triggerClassName="w-full"
                  panelClassName="max-h-60 overflow-y-auto"
                />
              )}
              <Dropdown
                label="Source Network"
                value={sourceNetwork}
                onChange={(value) => {
                  setSourceNetwork(value);
                  resetPage();
                }}
                options={NETWORK_OPTIONS}
                className="min-w-0 w-full"
                triggerClassName="w-full"
              />
              <Dropdown
                label="Source Token"
                value={sourceToken}
                onChange={(value) => {
                  setSourceToken(value);
                  resetPage();
                }}
                options={TOKEN_OPTIONS}
                className="min-w-0 w-full"
                triggerClassName="w-full"
              />
              <Dropdown
                label="Destination Network"
                value={destNetwork}
                onChange={(value) => {
                  setDestNetwork(value);
                  resetPage();
                }}
                options={NETWORK_OPTIONS}
                className="min-w-0 w-full"
                triggerClassName="w-full"
              />
              <Dropdown
                label="Destination Token"
                value={destToken}
                onChange={(value) => {
                  setDestToken(value);
                  resetPage();
                }}
                options={TOKEN_OPTIONS}
                className="min-w-0 w-full"
                triggerClassName="w-full"
              />
              <Dropdown
                label="Amount"
                value={amountFilter}
                onChange={(value) => {
                  setAmountFilter(value);
                  resetPage();
                }}
                options={[...REPORT_AMOUNT_OPTIONS]}
                className="min-w-0 w-full"
                triggerClassName="w-full"
              />
            </div>
          </>
        }
        footer={
          <div className="mt-4 flex justify-center sm:justify-end">
            <Pagination page={safePage} totalPage={totalPage} onPageChange={setPage} />
          </div>
        }
      >
        <TableHeader>
          <TableHead>Amount</TableHead>
          <TableHead>Source</TableHead>
          <TableHead />
          <TableHead>Received</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Time</TableHead>
        </TableHeader>
        {paymentsQuery.isPending && pageRows.length === 0 ? (
          <p className="pt-20 text-center font-montserrat text-sm font-medium text-[#aaa] lg:py-[150px]">
            Loading transactions…
          </p>
        ) : paymentsError && pageRows.length === 0 ? (
          <p className="pt-20 text-center font-montserrat text-sm font-medium text-danger lg:py-[150px]">
            {paymentsError}
          </p>
        ) : pageRows.length === 0 ? (
          <p className="pt-20 text-center font-montserrat text-sm font-medium text-[#aaa] lg:py-[150px]">
            No transactions
          </p>
        ) : (
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatAmount(row.amount, { prefix: "", showDust: true })}</TableCell>
                <TableCell>
                  <ReportsAssetCell asset={{ symbol: row.token, network: row.network }} />
                </TableCell>
                <TableCell>
                  <Icon2Right className="h-2 w-3 shrink-0 text-black" />
                </TableCell>
                <TableCell>
                  {formatAmount(row.destinationAmount, { prefix: "", showDust: true })}
                </TableCell>
                <TableCell>
                  <ReportsAssetCell
                    asset={{ symbol: row.destinationToken, network: row.destinationNetwork }}
                  />
                </TableCell>
                <TableCell>
                  {row.payer.trim() ? (
                    <ReportsAddressCell
                      address={row.payer}
                      href={txExplorerUrl(row.network, row.txHash)}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {row.recipient.trim() ? (
                    <ReportsAddressCell
                      address={row.recipient}
                      href={txExplorerUrl(row.destinationNetwork, row.destinationTxHash)}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{formatDate(row.submittedAt) || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}

export default ReportsView;
