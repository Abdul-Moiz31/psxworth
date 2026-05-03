import { StockDetailedPerformance } from "@/interfaces";

export const calculatePortfolioMetrics = (data: StockDetailedPerformance[]) => {
  if (!data || data.length === 0) {
    return {
      totalProfit: 0,
      stocksCount: 0,
      gainersCount: 0,
      investedAmount: 0,
      totalDividends: 0,
      totalCurrentValue: 0,
      totalRealizedProfit: 0,
      profitWithDividends: 0,
      totalUnrealizedProfit: 0,
      totalTodayPnL: 0,
      totalProfitPercentage: 0,
      totalTodayPnLPercentage: 0,
      totalPreviousCloseValue: 0,
      averageTotalReturnPerStock: 0,
      totalRealizedProfitPercentage: 0,
      averageRealizedReturnPerStock: 0,
      averageUnrealizedReturnPerStock: 0,
      totalUnrealizedProfitPercentage: 0,
    };
  }

  const totalCurrentValue = data.reduce((sum, stock) => sum + stock.currentValue, 0);
  const totalUnrealizedProfit = data.reduce((sum, stock) => sum + stock.unrealizedProfit, 0);
  const totalRealizedProfit = data.reduce((sum, stock) => sum + (stock.realizedProfit || 0), 0);
  const totalProfit = totalUnrealizedProfit + totalRealizedProfit;

  // Calculate invested amount (current value minus unrealized profit)
  const investedAmount = totalCurrentValue - totalUnrealizedProfit;

  // Calculate profit percentages based on invested amount
  const totalUnrealizedProfitPercentage = investedAmount > 0 ? (totalUnrealizedProfit / investedAmount) * 100 : 0;

  const totalRealizedProfitPercentage = investedAmount > 0 ? (totalRealizedProfit / investedAmount) * 100 : 0;

  const totalProfitPercentage = investedAmount > 0 ? (totalProfit / investedAmount) * 100 : 0;

  // Calculate average returns per stock
  const averageUnrealizedReturnPerStock = data.length > 0 ? totalUnrealizedProfit / data.length : 0;

  const averageRealizedReturnPerStock = data.length > 0 ? totalRealizedProfit / data.length : 0;

  const averageTotalReturnPerStock = data.length > 0 ? totalProfit / data.length : 0;

  const gainersCount = data.filter((stock) => stock.unrealizedProfit > 0).length;

  const totalDividends = data.reduce((sum, stock) => sum + (stock.totalDividends || 0), 0);
  const profitWithDividends = totalProfit + totalDividends;
  const totalTodayPnL = data.reduce((sum, stock) => sum + (stock.todayPnL ?? 0), 0);
  const totalPreviousCloseValue = data.reduce((sum, stock) => sum + (stock.previousCloseValue ?? 0), 0);
  const totalTodayPnLPercentage = totalPreviousCloseValue > 0 ? (totalTodayPnL / totalPreviousCloseValue) * 100 : 0;

  return {
    totalProfit,
    stocksCount: data.length,
    gainersCount,
    totalDividends,
    investedAmount,
    totalCurrentValue,
    totalRealizedProfit,
    profitWithDividends,
    totalUnrealizedProfit,
    totalTodayPnL,
    totalProfitPercentage,
    totalTodayPnLPercentage,
    totalPreviousCloseValue,
    averageTotalReturnPerStock,
    totalRealizedProfitPercentage,
    averageRealizedReturnPerStock,
    totalUnrealizedProfitPercentage,
    averageUnrealizedReturnPerStock,
  };
};
