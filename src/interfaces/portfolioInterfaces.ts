import { StockPerformance } from "@/db/schema";

export interface StockDetailedPerformance extends StockPerformance {
  totalProfit: number;
  currentValue: number;
  currentPrice: number;
  previousCloseValue: number | null;
  unrealizedProfit: number;
  sinceAverageBuyPrice: number;
  todayPnL: number | null;
  todayPnLPercentage: number | null;
  totalProfitPercentage: number;
  totalProfitWithDividends: number;
  unrealizedProfitPercentage: number;
  sinceAverageBuyPricePercentage: number;
  totalProfitWithDividendsPercentage: number;
}
