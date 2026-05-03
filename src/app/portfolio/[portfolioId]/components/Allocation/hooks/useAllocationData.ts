import { StockDetailedPerformance } from "@/interfaces";
import { StockInfo } from "@/types";
import {
  calculateSectorAllocation,
  calculateStockAllocation,
  mergeEtfHoldingsIntoStocks,
} from "../utils/allocationCalculation";
import { AllocationFilters, AllocationItem } from "../utils/types";
import { useEtfDetails } from "./useEtfDetails";

interface UseAllocationDataProps {
  stocks: StockDetailedPerformance[];
  stocksInfo: StockInfo[];
  filters: AllocationFilters;
}

export const useAllocationData = ({ stocks, stocksInfo, filters }: UseAllocationDataProps) => {
  const infoMap = new Map(stocksInfo.map((info) => [info.symbol, info]));
  const etfSymbols = stocks
    .map((stock) => stock.stockSymbol)
    .filter((symbol) => {
      const info = infoMap.get(symbol);
      return info?.isETF;
    });

  const shouldFetchEtfs = filters.etfExpanded;
  const { data: etfDetails, isPending, error } = useEtfDetails(etfSymbols, shouldFetchEtfs);

  const mergedStocks =
    filters.etfExpanded && etfDetails ? mergeEtfHoldingsIntoStocks(stocks, etfDetails, etfSymbols) : stocks;

  let allocationResult: { data: AllocationItem[]; totalAmount: number } = { data: [], totalAmount: 0 };
  if (filters.viewMode === "stocks" && filters.etfExpanded) {
    allocationResult = calculateStockAllocation(mergedStocks, filters);
  } else if (filters.viewMode === "sectors" && filters.etfExpanded) {
    allocationResult = calculateSectorAllocation(mergedStocks, stocksInfo, filters);
  } else if (filters.viewMode === "stocks") {
    allocationResult = calculateStockAllocation(stocks, filters);
  } else {
    allocationResult = calculateSectorAllocation(stocks, stocksInfo, filters);
  }

  return {
    ...allocationResult,
    isPending,
    error,
  };
};
