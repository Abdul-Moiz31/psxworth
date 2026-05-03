"use client";

import { AllocationPerformanceHeader, AllocationPerformanceChart, type ScatterPoint } from "@/components/molecules";
import { StockDetailedPerformance } from "@/interfaces";
import { StockInfo } from "@/types";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { useMemo, useState } from "react";

type ViewMode = "stocks" | "sectors";

export interface AllocationPerformanceProps {
  stocks: StockDetailedPerformance[];
  stocksInfo?: StockInfo[];
}

export const AllocationPerformance = ({ stocks, stocksInfo = STOCKS_INFO }: AllocationPerformanceProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("stocks");
  const [includeDividends, setIncludeDividends] = useState<boolean>(true);

  const points: ScatterPoint[] = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];

    const totalValue = stocks.reduce((sum, s) => sum + (s.currentValue || 0), 0) || 0;

    const getReturnPct = (s: StockDetailedPerformance) =>
      includeDividends ? s.totalProfitWithDividendsPercentage : s.totalProfitPercentage;

    if (totalValue <= 0) return [];

    if (viewMode === "stocks") {
      return stocks
        .map((s) => ({
          name: s.stockSymbol,
          x: (s.currentValue / totalValue) * 100,
          y: getReturnPct(s),
        }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    }

    const bySector = new Map<string, { valueSum: number; weightedReturnSum: number }>();

    for (const s of stocks) {
      const info = stocksInfo.find((i) => i.symbol === s.stockSymbol);
      if (!info) continue;
      const sector = info.sectorName || "Unknown";
      const value = s.currentValue || 0;
      const ret = getReturnPct(s) || 0;

      if (!bySector.has(sector)) bySector.set(sector, { valueSum: 0, weightedReturnSum: 0 });
      const agg = bySector.get(sector)!;
      agg.valueSum += value;
      agg.weightedReturnSum += value * ret;
    }

    return Array.from(bySector.entries())
      .map(([sector, agg]) => {
        const alloc = (agg.valueSum / totalValue) * 100;
        const weightedPct = agg.valueSum > 0 ? agg.weightedReturnSum / agg.valueSum : 0;
        return { name: sector, x: alloc, y: weightedPct };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  }, [stocks, stocksInfo, viewMode, includeDividends]);

  return (
    <div className="rounded-t-xl rounded-b-2xl border border-slate-700 shadow-sm text-gray-100">
      <div className="bg-slate-800 p-2 sticky -top-3 z-20">
        <AllocationPerformanceHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          includeDividends={includeDividends}
          setIncludeDividends={setIncludeDividends}
        />
      </div>
      <div className="bg-slate-900">
        {points.length > 0 ? (
          <AllocationPerformanceChart points={points} viewMode={viewMode} />
        ) : (
          <div className="flex min-h-64 justify-center items-center p-4">
            <p className="text-gray-400 text-sm sm:text-lg text-center">
              No data available. Please add transactions to see the allocation and total return.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationPerformance;
