import { STOCKS_INFO } from "@/utils/constants/stockSymbols";

/**
 * Checks if a stock symbol exists in the valid stock symbols list
 * @param stockSymbol The stock symbol to validate
 * @returns boolean indicating if the stock symbol is valid
 */
export function isValidStockSymbol(stockSymbol: string): boolean {
  return STOCKS_INFO.some((stock) => stock.symbol === stockSymbol);
}

/**
 * Formats a time in seconds to a human readable format
 * @param s The time in seconds
 * @returns The time in a human readable format
 */
export const formatTime = (s: number) =>
  s < 60 ? `${s}s` : s < 3600 ? `${Math.ceil(s / 60)}m` : `${Math.ceil(s / 3600)}h`;
