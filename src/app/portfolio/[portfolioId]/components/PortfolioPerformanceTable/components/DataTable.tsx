"use client";

import { TableToggleColumns } from "@/components/ui/TableToggleColumns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockDetailedPerformance } from "@/interfaces";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence, MotionConfig, useIsPresent } from "motion/react";
import React from "react";
import { TableViewToggle } from "../../TableViewToggle";
import { StockPerformanceDetailCard } from "./StockPerformanceDetailCard";

const MotionTableRow = motion.create(TableRow);

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  shouldShowMobileLayout?: boolean;
  onToggleView?: (fullTable: boolean) => void;
  emptyMessage?: string;
  sticky?: boolean;
}

const transition = {
  type: "spring",
  bounce: 0.12,
  duration: 0.5,
};

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  "use no memo";
  const { columns, data, shouldShowMobileLayout, onToggleView, emptyMessage, sticky = true } = props;
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const [controlsHeight, setControlsHeight] = React.useState(0);
  const stickyInset = -12;

  /* eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's useReactTable() returns functions that cannot be memoized safely */
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  /**
   * This isn't ideal. I want to simplify this,
   * but I don't have time to fix it now. Maybe in the future.
   */
  React.useEffect(() => {
    if (!sticky) {
      setControlsHeight(0);
      return;
    }

    const controls = controlsRef.current;
    if (!controls) return;

    const updateHeight = () => {
      setControlsHeight(controls.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(controls);

    return () => {
      observer.disconnect();
    };
  }, [sticky]);

  return (
    <MotionConfig transition={transition}>
      <div className="rounded-lg border border-slate-700">
        <div
          ref={controlsRef}
          className={`${sticky ? "sticky" : ""} z-20 flex items-center justify-between gap-2 rounded-t-lg border-b border-slate-700 bg-slate-800 px-2 py-2`}
          style={sticky ? { top: stickyInset } : undefined}
        >
          <div className="bg-slate-800 text-gray-100">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-100">Portfolio Performance</h2>
          </div>
          <div className="flex items-center gap-2">
            {shouldShowMobileLayout !== undefined && onToggleView ? (
              <TableViewToggle
                shouldShowMobileLayout={shouldShowMobileLayout}
                onToggle={onToggleView}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              />
            ) : null}
            <TableToggleColumns table={table} className="ml-0 bg-slate-700 border-slate-600 hover:bg-slate-600" />
          </div>
        </div>
        <Table className="border-separate border-spacing-0" wrapperClassName="overflow-visible">
          <TableHeader className="bg-slate-800 [&_tr]:border-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`${sticky ? "sticky" : ""} z-10 bg-slate-800 text-gray-100/90`}
                      style={sticky ? { top: controlsHeight + stickyInset } : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative overflow-visible">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <MotionTableRow
                    data-state={row.getIsSelected() && "selected"}
                    layout={true}
                    onClick={() => row.toggleExpanded()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="pl-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </MotionTableRow>
                  <AnimatePresence>
                    {row.getIsExpanded() && (
                      <CustomTableRow
                        row={row as Row<StockDetailedPerformance>}
                        columnsLength={table.getAllColumns().length}
                      />
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage ?? "Please add a transaction to see the performance"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </MotionConfig>
  );
}

const CustomTableRow = ({ row, columnsLength }: { row: Row<StockDetailedPerformance>; columnsLength: number }) => {
  const isPresent = useIsPresent();
  return (
    <MotionTableRow
      key={`expanded-${row.id}`}
      layout={true}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        ...transition,
      }}
      transition={{ ...transition, opacity: { duration: 0.2 } }}
      style={{
        position: isPresent ? "relative" : "absolute",
        display: isPresent ? "table-row" : "flex",
        left: 0,
        right: 0,
      }}
    >
      <TableCell
        colSpan={columnsLength}
        style={{
          position: isPresent ? "relative" : "absolute",
          left: 0,
          right: 0,
        }}
      >
        <StockPerformanceDetailCard stockPerformance={row.original as StockDetailedPerformance} />
      </TableCell>
    </MotionTableRow>
  );
};
