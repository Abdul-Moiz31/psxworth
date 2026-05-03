"use client";

import { TableHeaderCell } from "@/components/ui/table";
import { StockDetailedPerformance } from "@/interfaces";
import { formatCurrency, formatPercentage, formatValueWithPercentage } from "@/utils/helpers/formatHelpers";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

// Helper to get color class based on value
const getProfitLossColorClass = (value: number): string => {
  return value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "";
};

export const portfolioPerformanceTableDesktopColumns: ColumnDef<StockDetailedPerformance>[] = [
  {
    accessorKey: "stockSymbol",
    enableHiding: false,
    header: ({ column }) => <TableHeaderCell column={column} heading="Symbol" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center">
          <div>
            <ChevronRight
              className={twMerge(
                "h-4 w-4 text-gray-100 transition-transform duration-500",
                row.getIsExpanded() ? "rotate-90" : "rotate-0"
              )}
              strokeWidth={4}
            />
          </div>
          <div className="flex flex-col gap-1 ">
            <p className="font-medium">{row.original.stockSymbol}</p>
            <div>
              <p className="text-xs">
                {row.original.totalShares} x {formatCurrency(row.original.averageCost)}
              </p>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "currentPrice",
    header: ({ column }) => <TableHeaderCell column={column} heading="Current Price" />,
    cell: ({ row }) => formatCurrency(row.getValue("currentPrice")),
  },

  {
    accessorKey: "totalCost",
    header: ({ column }) => <TableHeaderCell column={column} heading="Total Cost" />,
    cell: ({ row }) => formatCurrency(row.getValue("totalCost")),
  },
  {
    accessorKey: "currentValue",
    header: ({ column }) => <TableHeaderCell column={column} heading="Current Value" />,
    cell: ({ row }) => {
      const value = row.getValue("currentValue") as number;

      return <div>{row.original.totalShares === 0 ? "—" : formatCurrency(value)}</div>;
    },
  },
  {
    accessorKey: "todayPnL",
    header: ({ column }) => <TableHeaderCell column={column} heading="Today's P/L" />,
    cell: ({ row }) => {
      const value = row.original.todayPnL;
      const percentage = row.original.todayPnLPercentage;

      if (row.original.totalShares === 0 || value == null || percentage == null) {
        return <div>—</div>;
      }

      const colorClass = getProfitLossColorClass(value);

      return <div className={colorClass}>{formatValueWithPercentage(value, percentage)}</div>;
    },
  },
  {
    accessorKey: "unrealizedProfit",
    header: ({ column }) => <TableHeaderCell column={column} heading="Unrealized P/L" />,
    cell: ({ row }) => {
      const value = row.getValue("unrealizedProfit") as number;
      const percentage = row.original.unrealizedProfitPercentage;
      const colorClass = getProfitLossColorClass(value);

      return (
        <div className={colorClass}>
          {row.original.totalShares === 0 ? "—" : formatValueWithPercentage(value, percentage)}
        </div>
      );
    },
  },
  {
    accessorKey: "realizedProfit",
    header: ({ column }) => <TableHeaderCell column={column} heading="Realized P/L" />,
    cell: ({ row }) => {
      const value = row.getValue("realizedProfit") as number;
      const colorClass = getProfitLossColorClass(value);

      return <div className={colorClass}>{formatCurrency(value)}</div>;
    },
  },
  {
    accessorKey: "totalDividends",
    header: ({ column }) => <TableHeaderCell column={column} heading="Total Dividends" />,
    cell: ({ row }) => {
      const value = row.getValue("totalDividends") as number;
      const colorClass = getProfitLossColorClass(value);

      return <div className={colorClass}>{formatCurrency(value)}</div>;
    },
  },
  {
    accessorKey: "totalProfit",
    header: ({ column }) => <TableHeaderCell column={column} heading="Total P/L" />,
    cell: ({ row }) => {
      const value = row.getValue("totalProfit") as number;
      const percentage = row.original.totalProfitPercentage;
      const colorClass = getProfitLossColorClass(value);

      return <div className={colorClass}>{formatValueWithPercentage(value, percentage)}</div>;
    },
  },
];

export const portfolioPerformanceTableMobileColumns: ColumnDef<StockDetailedPerformance>[] = [
  {
    accessorKey: "stockSymbol",
    enableHiding: false,
    header: ({ column }) => <TableHeaderCell column={column} heading="Symbol" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center">
          <div>
            <ChevronRight
              className={twMerge(
                "h-4 w-4 text-gray-100 transition-transform duration-500",
                row.getIsExpanded() ? "rotate-90" : "rotate-0"
              )}
              strokeWidth={4}
            />
          </div>
          <div className="flex flex-col gap-1 ">
            <p className="font-medium">{row.original.stockSymbol}</p>
            <div>
              <p className="text-xs">
                {formatCurrency(row.original.totalShares)} x {formatCurrency(row.original.averageCost)}
              </p>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "currentValue",
    header: ({ column }) => <TableHeaderCell column={column} heading="Performance" />,
    cell: ({ row }) => {
      const profitValue = row.original.totalProfit;
      const colorClass = getProfitLossColorClass(profitValue);

      return (
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            {formatCurrency(row.original.currentValue)}{" "}
            <span className="text-xs text-gray-500">
              ({row.original.totalShares} × {formatCurrency(row.original.currentPrice)})
            </span>
          </p>
          <div>
            <p className={`text-xs ${colorClass}`}>
              {formatCurrency(profitValue)} ({formatPercentage(row.original.totalProfitPercentage)})
            </p>
          </div>
          <div>
            <p className={`text-xs ${getProfitLossColorClass(row.original.todayPnL ?? 0)}`}>
              Today:{" "}
              {row.original.totalShares === 0 || row.original.todayPnL == null || row.original.todayPnLPercentage == null
                ? "—"
                : `${formatCurrency(row.original.todayPnL)} (${formatPercentage(row.original.todayPnLPercentage)})`}
            </p>
          </div>
        </div>
      );
    },
  },
];
