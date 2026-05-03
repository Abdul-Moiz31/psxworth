"use server";

import { calculateBuyPerformance, calculateSellPerformance } from "@/actions/portfolioPerformance/helpers";
import { db } from "@/db";
import { transactionTable, Transaction } from "@/db/schema";
import { toDateOnlyTimestamp } from "@/features/historicalReturns/shared/dateUtils";
import { coerceToLocalDateDate, toLocalDate } from "@/types/localDate";
import {
  HistoricalPricesBySymbol,
  PortfolioValuePoint,
  StockPerformance,
} from "@/features/historicalReturns/shared/types";
import { HistoricalPrice } from "@/features/historicalReturns/shared/types";
import { eq, and, lte, asc } from "drizzle-orm";
import { getHistoricalPrices } from "./historicalPrices";

/**
 * Binary search to find the latest price on or before a given date.
 * Assumes prices are sorted in ascending order by date.
 * Returns the index of the price, or -1 if no price is found.
 */
function findLatestPriceBeforeDate(prices: HistoricalPrice[], targetDate: Date): number {
  if (prices.length === 0) {
    return -1;
  }

  const targetTime = toDateOnlyTimestamp(targetDate);
  let left = 0;
  let right = prices.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midTime = toDateOnlyTimestamp(prices[mid].date);

    if (midTime <= targetTime) {
      // This price is on or before the target date, it's a candidate
      result = mid;
      // Continue searching in the right half to find a later price
      left = mid + 1;
    } else {
      // This price is after the target date, search in the left half
      right = mid - 1;
    }
  }

  return result;
}

/**
 * Calculates holdings and total portfolio value for a given date.
 * Uses historical prices to determine current values based on share holdings.
 */
function calculateHoldingsAndValue(
  stockPerformance: StockPerformance,
  historicalPricesBySymbol: HistoricalPricesBySymbol,
  date: Date,
  stockSymbols: string[]
): {
  holdings: PortfolioValuePoint["holdings"];
  totalPortfolioValue: number;
} {
  const holdings: PortfolioValuePoint["holdings"] = {};
  let totalPortfolioValue = 0;

  for (const symbol of stockSymbols) {
    const shares = stockPerformance[symbol]?.totalShares || 0;

    // Find price for this date (or closest before) using binary search
    let price: number | null = null;
    const symbolPrices = historicalPricesBySymbol[symbol] || [];

    if (symbolPrices.length > 0) {
      const priceIndex = findLatestPriceBeforeDate(symbolPrices, date);
      if (priceIndex >= 0) {
        const foundPrice = symbolPrices[priceIndex];
        price = foundPrice.close ?? foundPrice.adjustedClose ?? null;
      }
    }

    const value = shares * (price || 0);
    totalPortfolioValue += value;

    if (shares > 0 || value > 0) {
      holdings[symbol] = {
        shares,
        value,
        price,
      };
    }
  }

  return { holdings, totalPortfolioValue };
}

/**
 * Calculates cash flows from transactions.
 * Buys are negative (money going out), sells/dividends are positive (money coming in).
 */
function calculateCashFlows(transactions: Transaction[]): PortfolioValuePoint["cashFlows"] {
  const cashFlows: PortfolioValuePoint["cashFlows"] = [];

  for (const transaction of transactions) {
    if (transaction.type === "buy") {
      const cost = (transaction.pricePerShare || 0) * (transaction.numberOfShares || 0);
      const commission = transaction.commissionAndTaxes || 0;
      const totalCost = transaction.isCommissionPercentage ? cost + (cost * commission) / 100 : cost + commission;

      cashFlows.push({
        date: coerceToLocalDateDate(transaction.transactionDate),
        amount: -totalCost, // Negative for buys (money going out)
        stockSymbol: transaction.stockSymbol,
      });
    } else if (transaction.type === "sell") {
      const proceeds = (transaction.pricePerShare || 0) * (transaction.numberOfShares || 0);
      const commission = transaction.commissionAndTaxes || 0;
      const netProceeds = transaction.isCommissionPercentage
        ? proceeds - (proceeds * commission) / 100
        : proceeds - commission;

      cashFlows.push({
        date: coerceToLocalDateDate(transaction.transactionDate),
        amount: netProceeds, // Positive for sells (money coming in)
        stockSymbol: transaction.stockSymbol,
      });
    } else if (transaction.type === "dividend") {
      const dividendTotal = (transaction.dividendPerShare || 0) * (transaction.numberOfShares || 0);
      const commission = transaction.commissionAndTaxes || 0;
      const netDividend = transaction.isCommissionPercentage
        ? dividendTotal - (dividendTotal * commission) / 100
        : dividendTotal - commission;

      cashFlows.push({
        date: coerceToLocalDateDate(transaction.transactionDate),
        amount: netDividend, // Positive for dividends (money coming in)
        stockSymbol: transaction.stockSymbol,
      });
    }
  }

  return cashFlows;
}

