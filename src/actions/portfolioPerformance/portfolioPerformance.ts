"use server";

import { getPostHogServer } from "@/app/posthog-server";
import { db } from "@/db";
import { stockPerformanceTable, transactionTable } from "@/db/schema";
import { rateLimiters } from "@/lib/rateLimit";
import { ServerFunctionResponse, Transaction } from "@/types";
import { PORTFOLIO_RECALCULATED } from "@/utils/posthog/events";
import { captureException } from "@/utils/posthog/helpers";
import { eq, and, asc } from "drizzle-orm";
import { updateTag } from "next/cache";
import { getLatestAllStocksPrices, getLatestPreviousCloseForAllStocks } from "../stockPrice/stockPriceActions";
import { sortTransactionsByDateAndType } from "../transaction/helpers";
import { getDefaultStockPerformance } from "../utils";
import { AppError } from "../utils/errors";
import { requireAuth, withErrorHandling, withPortfolioOwnership } from "../utils/middleware";
import {
  calculateBuyPerformance,
  calculateDetailedPortfolioPerformance,
  calculateDividendPerformance,
  calculateSellPerformance,
} from "./helpers";

// Database update utility
const updateStockPerformanceInDb = async (
  updatedPerformance: any,
  portfolioId: number,
  stockSymbol: string,
  tx?: any
) => {
  const dbOrTx = tx || db;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...performanceData } = updatedPerformance;

  // Use INSERT OR REPLACE or ON CONFLICT logic
  await dbOrTx
    .insert(stockPerformanceTable)
    .values({
      ...performanceData,
      portfolioId,
      stockSymbol,
    })
    .onConflictDoUpdate({
      target: [stockPerformanceTable.portfolioId, stockPerformanceTable.stockSymbol],
      set: {
        ...performanceData,
        updatedAt: new Date(),
      },
    })
    .execute();
};

// Database access utility
const getStockPerformanceData = async (portfolioId: number, stockSymbol: string, tx?: any) => {
  const dbOrTx = tx ?? db;
  return dbOrTx
    .select()
    .from(stockPerformanceTable)
    .where(and(eq(stockPerformanceTable.portfolioId, portfolioId), eq(stockPerformanceTable.stockSymbol, stockSymbol)))
    .limit(1)
    .then((rows: any[]) => rows[0]);
};

/**
 * Updates the performance of multiple stocks based on list of transactions.
 * @param transactions The transactions to update the performance for.
 * @param tx Optional transaction object for database operations.
 * @returns A ServerFunctionResponse object with the updated performance data.
 */
export const updateMultiplePerformances = async (
  transactions: Transaction[],
  tx: any
): Promise<ServerFunctionResponse> => {
  const loggedInUserId = await requireAuth();
  await withPortfolioOwnership(transactions[0].portfolioId, loggedInUserId);

  const transactionsByStock: { [key: string]: Transaction[] } = transactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.stockSymbol]) {
        acc[transaction.stockSymbol] = [];
      }
      acc[transaction.stockSymbol].push(transaction);
      return acc;
    },
    {} as { [key: string]: Transaction[] }
  );

  for (const stockSymbol in transactionsByStock) {
    const sortedTransactions = sortTransactionsByDateAndType(transactionsByStock[stockSymbol]);
    const stockPerformance = await getStockPerformanceData(sortedTransactions[0].portfolioId, stockSymbol, tx);

    let updatedPerformance = {
      ...getDefaultStockPerformance(loggedInUserId, sortedTransactions[0].portfolioId, stockSymbol),
      ...stockPerformance,
    };

    for (const transaction of sortedTransactions) {
      if (transaction.type === "buy") {
        updatedPerformance = { ...updatedPerformance, ...calculateBuyPerformance(updatedPerformance, transaction) };
      } else if (transaction.type === "sell") {
        updatedPerformance = { ...updatedPerformance, ...calculateSellPerformance(updatedPerformance, transaction) };
      } else if (transaction.type === "dividend") {
        updatedPerformance = {
          ...updatedPerformance,
          ...calculateDividendPerformance(updatedPerformance, transaction),
        };
      }
    }

    if (updatedPerformance) {
      try {
        await updateStockPerformanceInDb(
          updatedPerformance,
          transactionsByStock[stockSymbol][0].portfolioId,
          stockSymbol,
          tx
        );
      } catch (error: any) {
        captureException(error);
        throw new Error(error.message || "Failed to update performance in database");
      }
    }
  }

  return {
    status: 200,
    success: true,
    message: "Performances updated successfully",
  };
};

/**
 * Fetches all transactions for a stock and re-calculates the performance.
 * Deletes old performance data and inserts new one.
 * @param userId The ID of the user performing the update.
 * @param portfolioId The ID of the portfolio to update the performance for.
 * @param stockSymbol The symbol of the stock to update the performance for.
 * @param tx Optional transaction object for database operations.
 * @returns A ServerFunctionResponse object with the updated performance data.
 */

