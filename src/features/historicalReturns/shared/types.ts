export interface HistoricalPrice {
  symbol: string;
  date: Date;
  close: number | null;
  adjustedClose: number | null; //This is null in database yet.
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
}

export interface HistoricalPricesBySymbol {
  [symbol: string]: HistoricalPrice[];
}

export interface HistoricalReturnsData {
  date: Date;
  return: number; // Percentage
  portfolioValue: number;
}

export interface HistoricalReturnsResponse {
  data: HistoricalReturnsData[];
  returnType: ReturnType;
  scope: Scope;
  stockSymbol?: string; // Only present when scope is "stock"
}

export interface CashFlow {
  date: Date;
  amount: number; // Negative for deposits (buys), positive for withdrawals (sells)
  stockSymbol?: string;
}

export interface PortfolioValuePoint {
  date: Date;
  portfolioValue: number;
  holdings: {
    [stockSymbol: string]: {
      shares: number;
      value: number;
      price: number | null;
    };
  };
  cashFlows: {
    date: Date;
    amount: number; // Negative for buys (money going out), positive for sells (money coming in)
    stockSymbol?: string;
  }[];
}

export type ReturnType = "twr" | "mwr" | "simple";
export type Scope = "portfolio" | "stock";
export type TimePeriodPreset = "7d" | "30d" | "6m" | "custom";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type StockPerformance = {
  [symbol: string]: {
    totalShares: number;
    totalCost: number;
    averageCost: number;
    totalInflow: number;
    totalOutflow: number;
  };
};

export interface ReturnPoint {
  date: Date;
  return: number; // Cumulative return as a percentage (TWR or MWR)
  portfolioValue: number;
}

export interface HistoricalReturnsParams {
  portfolioId: number;
  startDate: Date;
  endDate: Date;
  returnType: ReturnType;
  scope: Scope;
  stockSymbol?: string;
}