/**
 * Reconstructs portfolio holdings and values at each date point in the time series.
 *
 * OPTIMIZATION NOTE:
 * This function uses an incremental approach to process transactions efficiently.
 * Instead of re-filtering and re-processing all transactions for each date point (O(D × T)),
 * we maintain a running state and only process new transactions as we move through time (O(D + T)).
 *
 * For each date point:
 * - Incrementally processes only NEW transactions since the last date point
 * - Maintains running stock performance state
 * - Uses pre-computed cash flows with index-based slicing
 * - Gets historical prices for that date via binary search.
 */
export async function calculateHistoricalPortfolioValues(
  portfolioId: number,
  userId: string,
  startDate: Date,
  endDate: Date,
  datePoints: Date[]
): Promise<PortfolioValuePoint[]> {
  const allTransactions = await db
    .select()
    .from(transactionTable)
    .where(
      and(
        eq(transactionTable.portfolioId, portfolioId),
        eq(transactionTable.userId, userId),
        lte(transactionTable.transactionDate, toLocalDate(endDate))
      )
    )
    .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

  if (allTransactions.length === 0) {
    return datePoints.map((date) => ({
      date,
      portfolioValue: 0,
      holdings: {},
      cashFlows: [],
    }));
  }

  const stockSymbols: string[] = Array.from(new Set(allTransactions.map((t) => t.stockSymbol)));

  // Fetch prices starting from a few days before startDate to ensure we have prices
  // for holdings that existed before the start date (needed for accurate portfolio value calculation)
  const priceStartDate = new Date(startDate);
  priceStartDate.setDate(priceStartDate.getDate() - 7); // Fetch 7 days before to account for weekends/holidays

  const historicalPricesResponse = await getHistoricalPrices(stockSymbols, priceStartDate, endDate);
  if (!historicalPricesResponse.success || !historicalPricesResponse.data) {
    throw new Error("Failed to fetch historical prices");
  }
  const historicalPricesBySymbol = historicalPricesResponse.data;

  // Pre-compute all cash flows once (transactions are already sorted by date)
  const allCashFlows = calculateCashFlows(allTransactions);

  // Filter cash flows to only include those within the date range
  // Cash flows before startDate should not be included in return calculations
  // as they are already reflected in the portfolio value at startDate
  const startDateTime = toDateOnlyTimestamp(startDate);
  const endDateTime = toDateOnlyTimestamp(endDate);
  const cashFlowsInRange = allCashFlows.filter((cf) => {
    const cfTime = toDateOnlyTimestamp(cf.date);
    return cfTime >= startDateTime && cfTime <= endDateTime;
  });

  // Group cash flows by the date point they should be associated with
  // Since date points may not exactly match transaction dates, we assign each cash flow
  // to the nearest date point on or AFTER the transaction date so the portfolio value
  // already reflects the cash flow when returns are computed.
  const cashFlowsByDatePoint = new Map<number, PortfolioValuePoint["cashFlows"]>();

  let datePointIndex = 0;
  for (const cashFlow of cashFlowsInRange) {
    const cashFlowTime = toDateOnlyTimestamp(cashFlow.date);

    // Advance to the earliest date point that is >= the cash flow date
    while (datePointIndex < datePoints.length && toDateOnlyTimestamp(datePoints[datePointIndex]) < cashFlowTime) {
      datePointIndex++;
    }

    // Assign cash flow to this date point (or the last one if beyond range)
    const targetDatePoint = toDateOnlyTimestamp(
      datePointIndex < datePoints.length ? datePoints[datePointIndex] : datePoints[datePoints.length - 1]
    );

    if (!cashFlowsByDatePoint.has(targetDatePoint)) {
      cashFlowsByDatePoint.set(targetDatePoint, []);
    }
    cashFlowsByDatePoint.get(targetDatePoint)!.push(cashFlow);
  }

  // Initialize stock performance ONCE - we'll update it incrementally
  const stockPerformance: StockPerformance = {};
  for (const symbol of stockSymbols) {
    stockPerformance[symbol] = {
      totalShares: 0,
      totalCost: 0,
      averageCost: 0,
      totalInflow: 0,
      totalOutflow: 0,
    };
  }

  // Pointer to track progress through sorted transactions
  let transactionIndex = 0;

  const portfolioValues: PortfolioValuePoint[] = [];

  for (const date of datePoints) {
    const dateTime = toDateOnlyTimestamp(date);

    // Process only NEW transactions up to this date (incremental)
    // Since transactions are sorted by date, we just advance the pointer
    while (
      transactionIndex < allTransactions.length &&
      toDateOnlyTimestamp(coerceToLocalDateDate(allTransactions[transactionIndex].transactionDate)) <= dateTime
    ) {
      const transaction = allTransactions[transactionIndex];
      const symbol = transaction.stockSymbol;

      // Update stock performance in place
      if (transaction.type === "buy") {
        const updated = calculateBuyPerformance(stockPerformance[symbol], transaction as any);
        Object.assign(stockPerformance[symbol], updated);
      } else if (transaction.type === "sell") {
        const updated = calculateSellPerformance(stockPerformance[symbol], transaction as any);
        Object.assign(stockPerformance[symbol], updated);
      }

      transactionIndex++;
    }

    // Calculate holdings and total portfolio value using current stock performance state
    const { holdings, totalPortfolioValue } = calculateHoldingsAndValue(
      stockPerformance,
      historicalPricesBySymbol,
      date,
      stockSymbols
    );

    // Only include cash flows assigned to this specific date point
    // This avoids duplicating cash flows across date points while ensuring
    // all cash flows are captured in at least one date point
    const cashFlowsOnThisDate = cashFlowsByDatePoint.get(dateTime) || [];

    portfolioValues.push({
      date,
      portfolioValue: totalPortfolioValue,
      holdings,
      cashFlows: cashFlowsOnThisDate,
    });
  }

  return portfolioValues;
}

