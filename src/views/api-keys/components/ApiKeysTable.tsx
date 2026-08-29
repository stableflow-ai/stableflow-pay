import { IconCopy } from "@/components/icons/copy";
import { IconDelete } from "@/components/icons/delete";
import { IconLoading } from "@/components/icons/loading";
import { IconPen } from "@/components/icons/pen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { PayApiKey } from "@/types/api-keys";
import { formatDate } from "@/utils";
import { API_KEY_TABLE_COLUMNS } from "../config";
import { maskApiKey } from "../utils";

export function ApiKeysTable({
  apiKeys,
  isPending,
  isError,
  errorMessage,
  onCreate,
  onCopy,
  onEdit,
  onDelete,
}: {
  apiKeys: PayApiKey[];
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  onCreate: () => void;
  onCopy: (apiKey: string) => void;
  onEdit: (id: number) => void;
  onDelete: (row: PayApiKey) => void;
}) {
  return (
    <Table columns={API_KEY_TABLE_COLUMNS} className="w-full p-4 md:p-5">
      <TableHeader>
        <TableHead>Label</TableHead>
        <TableHead>Key</TableHead>
        <TableHead>Created</TableHead>
        <TableHead />
      </TableHeader>
      {isPending ? (
        <div className="flex justify-center py-20 md:py-[150px]">
          <IconLoading className="size-6 animate-spin text-[#909090]" />
        </div>
      ) : isError ? (
        <p className="py-20 text-center font-montserrat text-sm font-medium text-danger md:py-[150px]">
          {errorMessage}
        </p>
      ) : apiKeys.length === 0 ? (
        <p className="py-20 text-center font-montserrat text-sm font-medium text-[#aaa] md:py-[150px]">
          No API key, you can{" "}
          <button type="button" className="cursor-pointer text-black" onClick={onCreate}>
            Create new API key
          </button>
          .
        </p>
      ) : (
        <TableBody>
          {apiKeys.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{maskApiKey(row.apiKey)}</span>
                  <Tooltip content="Copy">
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer text-[#909090] hover:text-black"
                      aria-label="Copy"
                      onClick={() => onCopy(row.apiKey)}
                    >
                      <IconCopy className="size-3" />
                    </button>
                  </Tooltip>
                </span>
              </TableCell>
              <TableCell>{formatDate(row.createdAt)}</TableCell>
              <TableCell className="justify-end gap-3">
                <Tooltip content="Edit">
                  <button
                    type="button"
                    className="cursor-pointer text-[#909090] hover:text-black"
                    aria-label="Edit"
                    onClick={() => onEdit(row.id)}
                  >
                    <IconPen className="size-3" />
                  </button>
                </Tooltip>
                <Tooltip content="Delete">
                  <button
                    type="button"
                    className="cursor-pointer text-[#909090] hover:text-danger"
                    aria-label="Delete"
                    onClick={() => onDelete(row)}
                  >
                    <IconDelete className="size-3.5" />
                  </button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      )}
    </Table>
  );
}
