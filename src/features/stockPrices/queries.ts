import { queryOptions } from "@tanstack/react-query";
import { fetchLatestAllStockPrices } from "./api";

export const stockPriceQueries = {
  allKey: () => ["stockPrices"] as const,
  latestAllKey: () => [...stockPriceQueries.allKey(), "latestAll"] as const,

  latestAll: () =>
    queryOptions({
      queryKey: stockPriceQueries.latestAllKey(),
      queryFn: fetchLatestAllStockPrices,
    }),
} as const;
