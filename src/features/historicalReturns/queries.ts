import { handleServerPromise } from "@/utils/helpers/server";
import { queryOptions } from "@tanstack/react-query";
import {
  getHistoricalReturns,
  getAvailableStockSymbols,
  getEarliestTransactionDate,
} from "./actions/historicalReturnsActions";
import { HistoricalReturnsResponse, HistoricalReturnsParams } from "./shared/types";

export const historicalReturnsQueries = {
  // Key-only factories for invalidation
  allKey: () => ["historicalReturns"] as const,
  allStocksKey: () => [...historicalReturnsQueries.allKey(), "stocks"] as const,
  allReturnsKey: () => [...historicalReturnsQueries.allKey(), "returns"] as const,
  earliestDateKey: () => [...historicalReturnsQueries.allKey(), "earliestDate"] as const,

  // Complete query factories with queryOptions
  portfolioStocks: (portfolioId: number) =>
    queryOptions({
      queryKey: [...historicalReturnsQueries.allStocksKey(), portfolioId] as const,
      queryFn: async () => {
        const response = await getAvailableStockSymbols(portfolioId);
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      },
    }),

  earliestDate: (portfolioId: number, stockSymbol?: string) =>
    queryOptions({
      queryKey: [...historicalReturnsQueries.earliestDateKey(), portfolioId, stockSymbol ?? null] as const,
      queryFn: async (): Promise<Date | null> => {
        const response = await getEarliestTransactionDate(portfolioId, stockSymbol);
        return handleServerPromise(Promise.resolve(response));
      },
    }),

  returns: (params: HistoricalReturnsParams) =>
    queryOptions({
      queryKey: [...historicalReturnsQueries.allReturnsKey(), params] as const,
      queryFn: async (): Promise<HistoricalReturnsResponse> => {
        const response = await getHistoricalReturns(
          params.portfolioId,
          params.startDate,
          params.endDate,
          params.returnType,
          params.scope,
          params.scope === "stock" ? params.stockSymbol : undefined
        );
        return handleServerPromise(Promise.resolve(response));
      },
    }),
} as const;
