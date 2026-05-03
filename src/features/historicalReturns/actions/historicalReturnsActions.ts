"use server";

import { requireAuth, withErrorHandling, withPortfolioOwnership } from "@/actions/utils/middleware";
import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { HistoricalReturnsResponse, ReturnPoint, ReturnType, Scope } from "@/features/historicalReturns/shared/types";
import { and, asc, eq } from "drizzle-orm";
import { calculateHistoricalPortfolioValues, transformToStockScope } from "./historicalPortfolioValues";
import {
  calculateMoneyWeightedReturn,
  calculateTimeWeightedReturn,
  calculateSimpleReturn,
  generateDatePoints,
} from "./utils";

/**
 * Gets historical returns data for a portfolio or individual stock.
 * Supports Time-Weighted Return (TWR), Money-Weighted Return (MWR), and Simple Return.
 */
export const getHistoricalReturns = withErrorHandling(
  async (
    portfolioId: number,
    startDate: Date,
    endDate: Date,
    returnType: ReturnType = "twr",
    scope: Scope = "portfolio",
    stockSymbol?: string
  ): Promise<HistoricalReturnsResponse> => {
    const userId = await requireAuth();
    await withPortfolioOwnership(portfolioId, userId);

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    } else if (scope === "stock" && !stockSymbol) {
      throw new Error("Stock symbol is required when scope is 'stock'");
    }

    const datePoints = generateDatePoints(startDate, endDate);
    const portfolioValues = await calculateHistoricalPortfolioValues(
      portfolioId,
      userId,
      startDate,
      endDate,
      datePoints
    );

    const valuePoints =
      scope === "stock" && stockSymbol
        ? await transformToStockScope(portfolioValues, stockSymbol, portfolioId, userId, endDate)
        : portfolioValues;

    let returnPoints: ReturnPoint[];
    if (returnType === "twr") {
      returnPoints = calculateTimeWeightedReturn(valuePoints);
    } else if (returnType === "mwr") {
      returnPoints = calculateMoneyWeightedReturn(valuePoints);
    } else {
      returnPoints = calculateSimpleReturn(valuePoints);
    }

    return {
      data: returnPoints,
      returnType,
      scope,
      stockSymbol: scope === "stock" ? stockSymbol : undefined,
    };
  }
);

/**
 * Gets available stock symbols for a portfolio that have historical data.
 * Used for stock-level scope selection.
 */
export const getAvailableStockSymbols = withErrorHandling(async (portfolioId: number): Promise<string[]> => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  // TODO: We should take the user selected filter here and based on that select only the current stocks (with shares > 0) or all.
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const datePoints = generateDatePoints(startDate, endDate);
  const portfolioValues = await calculateHistoricalPortfolioValues(portfolioId, userId, startDate, endDate, datePoints);

  // Extract unique stock symbols that have holdings
  const stockSymbols = new Set<string>();
  portfolioValues.forEach((point) => {
    Object.keys(point.holdings).forEach((symbol) => {
      if (point.holdings[symbol].shares > 0) {
        stockSymbols.add(symbol);
      }
    });
  });

  return Array.from(stockSymbols).sort();
});

/**
 * Gets the earliest transaction date for a portfolio, optionally filtered by stock symbol.
 * Used to set dynamic default date ranges in the historical returns chart.
 */
export const getEarliestTransactionDate = withErrorHandling(
  async (portfolioId: number, stockSymbol?: string): Promise<string | null> => {
    const userId = await requireAuth();
    await withPortfolioOwnership(portfolioId, userId);

    const conditions = [eq(transactionTable.portfolioId, portfolioId), eq(transactionTable.userId, userId)];
    if (stockSymbol) {
      conditions.push(eq(transactionTable.stockSymbol, stockSymbol));
    }

    const earliest = await db
      .select({ transactionDate: transactionTable.transactionDate })
      .from(transactionTable)
      .where(and(...conditions))
      .orderBy(asc(transactionTable.transactionDate))
      .limit(1);

    return earliest[0]?.transactionDate ?? null;
  }
);
