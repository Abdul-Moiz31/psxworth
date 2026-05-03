"use server";

import { dataDb } from "@/db";
import { etfBaskets, etfBasketHoldings } from "@/db/datadb-schema";
import { ServerFunctionResponse } from "@/types";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getLatestAllStocksPrices } from "../stockPrice/stockPriceActions";
import { withErrorHandling } from "../utils/middleware";

type EtfHolding = {
  holdingSymbol: string;
  shares: number;
  price: number;
  sector: string;
};

type EtfDetails = {
  symbol: string;
  cashComponent: number | null;
  cashComponentPercent: number | null;
  asOfDate: string | null;
  sourceUrl: string;
  holdings: EtfHolding[];
};

type EtfDetailsWithoutPrice = Omit<EtfDetails, "holdings"> & {
  holdings: Omit<EtfHolding, "price" | "sector">[];
};

export const getEtfDetailsMultiple = withErrorHandling(
  async (etfSymbols: string[]): Promise<ServerFunctionResponse<EtfDetails[]>> => {
    const unique = [...new Set(etfSymbols)];
    const results = await Promise.all(unique.map((symbol) => getEtfDetailsCached(symbol)));
    const allPrices = await getLatestAllStocksPrices();
    if (!allPrices.success) {
      return {
        success: false,
        message: allPrices.message,
        status: allPrices.status,
      };
    }
    const stockSymbolMaps = new Map(STOCKS_INFO.map((stock) => [stock.symbol, stock]));
    const priceMap = new Map(
      Object.entries(allPrices.data ?? {}).map(([symbol, price]) => [symbol, (price as { price?: number }).price ?? 0])
    );
    const validResults = results.filter((result): result is EtfDetails => Boolean(result));
    const resultsWithPrices: EtfDetails[] = validResults.map((result) => ({
      ...result,
      holdings: result.holdings.map((holding) => ({
        ...holding,
        price: priceMap.get(holding.holdingSymbol) ?? 0,
        sector: stockSymbolMaps.get(holding.holdingSymbol)?.sectorName ?? "",
      })),
    }));

    return {
      success: true,
      message: "ETF details fetched successfully",
      status: 200,
      data: resultsWithPrices,
    };
  }
);

const getEtfDetailsCached = async (etfSymbol: string) => {
  return unstable_cache(async () => await fetchEtfDetails(etfSymbol), [`etf-details-${etfSymbol}`], {
    revalidate: 8 * 60 * 60, // 8 hours;
    tags: [`etf-details-${etfSymbol}`],
  })();
};

async function fetchEtfDetails(etfSymbol: string): Promise<EtfDetailsWithoutPrice | null> {
  const baskets = await dataDb.select().from(etfBaskets).where(eq(etfBaskets.symbol, etfSymbol));
  const basket = baskets[0] ?? null;
  if (!basket) return null;
  const holdings = await dataDb
    .select({
      holdingSymbol: etfBasketHoldings.holdingSymbol,
      shares: etfBasketHoldings.shares,
    })
    .from(etfBasketHoldings)
    .where(eq(etfBasketHoldings.etfSymbol, etfSymbol));

  return {
    ...basket,
    holdings,
  };
}
