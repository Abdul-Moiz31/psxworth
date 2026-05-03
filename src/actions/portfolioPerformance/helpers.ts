import { StockPerformance } from "@/db/schema";
import { StockDetailedPerformance } from "@/interfaces";
import { BuyTransaction, DividendTransaction, SellTransaction } from "@/types";

export const calculateDetailedPortfolioPerformance = (
  currentPrice: number,
  stockPerformance: StockPerformance,
  previousClose?: number | null
): StockDetailedPerformance => {
  const currentValue = stockPerformance.totalShares * currentPrice;
  const unrealizedProfit = currentValue - stockPerformance.totalCost;
  const unrealizedProfitPercentage =
    stockPerformance.totalCost !== 0 ? (unrealizedProfit / stockPerformance.totalCost) * 100 : 0;
  const sinceAverageBuyPrice = currentPrice - stockPerformance.averageCost;
  const sinceAverageBuyPricePercentage =
    stockPerformance.averageCost !== 0 ? (sinceAverageBuyPrice / stockPerformance.averageCost) * 100 : 0;

  // Calculate total return based on total inflow, total outflow, and current value
  const totalReturn = stockPerformance.totalOutflow + currentValue - stockPerformance.totalInflow;

  // Calculate total profit percentage based on total return and total inflow
  const totalProfitPercentage =
    stockPerformance.totalInflow !== 0 ? (totalReturn / stockPerformance.totalInflow) * 100 : 0;

  // Calculate total profit with dividends, adding total dividends to total return
  const totalProfitWithDividends = totalReturn + stockPerformance.totalDividends;

  // Calculate total profit with dividends percentage based on total profit with dividends and total inflow
  const totalProfitWithDividendsPercentage =
    stockPerformance.totalInflow !== 0 ? (totalProfitWithDividends / stockPerformance.totalInflow) * 100 : 0;

  const hasValidPreviousClose =
    typeof previousClose === "number" && Number.isFinite(previousClose) && previousClose > 0;
  const previousCloseValue = hasValidPreviousClose ? stockPerformance.totalShares * previousClose : null;
  const todayPnL = hasValidPreviousClose ? stockPerformance.totalShares * (currentPrice - previousClose) : null;
  const todayPnLPercentage = hasValidPreviousClose ? ((currentPrice - previousClose) / previousClose) * 100 : null;

  return {
    ...stockPerformance,
    currentValue,
    previousCloseValue,
    unrealizedProfit,
    unrealizedProfitPercentage,
    sinceAverageBuyPrice,
    sinceAverageBuyPricePercentage,
    todayPnL,
    todayPnLPercentage,
    totalProfit: totalReturn, // Use totalReturn for totalProfit
    totalProfitPercentage,
    totalProfitWithDividends,
    totalProfitWithDividendsPercentage,
    currentPrice,
  };
};

const calculateCommission = (amount: number, isPercentage: boolean | undefined, baseValue: number): number => {
  if (!amount) return 0;

  if (isPercentage) {
    return (amount / 100) * baseValue;
  }
  return amount;
};

export const calculateBuyPerformance = (stockData: any, transaction: BuyTransaction) => {
  const commissionAndTaxes = calculateCommission(
    transaction.commissionAndTaxes || 0,
    transaction.isCommissionPercentage,
    transaction.pricePerShare * transaction.numberOfShares
  );

  const newTotalShares = stockData.totalShares + transaction.numberOfShares;
  const transactionCost = transaction.pricePerShare * transaction.numberOfShares + commissionAndTaxes;
  const newTotalCost = stockData.totalCost + transactionCost;
  const newAverageCost = newTotalShares > 0 ? newTotalCost / newTotalShares : 0;
  const newTotalInflow = stockData.totalInflow + transactionCost; // Inflow increases with buy cost

  return {
    totalShares: newTotalShares,
    totalCost: newTotalCost,
    averageCost: newAverageCost,
    commissionAndTaxes: stockData.commissionAndTaxes + commissionAndTaxes,
    totalInflow: newTotalInflow,
  };
};

export const calculateSellPerformance = (stockData: any, transaction: SellTransaction) => {
  const newTotalShares = stockData.totalShares - transaction.numberOfShares;
  const newTotalCost = newTotalShares > 0 ? stockData.averageCost * newTotalShares : 0;
  const newAverageCost = newTotalShares > 0 ? newTotalCost / newTotalShares : 0;

  const commissionAndTaxes = calculateCommission(
    transaction.commissionAndTaxes || 0,
    transaction.isCommissionPercentage,
    transaction.pricePerShare * transaction.numberOfShares
  );

  const realizedProfit =
    transaction.pricePerShare * transaction.numberOfShares -
    (stockData.averageCost * transaction.numberOfShares + commissionAndTaxes);

  return {
    totalShares: newTotalShares,
    totalCost: newTotalCost,
    averageCost: newAverageCost,
    realizedProfit: stockData.realizedProfit + realizedProfit,
    commissionAndTaxes: stockData.commissionAndTaxes + commissionAndTaxes,
    totalOutflow:
      stockData.totalOutflow + (transaction.pricePerShare * transaction.numberOfShares - commissionAndTaxes), // Outflow increases with net proceeds from sale
  };
};

export const calculateDividendPerformance = (stockData: any, transaction: DividendTransaction) => {
  const dividendTotal = transaction.dividendPerShare * transaction.numberOfShares;

  const commissionAndTaxes = calculateCommission(
    transaction.commissionAndTaxes || 0,
    transaction.isCommissionPercentage,
    dividendTotal
  );

  const netDividend = dividendTotal - commissionAndTaxes;

  return {
    totalDividends: stockData.totalDividends + netDividend,
    commissionAndTaxes: stockData.commissionAndTaxes + commissionAndTaxes,
  };
};
