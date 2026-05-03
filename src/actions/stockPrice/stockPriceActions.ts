"use server";

import { StockPreviousCloses, StockPrices } from "@/actions/stockPrice/interfaces/stockPriceInterfaces";
import { dataDb } from "@/db";
import { historicalPrices, stocksPricesTable } from "@/db/datadb-schema";
import { ServerFunctionResponse } from "@/types";
import { captureException } from "@/utils/posthog/helpers";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export async function getLatestAllStocksPrices(): Promise<ServerFunctionResponse> {
  try {
    const prices = await getCachedStockPrices();

    return {
      success: true,
      data: prices,
      status: 200,
      message: "Stock prices fetched successfully",
    };
  } catch (error: any) {
    captureException(error);
    return {
      success: false,
      message: error.message || "Unknown error fetching stock prices",
      status: 500,
    };
  }
}

export async function getLatestPreviousCloseForAllStocks(): Promise<ServerFunctionResponse> {
  try {
    const previousCloses = await getCachedLatestPreviousCloses();

    return {
      success: true,
      data: previousCloses,
      status: 200,
      message: "Previous closes fetched successfully",
    };
  } catch (error: any) {
    captureException(error);
    return {
      success: false,
      message: error.message || "Unknown error fetching previous closes",
      status: 500,
    };
  }
}

// Create cached version of the fetch function
const getCachedStockPrices = unstable_cache(
  async () => {
    const prices = await dataDb.select().from(stocksPricesTable);

    const stockPrices: StockPrices = {};
    prices.forEach((price) => {
      stockPrices[price.symbol] = {
        symbol: price.symbol,
        price: Number(price.price),
        updatedAt: price.updatedAt,
      };
    });

    return stockPrices;
  },
  ["stock-prices"], // cache key
  {
    revalidate: 150, // 2:30 minutes in seconds
    tags: ["stock-prices"],
  }
);

const getCachedLatestPreviousCloses = unstable_cache(
  async () => {
    const result = await dataDb.execute(
      sql`
        SELECT DISTINCT ON (${historicalPrices.symbol})
          ${historicalPrices.symbol} AS symbol,
          ${historicalPrices.date} AS date,
          ${historicalPrices.close} AS close
        FROM ${historicalPrices}
        WHERE ${historicalPrices.close} IS NOT NULL
          AND ${historicalPrices.date} < CURRENT_DATE
        ORDER BY ${historicalPrices.symbol}, ${historicalPrices.date} DESC
      `
    );

    const previousCloses: StockPreviousCloses = {};
    const rows = Array.isArray(result) ? result : (result as any).rows ?? [];

    rows.forEach((row: any) => {
      if (!row.symbol || row.close == null) {
        return;
      }

      previousCloses[row.symbol] = {
        previousClose: Number(row.close),
        date: new Date(row.date),
      };
    });

    return previousCloses;
  },
  ["stock-previous-closes"],
  {
    revalidate: 3600,
    tags: ["stock-previous-closes"],
  }
);
