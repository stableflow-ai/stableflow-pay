import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/Table";
import { cn } from "@/lib/utils";
import {
  DOC_CELL_VARIANT,
  type DocTableCell,
  type DocTableDefinition,
} from "../config";

function DocsCellContent({ cell }: { cell: DocTableCell }) {
  if (cell.variant === DOC_CELL_VARIANT.Code) {
    return (
      <code className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[12px] font-medium text-[#1F6FD6]">
        {cell.text}
      </code>
    );
  }

  return (
    <span
      className={cn(
        "min-w-0 break-words leading-6",
        cell.variant === DOC_CELL_VARIANT.Strong && "font-semibold text-foreground",
      )}
    >
      {cell.text}
    </span>
  );
}

export function DocsTable({ definition }: { definition: DocTableDefinition }) {
  return (
    <Table
      role="table"
      aria-label={definition.label}
      columns={definition.columns}
      className="rounded-[14px] border-border bg-white p-0 shadow-none"
      scrollClassName="max-w-full [&>div]:w-full"
    >
      <TableHeader role="row" className="border-black/[0.07] bg-[#F7FAFD] text-xs font-medium normal-case text-foreground/55">
        {definition.headers.map((header) => (
          <TableHead key={header} role="columnheader" className="px-4 py-3 first:pl-4 last:pr-4">
            {header}
          </TableHead>
        ))}
      </TableHeader>
      <TableBody role="rowgroup">
        {definition.rows.map((row, rowIndex) => (
          <TableRow key={`${definition.label}-${rowIndex}`} role="row" className="border-black/[0.06] text-sm font-normal text-foreground/70">
            {row.map((cell, cellIndex) => (
              <TableCell
                key={`${cell.text}-${cellIndex}`}
                role="cell"
                className="items-start px-4 py-3 first:pl-4 last:pr-4"
              >
                <DocsCellContent cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
