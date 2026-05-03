"use client";

import { ExportTransactionsButton } from "@/components/molecules/ExportTransactionsButton";
import { TableToggleColumns } from "@/components/ui/TableToggleColumns";
import { CustomTableRow, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import {
  FilterFn,
  ColumnDef,
  flexRender,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import React from "react";
import { TableViewToggle } from "../../TableViewToggle";
import { TransactionDetailCard } from "../TransactionDetailCard";
import { DataTableFilters } from "./DataTableFilters";

const MotionTableRow = motion.create(TableRow);

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  shouldShowMobileLayout?: boolean;
  onToggleView?: (fullTable: boolean) => void;
  /** Renders a full-width row below each row when in mobile layout (e.g. "Since transaction") */
  renderMobileSubRow?: (original: TData) => React.ReactNode;
}

interface TransactionFilters {
  types?: string[];
  symbols?: string[];
}

const transition = {
  type: "spring",
  bounce: 0.12,
  duration: 0.5,
};

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  "use no memo";
  const { columns, data, isLoading = false, shouldShowMobileLayout, onToggleView, renderMobileSubRow } = props;
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "transactionDate", desc: true }]);
  const [filters, setFilters] = React.useState<TransactionFilters>({});

  const transactionFilterFn: FilterFn<TData> = (row, columnId, filterValue: TransactionFilters) => {
    const transaction = row.original as Transaction;

    // Apply type filter
    if (filterValue.types && filterValue.types.length > 0) {
      if (!filterValue.types.includes(transaction.type)) {
        return false;
      }
    }

    // Apply symbol filter
    if (filterValue.symbols && filterValue.symbols.length > 0) {
      if (!filterValue.symbols.includes(transaction.stockSymbol)) {
        return false;
      }
    }

    return true;
  };

  /* eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's useReactTable() returns functions that cannot be memoized safely */
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      transactionFilter: transactionFilterFn,
    },
    globalFilterFn: transactionFilterFn,
    state: {
      sorting,
      globalFilter: filters,
    },
    onGlobalFilterChange: setFilters,
  });

  // Get current view transactions (filtered data)
  const currentViewTransactions = isLoading
    ? []
    : table.getFilteredRowModel().rows.map((row) => row.original as Transaction);

  return (
    <MotionConfig transition={transition}>
      <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-700">
        <div className="shrink-0 rounded-t-lg border-b border-slate-700 bg-slate-800 px-2 py-2">
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 w-full md:w-auto">
            <DataTableFilters data={data as Transaction[]} onFilterChange={setFilters} activeFilters={filters} />
            {shouldShowMobileLayout !== undefined && onToggleView ? (
              <TableViewToggle
                shouldShowMobileLayout={shouldShowMobileLayout}
                onToggle={onToggleView}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              />
            ) : null}
            <TableToggleColumns table={table} className="ml-0 bg-slate-700 border-slate-600 hover:bg-slate-600" />
            <ExportTransactionsButton
              transactions={data as Transaction[]}
              currentViewTransactions={currentViewTransactions}
              currentViewFilters={filters}
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            />
          </div>
        </div>
        <Table className="border-separate border-spacing-0" wrapperClassName="min-h-0 flex-1 overflow-auto">
          <TableHeader className="sticky top-0 z-10 bg-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="sticky top-0 z-10 bg-slate-800 text-gray-100/90">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={cn(
              "relative overflow-visible",
              shouldShowMobileLayout && renderMobileSubRow && "[&_tr:hover+tr[data-subrow]]:bg-muted/50"
            )}
          >
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-gray-400">Loading transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <MotionTableRow
                    data-state={row.getIsSelected() && "selected"}
                    layout={true}
                    onClick={() => row.toggleExpanded()}
                    className={shouldShowMobileLayout && renderMobileSubRow ? "border-b-0" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="pl-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </MotionTableRow>
                  {shouldShowMobileLayout && renderMobileSubRow ? (
                    <MotionTableRow data-subrow layout>
                      <TableCell
                        colSpan={columns.length}
                        className="pl-7 pt-0 pb-2 text-xs text-muted-foreground align-top"
                      >
                        {renderMobileSubRow(row.original as TData)}
                      </TableCell>
                    </MotionTableRow>
                  ) : null}
                  <AnimatePresence>
                    {/* Expanded row */}
                    {row.getIsExpanded() && (
                      <CustomTableRow row={row} columns={table.getAllColumns()} transition={transition}>
                        <TransactionDetailCard transaction={row.original as Transaction} />
                      </CustomTableRow>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {filters.types || filters.symbols
                    ? "No transactions match the selected filters"
                    : "No transactions found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </MotionConfig>
  );
}