/**
 * Transforms portfolio-level value points to stock-level value points.
 * Filters holdings and cash flows to only include data for the specified stock.
 *
 * @param portfolioValues - Portfolio-level value points
 * @param stockSymbol - Stock symbol to filter by
 * @param portfolioId - Portfolio ID
 * @param userId - User ID
 * @param endDate - End date for filtering transactions
 * @returns Filtered portfolio value points containing only the specified stock's data
 */
export async function transformToStockScope(
  portfolioValues: PortfolioValuePoint[],
  stockSymbol: string,
  portfolioId: number,
  userId: string,
  endDate: Date
): Promise<PortfolioValuePoint[]> {
  // Get all transactions for this stock to identify cash flow dates
  const stockTransactions = await db
    .select()
    .from(transactionTable)
    .where(
      and(
        eq(transactionTable.portfolioId, portfolioId),
        eq(transactionTable.userId, userId),
        eq(transactionTable.stockSymbol, stockSymbol),
        lte(transactionTable.transactionDate, toLocalDate(endDate))
      )
    )
    .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

  // Create a set of transaction dates for this stock.
  // This is only used as a compatibility fallback for older cash-flow points
  // that may not have stockSymbol populated.
  const stockTransactionDates = new Set(
    stockTransactions.map((t) => toDateOnlyTimestamp(coerceToLocalDateDate(t.transactionDate)))
  );

  // Filter portfolio values to only include this stock's holdings and cash flows
  return portfolioValues.map((point) => {
    const stockHolding = point.holdings[stockSymbol];

    // Filter cash flows to only include transactions for this stock.
    // Prefer explicit symbol matching, fallback to date-only matching for old points.
    const filteredCashFlows = point.cashFlows.filter((cf) => {
      if (cf.stockSymbol) {
        return cf.stockSymbol === stockSymbol;
      }
      const cfDate = cf.date instanceof Date ? cf.date : new Date(cf.date);
      return stockTransactionDates.has(toDateOnlyTimestamp(cfDate));
    });

    return {
      ...point,
      portfolioValue: stockHolding?.value || 0,
      holdings: stockHolding
        ? {
            [stockSymbol]: stockHolding,
          }
        : {},
      cashFlows: filteredCashFlows,
    };
  });
}
