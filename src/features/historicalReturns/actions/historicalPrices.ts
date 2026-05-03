"use server";

import { withErrorHandling } from "@/actions/utils/middleware";
import { dataDb } from "@/db";
import { historicalPrices } from "@/db/datadb-schema";
import { HistoricalPrice, HistoricalPricesBySymbol } from "@/features/historicalReturns/shared/types";
import { and, gte, lte, inArray, eq, desc } from "drizzle-orm";

/**
 * Retrieves historical prices for given symbols within a date range.
 * Returns close/adjustedClose; caller selects which to use.
 * Handles missing data by forward-filling last known price.
 */
export const getHistoricalPrices = withErrorHandling(
  async (symbols: string[], startDate: Date, endDate: Date): Promise<HistoricalPricesBySymbol> => {
    if (symbols.length === 0) {
      return {};
    }

    const prices = await dataDb
      .select({
        symbol: historicalPrices.symbol,
        date: historicalPrices.date,
        close: historicalPrices.close,
        adjustedClose: historicalPrices.adjustedClose,
        open: historicalPrices.open,
        high: historicalPrices.high,
        low: historicalPrices.low,
        volume: historicalPrices.volume,
      })
      .from(historicalPrices)
      .where(
        and(
          inArray(historicalPrices.symbol, symbols),
          gte(historicalPrices.date, startDate),
          lte(historicalPrices.date, endDate)
        )
      )
      .orderBy(historicalPrices.symbol, historicalPrices.date);

    const pricesBySymbol: HistoricalPricesBySymbol = {};
    for (const symbol of symbols) {
      pricesBySymbol[symbol] = [];
    }
    for (const price of prices) {
      pricesBySymbol[price.symbol].push(price);
    }

    return pricesBySymbol;
  }
);

/**
 * Gets the latest available price for a symbol before or on a given date.
 * Used for forward-filling missing data.
 */
export async function getLatestPriceBeforeDate(symbol: string, date: Date): Promise<HistoricalPrice | null> {
  const prices = await dataDb
    .select({
      symbol: historicalPrices.symbol,
      date: historicalPrices.date,
      close: historicalPrices.close,
      adjustedClose: historicalPrices.adjustedClose,
      open: historicalPrices.open,
      high: historicalPrices.high,
      low: historicalPrices.low,
      volume: historicalPrices.volume,
    })
    .from(historicalPrices)
    .where(and(eq(historicalPrices.symbol, symbol), lte(historicalPrices.date, date)))
    .orderBy(desc(historicalPrices.date))
    .limit(1);

  if (!prices || prices.length === 0) {
    return null;
  }

  return prices[0];
}
