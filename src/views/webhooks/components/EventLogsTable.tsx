import { useState } from "react";
import { IconEye, IconEyeHidden } from "@/components/icons/eye";
import { Pagination } from "@/components/ui/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import type { WebhookEventLog } from "@/mocks/webhooks";
import { formatDate } from "@/utils";
import { EVENT_LOGS_PAGE_SIZE, EVENT_LOGS_TABLE_COLUMNS, WEBHOOK_EVENT_TYPE_LABEL } from "../config";
import { stringifyPayload } from "../utils";

export function EventLogsTable({ logs }: { logs: WebhookEventLog[] }) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPage = Math.max(1, Math.ceil(logs.length / EVENT_LOGS_PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const paged = logs.slice(
    (safePage - 1) * EVENT_LOGS_PAGE_SIZE,
    safePage * EVENT_LOGS_PAGE_SIZE,
  );

  return (
    <Table
      className="w-full p-5"
      columns={EVENT_LOGS_TABLE_COLUMNS}
      toolbar={<p className="mb-3 font-montserrat text-base font-medium text-black">Event Logs</p>}
      footer={
        logs.length === 0 ? undefined : (
          <div className="mt-3 flex justify-end">
            <Pagination
              page={safePage}
              totalPage={totalPage}
              onPageChange={(next) => {
                setPage(next);
                setExpandedId(null);
              }}
            />
          </div>
        )
      }
    >
      <TableHeader>
        <TableHead>Event Type</TableHead>
        <TableHead>Resource ID</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Payload</TableHead>
      </TableHeader>
      {logs.length === 0 ? (
        <p className="py-16 text-center font-montserrat text-sm font-medium text-[#aaa]">
          No event logs yet.
        </p>
      ) : (
        <TableBody>
          {paged.map((row) => {
            const expanded = expandedId === row.id;
            return (
              <TableRow key={row.id} className={expanded ? "items-start" : undefined}>
                <TableCell>{WEBHOOK_EVENT_TYPE_LABEL[row.eventType]}</TableCell>
                <TableCell className="truncate">{row.resourceId}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell className={expanded ? "items-start" : undefined}>
                  <div className="flex min-w-0 flex-col gap-2">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 text-[#909090] hover:text-black"
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                    >
                      {expanded ? (
                        <IconEyeHidden className="h-[15px] w-4 shrink-0" />
                      ) : (
                        <IconEye className="h-[11px] w-4 shrink-0" />
                      )}
                      <span className="font-montserrat text-sm font-medium">
                        {expanded ? "hide" : "view"}
                      </span>
                    </button>
                    {expanded ? (
                      <pre className="max-h-56 w-full overflow-auto rounded-[8px] bg-[#111] px-3 py-2 font-mono text-xs leading-5 whitespace-pre text-white">
                        {stringifyPayload(row.payload)}
                      </pre>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
    </Table>
  );
}