export const calculateStockPerformance = withErrorHandling(
  async (portfolioId: number, stockSymbol: string, tx: any) => {
    const userId = await requireAuth();
    await withPortfolioOwnership(portfolioId, userId);

    const txOrDb = tx || db;
    const allTransactions = await txOrDb
      .select()
      .from(transactionTable)
      .where(and(eq(transactionTable.portfolioId, portfolioId), eq(transactionTable.stockSymbol, stockSymbol)))
      .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

    await txOrDb
      .delete(stockPerformanceTable)
      .where(
        and(eq(stockPerformanceTable.portfolioId, portfolioId), eq(stockPerformanceTable.stockSymbol, stockSymbol))
      );

    await updateMultiplePerformances(allTransactions, tx);

    updateTag(`portfolio-${portfolioId}-performance`);
  }
);

/**
 * Fetches the performance of a stock.
 * @param portfolioId The ID of the portfolio to fetch the performance for.
 * @param stockSymbol The symbol of the stock to fetch the performance for.
 * @returns A ServerFunctionResponse object with the performance data.
 */

export const getStockPerformance = withErrorHandling(async (portfolioId: number, stockSymbol: string) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  const performanceData = await getStockPerformanceData(portfolioId, stockSymbol);
  if (!performanceData) {
    throw new Error("Stock performance data not found");
  }

  return performanceData;
});

/**
 * Fetches the performance of a portfolio.
 * @param portfolioId The ID of the portfolio to fetch the performance for.
 * @returns A ServerFunctionResponse object with the performance data.
 */

export const getPortfolioPerformance = withErrorHandling(async (portfolioId: number) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  const performanceData = await db
    .select()
    .from(stockPerformanceTable)
    .where(and(eq(stockPerformanceTable.portfolioId, portfolioId), eq(stockPerformanceTable.userId, userId)));

  return performanceData;
});

//Main action used to get the detailed portfolio performance
export const getDetailedPortfolioPerformance = withErrorHandling(async (portfolioId: number) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  const performanceResponse = await getPortfolioPerformance(portfolioId);
  if (!performanceResponse.success) {
    throw new AppError(
      performanceResponse.message || "We're having trouble loading your portfolio right now.",
      performanceResponse.status
    );
  }

  const performanceData = performanceResponse.data;
  const [pricesResponse, previousCloseResponse] = await Promise.all([
    getLatestAllStocksPrices(),
    getLatestPreviousCloseForAllStocks(),
  ]);
  if (!pricesResponse.success) {
    throw new AppError(
      pricesResponse.message || "We're having trouble loading your portfolio right now.",
      pricesResponse.status
    );
  }
  if (!previousCloseResponse.success) {
    throw new AppError(
      previousCloseResponse.message || "We're having trouble loading your portfolio right now.",
      previousCloseResponse.status
    );
  }

  const stockPrices = pricesResponse.data;
  const stockPreviousCloses = previousCloseResponse.data;
  const detailedPerformanceData: any = [];

  performanceData?.forEach((stock: any) => {
    const stockPrice = stockPrices[stock.stockSymbol]?.price;
    if (stockPrice) {
      const previousClose = stockPreviousCloses[stock.stockSymbol]?.previousClose;
      const stockDetailedPerformance = calculateDetailedPortfolioPerformance(stockPrice, stock, previousClose);
      detailedPerformanceData.push({ ...stockDetailedPerformance });
    }
  });

  return detailedPerformanceData;
});

/**
 * Recalculates the performance of a complete portfolio.
 * Should be used sparingly as it is a heavy operation.
 * @param userId The ID of the user performing the update.
 * @param portfolioId The ID of the portfolio to recalculate the performance for.
 * @param tx Optional transaction object for database operations.
 * @returns A ServerFunctionResponse object with the updated performance data.
 */

//TODO: We need to create the TX Inside this function. It is being directly using without tx.
export const recalculatePortfolioPerformance = withErrorHandling(async (portfolioId: number, tx?: any) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  // 1. Check rate limit before proceeding
  const rateLimitResult = await rateLimiters.recalculatePerformance.limit(portfolioId.toString());
  if (!rateLimitResult.success) {
    const retryAfter: number = rateLimitResult.success ? 0 : Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
  }

  // 2-4. Run all DB mutations inside a single transaction if one isn't provided
  if (tx) {
    // Use the provided transaction
    const allTransactions = await tx
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.portfolioId, portfolioId))
      .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

    await tx.delete(stockPerformanceTable).where(eq(stockPerformanceTable.portfolioId, portfolioId));
    await updateMultiplePerformances(allTransactions, tx);
  } else {
    await db.transaction(async (trxOriginal) => {
      const trx = trxOriginal as any;
      const allTransactions = await trx
        .select()
        .from(transactionTable)
        .where(eq(transactionTable.portfolioId, portfolioId))
        .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

      await trx.delete(stockPerformanceTable).where(eq(stockPerformanceTable.portfolioId, portfolioId));
      await updateMultiplePerformances(allTransactions as unknown as Transaction[], trx);
    });
  }

  // Run cache revalidation and analytics only after a successful commit
  updateTag(`portfolio-${portfolioId}-performance`);

  const posthog = getPostHogServer();
  posthog.capture(PORTFOLIO_RECALCULATED, {
    portfolio_id: portfolioId,
    user_id: userId,
  });
});
