"use client";

import PortfolioRecalculationButton from "@/components/molecules/PortfolioRecalculationButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockDetailedPerformance } from "@/interfaces";
import { useHoldingsFilter, usePortfolioStore } from "@/store";
import { formatCurrency, formatPercentage } from "@/utils/helpers/formatHelpers";
import { TrendingUp, TrendingDown } from "lucide-react";
import { calculatePortfolioMetrics } from "./utils/helpers";

interface PortfolioPerformanceCardProps {
  stocksPerformanceData: StockDetailedPerformance[];
  portfolioId: number;
}
const PortfolioPerformanceCard = (props: PortfolioPerformanceCardProps) => {
  const { stocksPerformanceData, portfolioId } = props;
  const holdingsFilter = useHoldingsFilter(portfolioId);
  const setHoldingsFilter = usePortfolioStore((state) => state.setHoldingsFilter);
  const metrics = calculatePortfolioMetrics(stocksPerformanceData);

  const getPerformanceColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-500/90";
    return "text-gray-400";
  };

  const getPerformanceIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const handleHoldingsFilterChange = (value: string) => {
    if (value === "all" || value === "current" || value === "liquidated") {
      setHoldingsFilter(portfolioId, value);
    }
  };

  return (
    <div className="rounded-lg shadow-md border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 flex items-center justify-between gap-2 p-2 border-b border-slate-700 sticky -top-3 z-20">
        <h2 className="text-sm sm:text-lg font-semibold whitespace-nowrap">Portfolio Overview</h2>

        <div className="flex items-center gap-2">
          <PortfolioRecalculationButton
            portfolioId={stocksPerformanceData.length > 0 ? stocksPerformanceData[0].portfolioId : 0}
            className="w-auto"
          />

          <Select value={holdingsFilter} onValueChange={handleHoldingsFilterChange}>
            <SelectTrigger className="w-[126px] sm:w-[220px] h-9 bg-slate-700 border-slate-600 text-gray-100 text-sm">
              <SelectValue placeholder="Filter holdings" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all" className="text-gray-100 hover:bg-slate-700">
                All holdings
              </SelectItem>
              <SelectItem value="current" className="text-gray-100 hover:bg-slate-700">
                Current holdings
              </SelectItem>
              <SelectItem value="liquidated" className="text-gray-100 hover:bg-slate-700">
                Liquidated holdings
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-900 p-2">
        <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3">
          {/* Invested Amount */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Invested Amount</div>
            <div className="text-lg font-bold text-gray-100/80">{formatCurrency(metrics.investedAmount)}</div>
          </div>

          {/* Total Value */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Total Value</div>
            <div className="text-lg font-bold text-gray-100/80">{formatCurrency(metrics.totalCurrentValue)}</div>
          </div>

          {/* Unrealized Profit */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Unrealized Profit</div>
            <div
              className={`text-lg font-bold flex items-center justify-center gap-1 ${getPerformanceColor(metrics.totalUnrealizedProfit)}`}
            >
              {getPerformanceIcon(metrics.totalUnrealizedProfit)}
              <span>{formatCurrency(metrics.totalUnrealizedProfit)}</span>
            </div>
            <div className="text-xs text-gray-400">{formatPercentage(metrics.totalUnrealizedProfitPercentage)}</div>
          </div>

          {/* Realized Profit */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Realized Profit</div>
            <div
              className={`text-lg font-bold flex items-center justify-center gap-1 ${getPerformanceColor(metrics.totalRealizedProfit)}`}
            >
              {getPerformanceIcon(metrics.totalRealizedProfit)}
              <span>{formatCurrency(metrics.totalRealizedProfit)}</span>
            </div>
          </div>

          {/* Profit (previously Total Profit) */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Profit</div>
            <div
              className={`text-lg font-bold flex items-center justify-center gap-1 ${getPerformanceColor(metrics.totalProfit)}`}
            >
              {getPerformanceIcon(metrics.totalProfit)}
              <span>{formatCurrency(metrics.totalProfit)}</span>
            </div>
            <div className="text-xs text-gray-400">{formatPercentage(metrics.totalProfitPercentage)}</div>
          </div>

          {/* Profit with Dividends */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Profit with Dividends</div>
            <div
              className={`text-lg font-bold flex items-center justify-center gap-1 ${getPerformanceColor(metrics.profitWithDividends)}`}
            >
              {getPerformanceIcon(metrics.profitWithDividends)}
              <span>{formatCurrency(metrics.profitWithDividends)}</span>
            </div>
          </div>

          {/* Today's P/L */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-medium text-gray-400 mb-1">Today&apos;s P/L</div>
            <div
              className={`text-lg font-bold flex items-center justify-center gap-1 ${getPerformanceColor(metrics.totalTodayPnL)}`}
            >
              {getPerformanceIcon(metrics.totalTodayPnL)}
              <span>{formatCurrency(metrics.totalTodayPnL)}</span>
            </div>
            <div className="text-xs text-gray-400">{formatPercentage(metrics.totalTodayPnLPercentage)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformanceCard;
