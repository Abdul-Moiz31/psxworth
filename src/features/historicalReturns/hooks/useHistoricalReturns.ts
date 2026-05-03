import { useQuery } from "@tanstack/react-query";
import { historicalReturnsQueries } from "../queries";
import { HistoricalReturnsParams, Scope } from "../shared/types";

export function usePortfolioStocks(portfolioId: number) {
  return useQuery(historicalReturnsQueries.portfolioStocks(portfolioId));
}

export function useHistoricalReturns(params: HistoricalReturnsParams) {
  return useQuery({
    ...historicalReturnsQueries.returns(params),
    enabled: !(params.scope === "stock" && !params.stockSymbol),
    placeholderData: (previousData) => previousData,
  });
}

export function useEarliestTransactionDate(portfolioId: number, scope: Scope, stockSymbol?: string) {
  const effectiveStockSymbol = scope === "stock" ? stockSymbol : undefined;

  return useQuery({
    ...historicalReturnsQueries.earliestDate(portfolioId, effectiveStockSymbol),
    enabled: scope === "portfolio" || !!effectiveStockSymbol,
  });
}
