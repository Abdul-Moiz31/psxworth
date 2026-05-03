import { StockPrices } from "@/actions/stockPrice/interfaces/stockPriceInterfaces";
import { getLatestAllStocksPrices } from "@/actions/stockPrice/stockPriceActions";

export async function fetchLatestAllStockPrices(): Promise<StockPrices> {
  const response = await getLatestAllStocksPrices();

  if (!response.success || !response.data) {
    throw new Error(response.message || "Unable to fetch stock prices");
  }

  return response.data as StockPrices;
}
