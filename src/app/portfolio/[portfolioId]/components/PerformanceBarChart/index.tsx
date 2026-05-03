"use client";

import { StockDetailedPerformance } from "@/interfaces";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { PerformanceHeader } from "./components/PerformanceHeader";
import { getChartOptions } from "./utils/chartConfig";

const CHART_HEIGHT = 350;
const SCROLL_STOCK_THRESHOLD = 8;
const MIN_WIDTH_PER_STOCK = 46;

const LoadingState = () => (
  <div className="flex h-[350px] items-center justify-center bg-slate-900">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-gray-400">Loading performance data...</span>
    </div>
  </div>
);

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <LoadingState />,
});

export type PerformanceSortOption = "profit-desc" | "profit-asc" | "symbol-asc" | "symbol-desc";
export type PerformanceMetricMode = "cumulative" | "today";

interface PerformanceProps {
  data: StockDetailedPerformance[];
}

export const PerformanceBarChart = ({ data }: PerformanceProps) => {
  const [includeDividends, setIncludeDividends] = useState(false);
  const [metricMode, setMetricMode] = useState<PerformanceMetricMode>("cumulative");
  const [sortBy, setSortBy] = useState<PerformanceSortOption>("profit-desc");

  const isTodayMode = metricMode === "today";
  const effectiveIncludeDividends = isTodayMode ? false : includeDividends;

  // Sorting logic
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aMetric = isTodayMode ? (a.todayPnLPercentage ?? Number.NEGATIVE_INFINITY) : 0;
      const bMetric = isTodayMode ? (b.todayPnLPercentage ?? Number.NEGATIVE_INFINITY) : 0;

      switch (sortBy) {
        case "profit-desc":
          if (isTodayMode) {
            return bMetric - aMetric;
          }
          return (
            (effectiveIncludeDividends ? b.totalProfitWithDividendsPercentage : b.totalProfitPercentage) -
            (effectiveIncludeDividends ? a.totalProfitWithDividendsPercentage : a.totalProfitPercentage)
          );
        case "profit-asc":
          if (isTodayMode) {
            return aMetric - bMetric;
          }
          return (
            (effectiveIncludeDividends ? a.totalProfitWithDividendsPercentage : a.totalProfitPercentage) -
            (effectiveIncludeDividends ? b.totalProfitWithDividendsPercentage : b.totalProfitPercentage)
          );
        case "symbol-asc":
          return a.stockSymbol.localeCompare(b.stockSymbol);
        case "symbol-desc":
          return b.stockSymbol.localeCompare(a.stockSymbol);
        default:
          return 0;
      }
    });
    return sorted;
  }, [data, sortBy, effectiveIncludeDividends, isTodayMode]);

  const series = [
    {
      name: isTodayMode ? "Today's Return" : "Total Return",
      data: sortedData.map((stock) => ({
        x: stock.stockSymbol,
        y: isTodayMode
          ? (stock.todayPnLPercentage ?? null)
          : effectiveIncludeDividends
            ? stock.totalProfitWithDividendsPercentage
            : stock.totalProfitPercentage,
      })),
    },
  ];

  const options = getChartOptions(sortedData.length, isTodayMode ? "Today's Return %" : "Return %");
  const chartWidth = sortedData.length > SCROLL_STOCK_THRESHOLD ? sortedData.length * MIN_WIDTH_PER_STOCK : undefined;

  return (
    <div className="rounded-lg bg-slate-800 shadow-md border border-slate-700">
      <div className="flex flex-col gap-2 border-b border-slate-700 bg-slate-800 p-2 sticky -top-3 z-20">
        <PerformanceHeader
          includeDividends={includeDividends}
          setIncludeDividends={setIncludeDividends}
          metricMode={metricMode}
          setMetricMode={setMetricMode}
          disableDividendsToggle={isTodayMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden bg-slate-900" style={{ minHeight: CHART_HEIGHT }}>
        <div className="min-w-full" style={chartWidth ? { width: chartWidth } : undefined}>
          <Chart options={options} series={series} type="bar" height={CHART_HEIGHT} width="100%" />
        </div>
      </div>
    </div>
  );
};

export default PerformanceBarChart;
