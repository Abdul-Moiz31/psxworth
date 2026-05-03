import {
  calculateBuyPerformance,
  calculateSellPerformance,
  calculateDividendPerformance,
} from "../src/actions/portfolioPerformance/helpers.js";
import { db } from "../src/db/index.js";
import { transactionTable, stockPerformanceTable } from "../src/db/schema.js";

/**
 * Backfills all performance metrics for each stock in each portfolio.
 *
 * @description
 * This function is intended to be a one-time backfill of performance metrics for each stock in each portfolio.
 * It processes all transactions in chronological order, applies the relevant performance calculations, and inserts
 * the calculated performance data into the `stockPerformanceTable`.
 *
 * @note
 * This function does not account for any existing performance data in the `stockPerformanceTable`. If you want to
 * clear all existing performance data first, uncomment the lines that clear the table.
 *
 * @note
 * This function does not account for any missing transactions in the `transactionTable`. If there are missing
 * transactions, the performance calculations will be inaccurate.
 */
async function backfillPerformanceMetrics() {
  console.log("Starting backfill of performance metrics...");

  // OPTION: Clear all existing performance data first
  // console.log("Clearing existing performance data...");
  // await db.delete(stockPerformanceTable);
  // console.log("Existing data cleared.");

  const allTransactions = await db.select().from(transactionTable).orderBy(transactionTable.transactionDate);

  console.log(`Found ${allTransactions.length} transactions to process.`);

  // In-memory store for accumulating performance data for each stock
  const currentStockPerformance: { [key: string]: any } = {};

  for (const transaction of allTransactions) {
    const key = `${transaction.portfolioId}-${transaction.stockSymbol}`;
    let stockData = currentStockPerformance[key];

    if (!stockData) {
      // Initialize fresh data (since we cleared the table)
      stockData = {
        userId: transaction.userId,
        portfolioId: transaction.portfolioId,
        stockSymbol: transaction.stockSymbol,
        averageCost: 0,
        totalShares: 0,
        totalCost: 0,
        totalDividends: 0,
        realizedProfit: 0,
        commissionAndTaxes: 0,
        totalInflow: 0,
        totalOutflow: 0,
      };
    }

    // Preserve the original stockData and merge with calculation results
    if (transaction.type === "buy") {
      const calculatedData = calculateBuyPerformance(stockData, transaction as any);
      stockData = { ...stockData, ...calculatedData };
    } else if (transaction.type === "sell") {
      const calculatedData = calculateSellPerformance(stockData, transaction as any);
      stockData = { ...stockData, ...calculatedData };
    } else if (transaction.type === "dividend") {
      const calculatedData = calculateDividendPerformance(stockData, transaction as any);
      stockData = { ...stockData, ...calculatedData };
    }

    currentStockPerformance[key] = stockData;
  }

  let processedCount = 0;
  // Insert all the calculated performance data
  for (const key in currentStockPerformance) {
    const finalStockData = currentStockPerformance[key];

    // Debug: Check if required fields are present
    if (!finalStockData.userId || !finalStockData.portfolioId || !finalStockData.stockSymbol) {
      console.error(`Missing required fields for key ${key}:`, {
        userId: finalStockData.userId,
        portfolioId: finalStockData.portfolioId,
        stockSymbol: finalStockData.stockSymbol,
        fullData: finalStockData,
      });
      continue; // Skip this record
    }

    try {
      await db.insert(stockPerformanceTable).values({
        ...finalStockData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      processedCount++;
      console.log(`Created performance for ${finalStockData.stockSymbol} in portfolio ${finalStockData.portfolioId}`);
    } catch (error) {
      console.error(
        `Failed to create performance for ${finalStockData.stockSymbol} in portfolio ${finalStockData.portfolioId}:`,
        error
      );
    }
  }

  console.log(`Backfill completed successfully. Processed ${processedCount} unique stock performances.`);
}

backfillPerformanceMetrics().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
